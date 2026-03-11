// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import PluginCritical from 'rollup-plugin-critical';

import { normalizePath } from 'vite'
import { globSync } from 'glob'

const criticalPages = []

globSync('dist/*.html').forEach((file) => {
	file = normalizePath(file)
	criticalPages.push({
		uri: file,
		template: file.replace('dist/', '').replace('.html', '')
	})
})

export const rollupPlugins = [
	// Генерація критичних стилів
	...((templateConfig.styles.critical) ?
		[PluginCritical({
			criticalUrl: './',
			criticalBase: './dist/',
			criticalPages: criticalPages,
			criticalConfig: {
				width: 1920,
				height: 1080,
				inline: true,
			},
		})] : []),
]