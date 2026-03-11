// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import zipPack from "vite-plugin-zip-pack";
import path from 'path';

const isTmp = process.argv.includes('--tmp')
const isZip = process.argv.includes('--zip')

const date = new Date()
const formatData =
	(input) => {
		if (input > 9) {
			return input;
		} else return `0${input}`;
	};

const formatHour =
	(input) => {
		if (input > 12) {
			return input - 12;
		}
		return input;
	};

const format = {
	dd: formatData(date.getDate()),
	mm: formatData(date.getMonth() + 1),
	yyyy: date.getFullYear(),
	HH: formatData(date.getHours()),
	hh: formatData(formatHour(date.getHours())),
	MM: formatData(date.getMinutes()),
	SS: formatData(date.getSeconds()),
}
const format24Hour = ({ dd, mm, yyyy, HH, MM, SS }) => {
	return `${dd}-${mm}-${yyyy}_${HH}-${MM}`
}

const inPath = isTmp ? './' : 'dist'
const outName = isTmp ? `flsStart4-${format24Hour(format)}` : path.basename(path.resolve())

export const zipPlugin = [
	...((isZip) ? [zipPack({
		enableLogging: false,
		inDir: inPath,
		outFileName: `${outName}.zip`,
		outDir: 'zip',
		filter: (fileName, filePath, isDirectory) => {
			const dirIgnorePath = !['backend', 'node_modules', 'dist', '.git', 'zip', '.vscode'].includes(filePath)
			const fileIgnorePath = !['TODO.txt', '.gitignore', 'package-lock.json', '_temp.js'].includes(fileName)
			return dirIgnorePath && fileIgnorePath
		},
		done: (err) => {
			err ? logger(`(!!) ${err}`) : logger(`Архів zip/${outName}.zip створений!`)
		}
	})] : [])
]