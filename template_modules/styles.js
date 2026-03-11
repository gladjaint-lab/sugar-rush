// Налаштування шаблону
import templateConfig from '../template.config.js'
// PostCSS
import postcss from 'postcss';
// TailWind
import tailwindcss from '@tailwindcss/vite'
// Групування медіа-запитів
import combineMediaQuery from 'postcss-combine-media-query';
import sortMediaQueries from 'postcss-sort-media-queries';
// Оптимізація
import cssnano from 'cssnano';

import { normalizePath } from 'vite'
import { globSync } from 'glob'
import fs from 'fs'
import logger from './logger.js';

const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')
const isAssets = templateConfig.server.isassets || isWp ? `assets/` : ``

const pathPrefix = isWp ? `src/components/wordpress/fls-theme/build/${isAssets}` : `dist/${isAssets}`

const pathToFiles = `${pathPrefix}css/*.css`
const pathToDev = `${pathPrefix}css/dev`
const pathToOptimize = `${pathPrefix}css`

export const stylesPlugins = [
	// Підключення плагіну Tailwind
	...((templateConfig.styles.tailwindcss) ? [tailwindcss()] : []),
	// Заміна PX на REM
	...((isProduction && templateConfig.styles.pxtorem) ? [{
		name: "css-pxtorem",
		apply: 'build',
		enforce: 'pre',
		closeBundle: {
			order: 'pre',
			handler: async () => {
				const cssFiles = globSync(pathToFiles)
				cssFiles.forEach(async cssFile => {
					let content = fs.readFileSync(cssFile, 'utf-8');
					content = content.replace(new RegExp(/\d+(\.\d+)?px/, "g"), (data) => {
						let value = `${parseFloat(data) / 16}rem`
						return value
					})
					fs.writeFileSync(cssFile, content, 'utf-8');
				});
			}
		}
	}] : []),
	// Групування Media-запитів
	...((isProduction) ? [{
		name: "css-combine-media-query",
		apply: 'build',
		enforce: 'pre',
		closeBundle: {
			order: 'pre',
			handler: async () => {
				const cssFiles = globSync(pathToOptimize)
				cssFiles.forEach((cssFile) => {
					fs.readdirSync(cssFile).filter((filename) => /\.css$/.test(filename)).map((filename) => combineMediaQueries(`${cssFile}/${filename}`))
				});
				function combineMediaQueries(filePath) {
					const css = fs.readFileSync(filePath, 'utf8');
					const devFile = postcss()
						.use(combineMediaQuery())
						.use(sortMediaQueries({ sort: 'desktop-first' }))
						.process(css, { from: filePath });
					fs.writeFileSync(filePath, devFile.css, 'utf8');
				}
			}
		}
	}] : []),
	...((isProduction && isWp) ? [{
		name: "wp-css-fonts-path",
		apply: 'build',
		enforce: 'pre',
		closeBundle: {
			order: 'pre',
			handler: () => {
				const cssFiles = globSync(pathToFiles)
				if (cssFiles.length) {
					cssFiles.forEach(async (cssFile) => {
						const cssFileCode = fs.readFileSync(cssFile, 'utf-8')
						const reg = /\/assets\/fonts\//g
						fs.writeFileSync(cssFile, cssFileCode.replace(reg, '/assets/fonts/'), 'utf8')
					})
				}
				if (templateConfig.fonts.download) {
					let cssCode = fs.readFileSync(`${pathToOptimize}/webfonts.min.css`, 'utf8')
					cssCode = cssCode.replace(/src:\s*url\(\s*fonts/gi, `src:url(/wp-content/themes/fls-theme/build/assets/fonts/`)
					fs.writeFileSync(`${pathToOptimize}/webfonts.min.css`, cssCode, 'utf8');
				}
			}
		}
	}] : []),
	...((isProduction && templateConfig.fonts.download && !isWp) ? [{
		name: "css-download-path",
		apply: 'build',
		enforce: 'pre',
		closeBundle: {
			order: 'pre',
			handler: () => {
				let cssCode = fs.readFileSync(`dist/${isAssets}css/webfonts.min.css`, 'utf8')
				cssCode = cssCode.replace(/src:\s*url\(\s*fonts/gi, `src:url(${templateConfig.server.path === './' ? '../' : '/'}assets/fonts`)
				fs.writeFileSync(`dist/${isAssets}css/webfonts.min.css`, cssCode, 'utf8');
			}
		}
	}] : []),
	// Створення копії файлу(лів) для розробніків
	...((isProduction && templateConfig.styles.devfiles) ? [{
		name: "css-devfiles",
		apply: 'build',
		enforce: 'pre',
		closeBundle: {
			order: 'pre',
			handler: () => {
				const cssFiles = globSync(pathToFiles)
				if (cssFiles.length) {
					!fs.existsSync(pathToDev) && templateConfig.styles.codesplit ? fs.mkdirSync(pathToDev) : null
					cssFiles.forEach(async (cssFile) => {
						cssFile = normalizePath(cssFile)
						let devCssFile = cssFile.replace('.min', '')
						templateConfig.styles.codesplit ? devCssFile = devCssFile.replace('/css/', '/css/dev/') : null
						fs.copyFileSync(cssFile, devCssFile)
						const cssCode = fs.readFileSync(cssFile, 'utf8');
						const cssFileMin = await postcss().use(cssnano()).process(cssCode, { from: cssFile });
						fs.writeFileSync(cssFile, cssFileMin.css, 'utf8');
					});
					logger('_IMG_CSS_DEV_DONE')
				}
			}
		}
	}] : [])

]
// Повідомлення
templateConfig.styles.tailwindcss ? logger(`Tailwind підключений`) : null