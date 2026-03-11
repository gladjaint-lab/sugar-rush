// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'
import fs from 'fs'
import path from 'node:path'
import { optimize } from 'svgo'
import { readFile, writeFile } from 'fs/promises';

// ---------------------------------------
// import SVGFixer from 'oslllo-svg-fixer'
// ---------------------------------------

// Оптимізація SVG-іконок
export async function svgOptimaze(iconsFiles) {
	const srcDir = 'src/assets/svgicons'
	const distDir = 'src/assets/svgicons/fixed'

	!fs.existsSync(distDir) ? fs.mkdirSync(distDir) : null

	logger('_ICONS_OPT_START')

	// Оптимізація SVG іконок
	// Convert SVG strokes to paths and optimize SVG
	const convertAndOptimizeSvg = async (file, srcDir, distDir) => {
		const filePath = path.join(srcDir, file)
		const outputFilePath = path.join(distDir, file).replace('\\svgicons\\', '\\svgicons\\fixed\\')

		try {
			let outlinedSvg = await readFile(filePath, 'utf8')
			const optimizedSvg = optimize(outlinedSvg, {
				path: outputFilePath,
				plugins: getSvgOptimizationPlugins(),
			})
			await writeFile(outputFilePath, optimizedSvg.data, 'utf8')
		} catch (error) {
			console.error(`Error processing file ${file}:`, error)
		}
	}
	// SVG optimization plugins
	const getSvgOptimizationPlugins = () => [
		{
			name: 'mergePaths',
			params: { force: true, floatPrecision: 3, noSpaceAfterFlags: false }
		},
		// { name: 'removeXMLProcInst', active: true },
		// { name: 'removeUselessDefs', active: true },
		// { name: 'removeEmptyContainers', active: true },
		// { name: 'convertStyleToAttrs', active: true },
		// { name: 'convertPathData', active: true },
		// {
		// 	name: 'removeAttrs',
		// 	params: { attrs: '(stroke|style|fill|clip-path|id|data-name)' },
		// }
	]

	for (let index = 0; index < iconsFiles.length; index++) {
		await convertAndOptimizeSvg(iconsFiles[index], '', '')
	}


	// try {
	// 	await SVGFixer(srcDir, distDir, { throwIfDestinationDoesNotExist: false }).fix().then(() => {
	// 		logger('_ICONS_OPT_END')
	// 	})
	// } catch (err) {
	// 	console.log(err)
	// 	throw err;
	// }
}
