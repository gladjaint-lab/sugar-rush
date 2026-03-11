// Налаштування шаблону
import templateConfig from '../template.config.js'
import logger from './logger.js'
import { Glob, globSync } from 'glob'
import fs from 'fs'
import { cp } from 'fs/promises'
import { normalizePath } from 'vite'

// PHP сервер
import phpServer from 'php-server';
// Підключеня файлів в PHP-файли теми
import wpAssetsInclude from './wordpress/assets-include.js'

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')

export const phpPlugins = [
	// PHP-сервер
	...((templateConfig.php.enable) ? [{
		name: 'php-server',
		async configureServer(server) {
			const phpRun = await phpServer({
				hostname: templateConfig.php.hostname,
				base: templateConfig.php.base,
				binary: templateConfig.php.binary,
				port: templateConfig.php.port,
				ini: templateConfig.php.ini,
				open: false
			});
			logger('PHP-сервер запущений')
		}
	}] : []),
	// Копіювати використані PHP-файли в dist
	...((isProduction) ? [{
		name: 'copy-php-to-dist',
		apply: 'build',
		enforce: 'pre',
		writeBundle: () => {
			const htmlFiles = globSync(`dist/*.html`)
			const regex = new RegExp(`\\bphp/sendmail\\b`, 'gi')
			let copy = false
			htmlFiles.forEach(htmlFile => {
				let htmlFileCode = fs.readFileSync(htmlFile, 'utf-8')
				if (regex.test(htmlFileCode)) {
					if (!copy) {
						copyFolder('src/php/sendmail')
						copy = true
					}
					htmlFileCode = htmlFileCode.replace(regex, '/sendmail')
					fs.writeFileSync(htmlFile, htmlFileCode)
				}
			})
		}
	}] : []),
	...((isWp && isProduction && templateConfig.images.svgsprite) ? [{
		name: 'path-to-sprite',
		apply: 'build',
		enforce: 'post',
		writeBundle: async () => {
			wpPathToSprite()
		}
	}] : []),
	...((isWp && isProduction) ? [{
		name: 'add-assets-to-theme',
		apply: 'build',
		enforce: 'post',
		writeBundle: () => {
			wpAssetsInclude()
		}
	}] : []),
	...((isWp && !isProduction) ? [{
		...wpAssetsInclude()
	}] : []),
	...((isWp) ? [{
		...insertModules(),
		...insertStyles()
	}] : []),
	...((isWp) ? [{
		name: 'wp-insert-modules',
		handleHotUpdate({ file }) {
			if (file.endsWith('.php') || file.includes('fls-theme')) {
				insertModules()
			}
		}
	}] : []),
]

async function insertModules() {
	const modules = new Set()
	const phpFiles = new globSync(`src/components/wordpress/fls-theme/**/*.php`)
	const moduleJSFiles = new Glob(`src/components/**/*.js`, { ignore: ['**/_*.*', '**/plugins/**', '**/pages/**', '**/wordpress/**'] })
	const modulePlugins = new Map()

	for (let moduleJSFile of moduleJSFiles) {
		moduleJSFile = normalizePath(moduleJSFile).replace('src', '')
		const moduleName = moduleJSFile.split('/').pop().replace('.js', '')
		const pluginFiles = globSync(`src/components/*/${moduleName}/plugins/**/*.js`)
		modulePlugins.set(moduleName, pluginFiles.map(plugin => normalizePath(plugin).replace('src', '')))
	}

	for (let file of phpFiles) {
		let html = fs.readFileSync(file, 'UTF-8')
		findModule(html)
	}

	function findModule(html) {
		for (let moduleJSFile of moduleJSFiles) {
			moduleJSFile = normalizePath(moduleJSFile).replace('src', '')
			const moduleName = moduleJSFile.split('/').pop().replace('.js', '')
			const regex = new RegExp(`\\bdata-fls-${moduleName}\\b`)
			if (regex.test(html)) {
				modules.add(`import '${moduleJSFile}'`)
				// Перевіряємо, чи є плагіни для цього модуля
				const curentModulePlugins = modulePlugins.get(moduleName)
				if (curentModulePlugins) {
					curentModulePlugins.forEach(curentModulePlugin => {
						const pluginName = curentModulePlugin.split('/').pop().replace('.js', '')
						const pluginRegex = new RegExp(`\\bdata-fls-${moduleName}-${pluginName}\\b`)
						if (pluginRegex.test(html)) {
							modules.add(`import '${curentModulePlugin}'`)
						}
					})
				}
			}

		}
	}

	fs.writeFile('src/components/wordpress/fls-wp-modules.js', Array.from(modules).join('\n'), () => { })
}
async function insertStyles() {
	const styles = []
	styles.push(templateConfig.styles.tailwindcss ? `import '@styles/libs/tailwind.css'` : `import '@styles/libs/reset.css'`)
	styles.push(`import '@styles/style.scss'`)
	fs.writeFile('src/components/wordpress/fls-wp-styles.js', styles.join('\n'), () => { })
}
function copyFolder(dir) {
	try {
		cp(dir, dir.replace('src/php/', 'dist/'), {
			recursive: true,
			force: false,
			preserveTimestamps: true,
		});
	} catch (error) {
		console.log(error);
	}
}
function wpPathToSprite() {
	const phpFiles = new globSync(`src/components/wordpress/fls-theme/*.php`)
	phpFiles.forEach(phpFile => {
		let content = fs.readFileSync(phpFile, 'utf-8')
		// Шлихи SVG-спрайту
		if (content.includes('xlink:href="#')) {
			content = content.replace(new RegExp('xlink:href="#', 'gi'), `xlink:href="/wp-content/themes/fls-theme/assets/img/spritemap.svg#`)
		}
		fs.writeFileSync(phpFile, content, 'utf-8');
	})
}