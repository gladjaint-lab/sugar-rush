import { defineConfig } from "vite";
import { globSync } from 'glob'
import path from 'path'
import fs from 'fs'

// Налаштування збірки
import templateConfig from './template.config.js'
// Імпортовані модулі
import templateImports from './template_modules/template.imports.js'
// Генерація налаштувань для редактору
templateConfig.vscode.settings ? templateImports.vscodeSettings() : null
// Генерація сніпетів для редактору
templateConfig.vscode.snippets ? templateImports.addSnippets() : null
// Створення сторінки компонентів
templateConfig.devcomponents.enable ? templateImports.createComponentsPage() : null

// Мова повідоблень
const lang = JSON.parse(fs.readFileSync(`./template_modules/languages/${templateConfig.lang}.json`, 'UTF-8'))

// Формування псевдонімів для Vite
const makeAliases = (aliases) => {
	return Object.entries(aliases).reduce((acc, [key, value]) => {
		value = !value.startsWith(`./`) ? `./${value}` : value
		acc[key] = path.resolve(process.cwd(), value)
		return acc
	}, {})
}
const aliases = makeAliases(templateConfig.aliases)
// Логінг
import logger from "./template_modules/logger.js";

const isProduction = process.env.NODE_ENV === 'production'
const isInspect = process.argv.includes('--inspect')
const isWp = process.argv.includes('--wp')
const isGit = process.argv.includes('--git')
const isHost = process.argv.includes('--host')
const isZip = process.argv.includes('--zip')
const isFtp = process.argv.includes('--ftp')

import { ignoredDirs, ignoredFiles } from './template_modules/ignored.js'

import Inspect from 'vite-plugin-inspect'
import { getDev } from './template_modules/main.js'
import qrcode from 'qrcode-terminal'

const isAssets = templateConfig.server.isassets || isWp ? `assets/` : ``

