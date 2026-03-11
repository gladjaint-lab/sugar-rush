// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'
import fs from 'fs'
import path from 'path'

export default function createComponentsPage() {
	if (templateConfig.devcomponents.enable && !fs.existsSync(`src/${templateConfig.devcomponents.filename}`)) {
		fs.writeFileSync(`src/${templateConfig.devcomponents.filename}`, `
<!DOCTYPE html>
<html lang="en">
	<include src="@components/layout/head/head.html" locals='{
		"title":"Розробка компонентів", 
		"preloader": {
			"enable":"false",
			"once":"false"
		},
		"keywords":"", 
		"description":""
		}'>
	</include>
	<style>
		.components{
			padding-block: 50px;
			display: flex;
			flex-direction: column;
			gap: 30px;
		}
	</style>
	<body>
		<div class="components">
			<div class="components__container">
				<div class="components__item">

				</div>
			</div>
		</div>
	</body>
	<script type="module" src="@js/app.js"></script>
</html>`)
		logger('Сторінка компонентів створена')
	}
}
