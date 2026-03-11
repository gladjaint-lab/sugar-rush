// Налаштування шаблону
import templateConfig from '../template.config.js'
// Генерація налаштувань для редактору
import vscodeSettings from './vscode-settings.js'
// Генерація сніпетів для редактору
import addSnippets from './snippets-generate.js'
// Створення сторінки компонентів
import createComponentsPage from './createcomponentpage.js'
// Генерація сторінки проєкту
import projectPage from './projectpage.js'
// Час для кави
import coffeeTime from './coffeetime.js'
// Генерація QR
import { qrcode } from 'vite-plugin-qrcode';
// React
import react from '@vitejs/plugin-react'
// Vue
import vue from '@vitejs/plugin-vue'
// Робота зі скриптами
import { scriptsPlugins } from './scripts.js'
// Робота зі шрифтами
import { fontPlugins } from "./fonts.js"
// Робота з зображеннями
import { imagePlugins } from "./images.js"
// Робота з HTML
import { htmlPlugins } from "./html.js"
// Робота зі стилями
import { stylesPlugins } from "./styles.js"
// Робота з PHP
import { phpPlugins } from "./php.js"
// Робота з архівом
import { zipPlugin } from "./zip.js"
// Робота з FTP
import { ftpPlugin } from "./ftp.js"
// Плагіни Rollup
import { rollupPlugins } from './rollup-plugins.js'
// Робота з Novaposhta
import { novaPoshta } from './novaposhta.js'
// Робота з Git
import { gitPlugins } from './git.js'
// Копіювання файлів
import { viteStaticCopy } from 'vite-plugin-static-copy'
// Робота з статистикою
import { statPlugins } from './statistics.js'

export default {
	createComponentsPage,
	statPlugins,
	gitPlugins,
	novaPoshta,
	viteStaticCopy,
	projectPage,
	rollupPlugins,
	coffeeTime,
	scriptsPlugins,
	qrcode,
	ftpPlugin,
	zipPlugin,
	addSnippets,
	vscodeSettings,
	fontPlugins,
	imagePlugins,
	htmlPlugins,
	stylesPlugins,
	phpPlugins,
	react,
	vue
}