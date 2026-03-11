// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import { globSync } from 'glob'
import fs from 'node:fs';
import { normalizePath } from 'vite'

const isProduction = process.env.NODE_ENV === 'production'

export function navPanel() {
	const htmlFiles = globSync('./src/*.html', { ignore: [`./src/${templateConfig.devcomponents.filename}`] })
	const isIconFont = fs.existsSync('src/assets/svgicons/preview/iconfont.html')
	if (htmlFiles.length > 1 || isIconFont || templateConfig.projectpage.enable || (templateConfig.devcomponents.enable && !isProduction)) {
		let menu = `<ul id="fls-dev-panel">`
		htmlFiles.forEach(async htmlFile => {
			htmlFile = normalizePath(htmlFile)
			const href = htmlFile.replace('src/', '')
			const name = href.replace('.html', '')
			menu += `<li><a href="${href}">${name}</a></li>`
		});
		if (!isProduction) {
			templateConfig.projectpage.enable ? menu += `<li><hr></li><li><a target="_blank" href="${templateConfig.projectpage.template.replace('src', '')}">Шаблон сторінки проєкту</a></li>` : ''
			isIconFont ? menu += `<li><hr></li><li><a target="_blank" href="/assets/svgicons/preview/iconfont.html">Іконковий шрифт</a></li>` : ''
			templateConfig.devcomponents.enable ? menu += `<li><hr></li><li><a target="_blank" href="${templateConfig.devcomponents.filename}">Розробка компонентів</a></li>` : ''
		}
		menu += `</ul>`
		menu += `<style>
			#fls-dev-panel{
				position: fixed;
				${templateConfig.navpanel.position === 'left' ? 'left: 10px;' : 'right: 10px;'}
				${templateConfig.navpanel.position === 'left' ? 'padding: 15px 25px 15px 15px;' : 'padding: 15px 15px 15px 25px;'}
				${templateConfig.navpanel.position === 'left' ? 'border-radius: 0 10px 10px 0;' : 'border-radius: 10px 0 0 10px;'}
				top: 10%;
				color: ${templateConfig.navpanel.color};
				background-color: ${templateConfig.navpanel.background};
				transform: translate(${templateConfig.navpanel.position === 'left' ? '-100%' : '100%'}, 0px);
				max-height: 80svh;
				overflow: auto;
				transition: all ${templateConfig.navpanel.transition}ms;
				z-index: 9999;
				font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
			}
			#fls-dev-panel li{
				list-style:none;
			}
			#fls-dev-panel hr{
				border-bottom: 1px solid;
			}
			#fls-dev-panel:hover{
				${templateConfig.navpanel.position === 'left' ? 'left: 0px;' : 'right: 0px;'}
				transform: translate(0, 0);
			}
			#fls-dev-panel a{
				text-decoration: none;
				color: inherit;
			}
			#fls-dev-panel a:hover {
				text-decoration: underline;
			}
			#fls-dev-panel li:not(:last-child) {
				margin-bottom: 10px;
			}
		</style>`
		return menu//`<script>window.addEventListener('DOMContentLoaded',()=>{document.body.insertAdjacentHTML('beforeend',\`${menu}\`)});</script>`
	} else {
		return ''
	}
}
