// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'
// SVG-спрайт
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap'
// Робота с зображеннями
import sharp from 'sharp';
import { imageSize } from 'image-size'

import replaceAsync from "string-replace-async";

import { normalizePath } from 'vite'
import { globSync } from 'glob'
import fs from 'fs'
import path from 'path'
import { cp } from 'fs/promises'

import { svgOptimaze } from './svgoptimaze.js'

const iconsFiles = globSync('src/assets/svgicons/*.svg')
const isProduction = process.env.NODE_ENV === 'production'
const isWp = process.argv.includes('--wp')
const isAssets = templateConfig.server.isassets || isWp ? `assets/` : ``

let uniqImages = new Set()
let copyIgnore = new Set()

export const imagePlugins = [
	// SVG-спрайт
	//(iconsFiles.length && templateConfig.images.svgsprite && !templateConfig.fonts.iconsfont) ? await svgOptimaze() : [],
	(iconsFiles.length && templateConfig.images.svgsprite) ? [
		...VitePluginSvgSpritemap('assets/svgicons/*.svg', {
			prefix: 'sprite-',
			route: '__spritemap',
			output: {
				use: true,
				view: true,
				filename: 'img/[name][extname]',
				name: 'spritemap.svg'
			},
			injectSvgOnDev: true,
			svgo: {
				plugins: [
					{
						name: 'removeStyleElement',
					},
				],
			},
			styles: {
				lang: 'scss',
				filename: 'styles/includes/spritemap.scss',
				include: ['mixin', 'variables'],
				names: {
					prefix: 'sprites-prefix',
					sprites: 'sprites',
					mixin: 'sprite',
				}
			}
			// idify: (name, svg) => `sprite-${name}`,
		})] : [],
	// Робота с зображеннями
	...((isProduction && !isWp) ? [{
		name: "images",
		apply: 'build',
		enforce: 'pre',
		writeBundle: {
			order: 'pre',
			handler: async ({ dir }) => {
				logger(`_IMG_START`)
				!fs.existsSync(`dist/assets`) ? fs.mkdirSync('dist/assets') : null
				!fs.existsSync('dist/assets/img') ? fs.mkdirSync('dist/assets/img') : null
				if (templateConfig.images.optimize.enable) {
					const files = globSync([`${dir}/*.html`, `${dir}/${isAssets}js/*.js`, `${dir}/${isAssets}css/*.css`])
					for (const file of files) {
						let content = fs.readFileSync(file, 'utf-8')
						if (file.endsWith('.html') || file.endsWith('.js')) {
							const attrIgnore = templateConfig.images.optimize.attrignore
							let ignoreSizes = false;
							// Обробка зображень які вказані в srcset тегів SOURCE
							content = await replaceAsync(content, /<source\s[^>]*srcset=["']([^"']+\.(jpg|jpeg|avif|png|gif|webp))["'][^>]*>/gi, async (data, url) => {
								return await returnUrl(data, url)
							})
							// Обробка зображень які вказані в src тегів IMG
							content = await replaceAsync(content, new RegExp(`<img(?![^>]*\\s${attrIgnore})[^>]*>`, 'gi'), async (data) => {
								const regex = /([\w-]+)\s*=\s*"([^"]*)"/g
								let match, imagePath, sizesAttr
								let attributes = ``
								while ((match = regex.exec(data)) !== null) {
									const [key, value] = [match[1], match[2]]
									if (key === 'data-fls-image-sizes-ignore') {
										ignoreSizes = true
									} else if (key === 'data-fls-image-sizes') {
										sizesAttr = value
									} else if (key === 'src') {
										imagePath = value
									} else {
										attributes += `${key}="${value}" `
									}
								}
								if (!imagePath) return data;

								sizesAttr = !ignoreSizes ? sizesAttr ? sizesAttr.split(',') : templateConfig.images.optimize.sizes : []
								const dpi = templateConfig.images.optimize.dpi

								imagePath = imagePath.startsWith('./') ? imagePath.replace('./', '/') : imagePath
								const fullImagePath = `src${imagePath}`;

								if (fs.existsSync(fullImagePath)) {
									const extType = imagePath.split('.').pop().toLowerCase();
									if (/^(png|webp|avif|jpe?g|gif|tiff|bmp|ico)$/i.test(extType)) {
										const newHtmlCode = await imageResizeInit(fullImagePath, sizesAttr, dpi, extType, attributes, file.endsWith('.html') ? 'html' : 'js')
										return templateConfig.images.optimize.edithtml ? newHtmlCode : data;
									}
								}
								return data;
							})
							// Обробка зображень які вказані в href тегів A
							content = await replaceAsync(content, /<a\s[^>]*href=["']([^"']+\.(jpg|jpeg|avif|png|gif|webp))["'][^>]*>/gi, async (data, url) => {
								return await returnUrl(data, url)
							})
						} else if (file.endsWith('.css')) {
							// Обробка зображень які вказані в url CSS-файлів
							content = await replaceAsync(content, /url\(['"]?(https?:\/\/[^\s'"]+\.(?:jpg|jpeg|png|gif)|[^\s'"]+\.(?:jpg|jpeg|png|gif))['"]?\)/gi, async (data, url) => {
								return await returnUrl(data, url)
							})
						}
						fs.writeFileSync(file, content, 'utf-8');
					}
					const counter = Array.from(uniqImages).length
					counter > 0 ? logger(`_IMG_OPT_DONE`, counter) : null
				}
				await copyOtherImages(copyIgnore)
				logger(`_IMG_DONE`)
			}
		}
	}] : []),
]
// Побудова HTML-структури
async function imageResizeInit(image, sizes, dpi, extType, attr, mode = 'html') {
	const reg = new RegExp('\\.(png|webp|avif|jpeg|jpg|gif)(?=\\s|\\)|"|\'|$)', "gi")
	const isWebpAvif = /avif|webp/i.test(extType)
	const imageoutExt = isWebpAvif || !templateConfig.images.optimize.modernformat.enable ? extType : templateConfig.images.optimize.modernformat.type
	const imageout = image.replace('src/', `dist/`)
	const isNeedPicture = sizes.length || (!isWebpAvif && templateConfig.images.optimize.modernformat.enable && !templateConfig.images.optimize.modernformat.only)
	const imageOutUrl = isWebpAvif || !templateConfig.images.optimize.modernformat.enable ? imageout : imageout.replace(reg, `.${templateConfig.images.optimize.modernformat.type}`)
	const imageSize = getImgSize(image).width
	const imageOptimazeUrl = imageOutUrl.replace('dist/', templateConfig.server.path)
	let templete = ``
	if (mode === 'html' || mode === 'js') {
		isNeedPicture ? templete = `<picture>` : null
		for (let size of sizes) {
			if (imageSize > size) {
				const imageoutSize = imageout.replace(reg, `-${size}.${imageoutExt}`)
				const dpiSizesImages = dpi.length ? await getDpi(+size, dpi, image, imageoutSize, extType, imageoutExt) : null
				await imageResize(+size, image, imageoutSize, extType)
				const imageSizesOptimazeUrl = imageoutSize.replace('dist/', templateConfig.server.path)
				templete += `<source media="(max-width: ${size}px)" srcset="${dpiSizesImages ? dpiSizesImages : imageSizesOptimazeUrl}" type="image/${imageoutExt}">`
			}
		}
		const dpiImages = dpi.length ? await getDpi(null, dpi, image, imageOutUrl, extType, imageoutExt) : null
		await imageResize(null, image, imageOutUrl, extType)
		if (templateConfig.images.optimize.modernformat.only || isWebpAvif) {
			templete += `<img ${attr} src="${imageOptimazeUrl}" ${dpiImages ? `srcset="${dpiImages}"` : ``}>`
		} else {
			!isWebpAvif ? templete += `<source srcset="${dpiImages ? dpiImages : imageOptimazeUrl}" type="image/${imageoutExt}">` : null
			templete += `<img ${attr} src="${imageOptimazeUrl}">`
		}
		isNeedPicture ? templete += `</picture>` : null
	} else {
		await imageResize([], image, imageOutUrl, extType)
		templete += `${imageOptimazeUrl}`
	}

	const uniqItem = imageOptimazeUrl.split('assets/img/').pop()
	uniqImages.add(uniqItem)

	if (templateConfig.images.optimize.modernformat.enable && templateConfig.images.optimize.modernformat.only && !isWebpAvif) {
		const deleteItem = image.split('assets/img/').pop()
		imageDelete(`dist/assets/img/${deleteItem}`, isWebpAvif)
	}
	return templete

}
// Конвертація та зміна розмірів зображень
async function imageResize(size, image, imageout, extType) {
	let pipeline = sharp(image, { animated: true }).resize(size);

	if (templateConfig.images.optimize.modernformat.enable && templateConfig.images.optimize.modernformat.type === 'webp') {
		pipeline = pipeline.webp({ quality: templateConfig.images.optimize.modernformat.quality || 80 });
	} else if (templateConfig.images.optimize.modernformat.enable && templateConfig.images.optimize.modernformat.type === 'avif') {
		pipeline = pipeline.avif({ quality: templateConfig.images.optimize.modernformat.quality || 80 });
	} else if (/png/i.test(extType)) {
		pipeline = pipeline.png({ quality: templateConfig.images.optimize.png.quality || 80 });
	} else if (/jpe?g/i.test(extType)) {
		pipeline = pipeline.jpeg({ quality: templateConfig.images.optimize.jpeg.quality || 80 });
	}

	let directoryPath = path.dirname(imageout)
	const reg = new RegExp('\\./|//', "gi")
	directoryPath = directoryPath.replace(reg, '/')
	!fs.existsSync(directoryPath) ? fs.mkdirSync(directoryPath) : null

	// Чекаємо завершення .toFile()
	await pipeline.toFile(imageout);

	if (!size) {
		copyIgnore.add(imageout.replace('dist', ''));
	}
}
// Повернення шляху
async function returnUrl(data, url) {
	let inset
	if (url.startsWith('../')) {
		url = url.replace('../', '')
		inset = true
	}
	if (fs.existsSync(`src/${isAssets}${url}`)) {
		let imageLine = await imageResizeInit(`src/${isAssets}${url}`, [], [], url.split('.').pop(), null, 'url')
		imageLine = isAssets ? imageLine.replace('assets/img', 'img') : imageLine
		imageLine = imageLine.replace('//', '/')
		if (imageLine.startsWith('././')) {
			inset = true
		}
		return data.replace(url, inset ? imageLine.replace('./', '') : imageLine)
	} else {
		return data
	}
}
// Видалення зайвих файлів
function imageDelete(image) {
	copyIgnore.add(image.replace('dist', ''))
	fs.existsSync(image) ? fs.unlinkSync(image) : null
}
// Копіювання папки img
async function copyOtherImages(copyIgnore) {
	copyIgnore = Array.from(copyIgnore)
	try {
		cp('src/assets/img', 'dist/assets/img', {
			recursive: true,
			force: false,
			preserveTimestamps: true,
			filter: (file) => {
				file = normalizePath(file)
				for (const item of copyIgnore) {
					if (file.includes(item)) {
						return false
					}
				}
				return true
			}
		});
	} catch (error) {
		logger(`_IMG_COPY_ERR`, error);
	}
}
async function getDpi(size, dpi, image, imageOutUrl, extType, imageoutExt) {
	const dpiImages = []
	await imageResize(size, image, imageOutUrl, extType)
	const imageOptimazeUrl = imageOutUrl.replace('dist/', templateConfig.server.path)
	dpiImages.push(`${imageOptimazeUrl} 1x`)
	const imageSize = size ? size : getImgSize(image).width
	for (const dpiItem of dpi) {
		const dpiSize = dpiItem * imageSize
		const newImageOutUrl = imageOutUrl.replace(`.${imageoutExt}`, `-${dpiItem}x.${imageoutExt}`)
		const imageOptimazeUrl = newImageOutUrl.replace('dist/', templateConfig.server.path)
		await imageResize(dpiSize, image, newImageOutUrl, extType)
		dpiImages.push(`${imageOptimazeUrl} ${dpiItem}x`)
	}
	return dpiImages.join()
}
function getImgSize(image) {
	const buffer = fs.readFileSync(image)
	return imageSize(buffer)
}

