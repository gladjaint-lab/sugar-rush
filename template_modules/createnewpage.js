// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'
import fs from 'fs'
import path from 'path'

async function createFlsPage() {

	const name = process.argv[2].toLowerCase()
	if (!name || /[а-яА-ЯёЁіїєґІЇЄҐ0-9\s\p{P}]/gu.test(name)) {
		logger(`_CREATE_PAGE_ERROR`)
	} else {
		if (fs.existsSync(`src/${name}.html`) || fs.existsSync(`src/components/pages/${name}/${name}.html`)) {
			logger(`_CREATE_PAGE_EXIST`, name)
		} else {
			let indexPage = fs.readFileSync(`src/index.html`, 'utf-8')
			indexPage = indexPage.replace(`@components/pages/index/index.html`, `@components/pages/${name}/${name}.html`)
			const codeForPage = `
<template src="@components/templates/${templateConfig.newpage.usetemplate}/${templateConfig.newpage.usetemplate}.html" locals='{
		"title":"${name}", 
		"lang":"en",
		"preloader": {
			"enable":"false",
			"once":"false"
		},
		"keywords":"", 
		"description":""
	}'>
	<block name="header">
		<include src="@components/layout/header/header.html" locals='{"active":"${name}"}'></include>
	</block>
	<block name="main">
		<include src="@components/pages/${name}/${name}.html" locals='{}'></include>
	</block>
	<block name="footer">
		<include src="@components/layout/footer/footer.html" locals='{}'></include>
	</block>
	<block name="popup"></block>
</template>
			`
			fs.writeFileSync(`src/${name}.html`, templateConfig.newpage.copyfromindex ? indexPage : codeForPage)
			fs.mkdirSync(`src/components/pages/${name}`)
			fs.writeFileSync(`src/components/pages/${name}/${name}.scss`, `.page{\n\t&--${name}{}\n}`)
			fs.writeFileSync(`src/components/pages/${name}/${name}.html`, `<script type="module" src="@components/pages/${name}/${name}.js"></script>\n<link rel="stylesheet" href="@components/pages/${name}/${name}.scss">\n\n<main class="page page--${name}">\n</main>`)
			fs.writeFileSync(`src/components/pages/${name}/${name}.js`, ``)
			logger(`_CREATE_PAGE_DONE`, name)
		}
	}
}

createFlsPage()
