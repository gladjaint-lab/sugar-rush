// Налаштування шаблону
import templateConfig from '../../template.config.js'
import logger from '../logger.js'

import { globSync } from 'glob'
import fs from 'node:fs';
import { normalizePath } from 'vite'

const isProduction = process.env.NODE_ENV === 'production'

export default function wpAssetsInclude() {
	const file = `src/components/wordpress/fls-theme/inc/assets-include.php`
	const moduleType = []
	let data = ``
	data = `<?`
	data += `const VITE_HOST='http://${templateConfig.server.hostname}:${templateConfig.server.port}';`
	data += `function add_vite() {`
	if (isProduction) {
		const jsFiles = globSync(`src/components/wordpress/fls-theme/build/assets/js/*.js`)
		const cssFiles = globSync(`src/components/wordpress/fls-theme/build/assets/css/*.css`)
		const files = [...jsFiles, ...cssFiles]
		files.forEach(file => {
			file = normalizePath(file)
			const fileName = file.split('/').pop()
			if (file.endsWith('.css')) {
				data += `wp_enqueue_style('${fileName}','/wp-content/themes/fls-theme/build/assets/css/${fileName}',array(),null,'all');`
			}
			if (file.endsWith('.js')) {
				data += `wp_enqueue_script('${fileName}','/wp-content/themes/fls-theme/build/assets/js/${fileName}',array(),null,true);`
				moduleType.push(fileName)
			}
		})
		fs.writeFileSync(`src/components/wordpress/fls-theme/build/assets/js/custom.js`, '')
		fs.writeFileSync(`src/components/wordpress/fls-theme/build/assets/css/custom.css`, '')
		data += `wp_enqueue_style('vite-custom-css','/wp-content/themes/fls-theme/build/assets/css/custom.css',array(),null,'all');`
		data += `wp_enqueue_script('vite-custom-js','/wp-content/themes/fls-theme/build/assets/js/custom.js',array(),null,true);`
	} else {
		data += `wp_enqueue_script('vite-client',VITE_HOST.'/@vite/client',array(),null,true);`
		data += `wp_enqueue_script('vite-app',VITE_HOST.'/components/wordpress/fls-theme/app.js',array(),null,true);`

		if (templateConfig.images.svgsprite) {
			data += `wp_enqueue_script('vite-sprite',VITE_HOST.'/@vite-plugin-svg-spritemap/client__spritemap',array(),null,true);`
			moduleType.push('vite-sprite')
		}

		moduleType.push('vite-client')
		moduleType.push('vite-app')
	}
	data += `};`
	data += `add_action('wp_enqueue_scripts', 'add_vite');`
	data += `function add_type_module_attribute($tag, $handle) {`
	data += `if (`
	moduleType.forEach((element, i) => {
		data += `${i ? ' ||' : ''} '${element}' === $handle`
	});
	data += `) {`
	data += `return str_replace('<script', '<script type="module"', $tag);`
	data += `};`
	data += `return $tag;`
	data += `};`
	data += `add_filter('script_loader_tag', 'add_type_module_attribute', 10, 2);`
	data += `?>`
	fs.writeFile(file, data, () => { })

	logger('WordPress запущений')
}