export default defineConfig(({ command, mode, ssrBuild }) => {
	return {
		define: {
			flsLogging: isProduction && templateConfig.logger.console.removeonbuild ? false : templateConfig.logger.console.enable,
			flsLang: isProduction && templateConfig.logger.console.removeonbuild ? false : lang,
			aliases: aliases
		},
		resolve: {
			alias: {
				vue: 'vue/dist/vue.esm-bundler.js',
				...aliases
			},
		},
		base: templateConfig.server.path,
		assetsInclude: ['src/components/**/*.html'],
		clearScreen: true,
		root: path.join(__dirname, "src"),
		logLevel: "silent",
		publicDir: false,
		server: {
			open: isWp ? 'http://localhost:8080' : true,
			host: templateConfig.server.hostname,
			port: templateConfig.server.port,
			proxy: {
				'/php': {
					target: `http://${templateConfig.php.hostname}:${templateConfig.php.port}`,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/php/, ''),
					secure: false,
					ws: true,
					rewriteWsOrigin: true,
				},
			},
			watch: {
				ignored: [
					...ignoredDirs.map(dir => `**/${dir}/**`),
					...ignoredFiles.map(file => `**/${file}/**`),
				],
			}
		},
		plugins: [
			// Робота з HTML
			...templateImports.htmlPlugins,
			// Робота з скриптами
			...templateImports.scriptsPlugins,
			// Робота з зображеннями
			...templateImports.imagePlugins,
			// Робота зі шрифтами
			...templateImports.fontPlugins,
			// Робота з стилями
			...templateImports.stylesPlugins,
			// Робота з PHP
			...templateImports.phpPlugins,
			// Обробка React
			...(templateConfig.js.react ? [templateImports.react()] : []),
			// Обробка Vue
			...(templateConfig.js.vue ? [templateImports.vue()] : []),
			// NovaPoshta
			...(templateConfig.novaposhta.enable ? [templateImports.novaPoshta()] : []),
			// Генерація сторінки проєкту
			...(isProduction && templateConfig.projectpage.enable ? [templateImports.projectPage()] : []),
			// Час для кави
			...(!isProduction && templateConfig.coffee.enable ? [templateImports.coffeeTime()] : []),
			// Копіювання файлів
			...(isProduction && templateConfig.server.copyfiles ? [templateImports.viteStaticCopy({
				targets: [
					{
						src: 'files',
						dest: './',
					},
				],
				silent: true
			})] : []),
			// Робота з статистикою
			...templateImports.statPlugins,
			// Додавання версії файлів
			...(isProduction && templateConfig.server.version ? [{
				//templateImports.addVersion((new Date()).getTime())
				name: "add-version",
				apply: "build",
				transformIndexHtml(html) {
					const version = (new Date()).getTime()
					const regex = /<script[^>]*src\s*=\s*["']([^"']+\.js)["'][^>]*><\/script>|<link[^>]*href\s*=\s*["']([^"']+\.css)["'][^>]*>|<link[^>]*href\s*=\s*["']([^"']+\.js)["'][^>]*>/gi;
					return html.replace(regex, (code) => {
						return code.replace(/\.css"|\.js"/gi, ($0) => {
							return `${$0.replace('"', '')}?v=${version}"`
						})
					})
				},
			}] : []),
			// Оновлення браузеру
			{
				name: 'custom-hmr',
				enforce: 'post',
				handleHotUpdate({ file, server }) {
					if (file.endsWith('.html') || file.endsWith('.json') || file.endsWith('.php') || file.includes('fls-theme')) {
						server.ws.send({ type: 'full-reload', path: '*' })
					}
				},
			},
			// Повідомлення
			{
				name: 'message-dev',
				enforce: 'post',
				configureServer: {
					order: 'post',
					handler: (server) => {
						// Повідомлення навігаційної панелі
						if (!isWp) {
							if (templateConfig.navpanel.dev && !isProduction) {
								logger('_NAVPAN_DONE')
							} else if (templateConfig.navpanel.build && isProduction) {
								logger('_NAVPAN_WARN')
							}
						}
						// Додавання QR-коду в термінал
						if (isHost) {
							setTimeout(() => {
								const urls = server.resolvedUrls || server.network
								for (const key in urls) {
									const element = urls[key];
									if (key === 'local') {
										logger(`_DEV_HOST_ADDRESS`, element[0])
									} else {
										element.forEach(item => {
											logger(`_DEV_HOST_IP_ADDRESS`, item)
											logger(`_DEV_HOST_QRCODE`)
											qrcode.generate(item, { small: true })
										})
									}
								}
								logger(`_DEV_DONE`)
							}, 1000);
						} else {
							logger(`_DEV_HOST_ADDRESS`, isWp ? `http://localhost:8080` : `http://${templateConfig.server.hostname}:${templateConfig.server.port}`)
							logger(`_DEV_DONE`)
						}
					}
				}
			},
			getDev(),
			{
				name: 'message-build',
				apply: 'build',
				enforce: 'post',
				closeBundle: {
					order: 'pre',
					handler: async () => {
						logger(`_BUILD_DONE`)
					}
				},
			},
			...(isInspect ? [Inspect()] : []),
			// Робота з GitHub
			...(isProduction && isGit ? [...templateImports.gitPlugins] : []),
			// Робота з архівом
			...(isProduction && isZip ? [...templateImports.zipPlugin] : []),
			// Робота з FTP
			...(isProduction && isFtp ? [...templateImports.ftpPlugin] : [])
		],
		css: {
			devSourcemap: true,
			preprocessorOptions: {
				scss: {
					//silenceDeprecations: ["mixed-decls"],
					silenceDeprecations: [],
					additionalData: `
						@use "sass:math";
						@use "@styles/includes/index.scss" as *;
					`,
					sourceMap: true,
					quietDeps: true,
					api: 'modern-compiler'
				},
			},
		},
		build: {
			outDir: isWp ? path.join(__dirname, "src/components/wordpress/fls-theme/build") : path.join(__dirname, "dist"),
			emptyOutDir: true,
			manifest: false,
			minify: !templateConfig.js.devfiles,
			cssMinify: !templateConfig.styles.devfiles,
			cssCodeSplit: templateConfig.styles.codesplit,
			assetsInlineLimit: 0,
			rollupOptions: {
				input: isWp ? ['src/components/wordpress/fls-theme/app.js'] : globSync('./src/*.html', { ignore: [`./src/${templateConfig.devcomponents.filename}`] }),
				plugins: [
					templateImports.rollupPlugins
				],
				output: [{
					manualChunks(id) {
						if (templateConfig.js.bundle.enable || templateConfig.server.buildforlocal) {
							return 'app'
						} else {
							if (id.includes('js/custom')) {
								const customName = id.split('/').pop().replace('.js', '')
								return customName
							}
							if (id.includes('/src/js/') && /(^|\/)app(\.js)?$/.test(id.split(path.sep).pop())) {
								return 'common'
							}
						}
					},
					// Налаштування асетів
					assetFileNames: (asset) => {
						let getPath = asset.originalFileNames[0] && asset.names && asset.names.length > 0 ? asset.originalFileNames[0].replace(`/${asset.names[0]}`, '') : ''
						let extType = asset.names && asset.names.length > 0 ? asset.names[0].split('.').pop() : ''
						if (/css/.test(extType)) {
							return templateConfig.js.bundle.enable || templateConfig.server.buildforlocal ? `${isAssets}css/app.min[extname]` : `${isAssets}css/[name].min[extname]`
						} else {
							if (/eot|otf|ttf|woff|woff2/.test(extType)) {
								extType = "assets/fonts";
							} else {
								extType = getPath
							}
							return `${extType}/[name][extname]`; //-[hash]
						}
					},
					entryFileNames(name) {
						return templateConfig.js.bundle.enable || templateConfig.server.buildforlocal ? `${isAssets}js/app.min.js` : `${isAssets}js/[name].min.js`
					},
					chunkFileNames(name) {
						return templateConfig.js.bundle.enable || templateConfig.server.buildforlocal ? `${isAssets}js/app.min.js` : `${isAssets}js/[name].min.js`
					}
				}],
			}
		}
	}
})

