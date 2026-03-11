// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import vitePluginFtp from 'vite-plugin-ftp'

const isFtp = process.argv.includes('--ftp')

export const ftpPlugin = [
	...((isFtp) ? [vitePluginFtp(templateConfig.ftp)] : [])
]


