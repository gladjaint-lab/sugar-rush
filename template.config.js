import path from 'path';
const projectName = path.basename(path.resolve()).toLowerCase()

export default {
	lang: 'ua', // Наразі тільки Українська
	vscode: {
		settings: true,
		snippets: true
	},
	devcomponents: {
		enable: false,
		filename: '_components.html'
	},
	newpage: {
		copyfromindex: false,
		usetemplate: 'main'
	},
	git: {
		repo: ``,
		branch: `main`
	},
	navpanel: {
		dev: true,
		build: false,
		position: 'left',
		color: '#ffffff',
		background: 'rgba(51, 51, 51, 0.5)',
		transition: '300'
	},
	statistics: {
		enable: false,
		showonbuild: false
	},
	server: {
		path: './',
		isassets: false,
		buildforlocal: false,
		copyfiles: true,
		version: true,
		hostname: 'localhost',
		port: '1111'
	},
	html: {
		beautify: {
			enable: true,
			indent: "tab"
		}
	},
	styles: {
		tailwindcss: false,
		pxtorem: true,
		critical: false,
		codesplit: true,
		devfiles: true,
	},
	fonts: {
		iconsfont: false,
		download: false
	},
	images: {
		svgsprite: false,
		optimize: {
			enable: true,
			edithtml: true,
			sizes: [600, 1200],
			dpi: [],
			attrignore: 'data-fls-image-ignore',
			modernformat: {
				enable: true,
				type: 'webp', // webp/avif
				only: true,
				quality: 80
			},
			jpeg: {
				quality: 80
			},
			png: {
				quality: 80
			}
		}
	},
	js: {
		hotmodules: true,
		devfiles: true,
		bundle: {
			// Збирає в один JS та один CSS файли
			// незалежно від налаштування
			// styles -> codesplit,
			enable: false,
		},
		react: false,
		vue: false
	},
	php: {
		enable: false,
		base: "./src/php/",
		hostname: 'localhost',
		port: '1110',
		binary: 'C:\\php\\php.exe',
		ini: 'template_modules/assets/php.ini',
	},
	pug: {
		enable: false,
	},
	ftp: {
		host: '127.0.0.1',
		port: 21,
		remoteDir: `/www/.../${projectName}`,
		user: 'root',
		password: '123456',
	},
	logger: {
		// Логи роботи збірки в терміналі
		terminal: true,
		// Логи роботи модулів в консолі
		console: {
			enable: true,
			removeonbuild: true
		}
	},
	projectpage: {
		enable: false,
		projectname: '',
		template: "src/projectpage/projectpage.html",
		outfilename: '',
	},
	aliases: {
		// HTML/SCSS/JS components
		'@components': 'src/components',
		// Scripts
		'@js': 'src/js',
		// Styles
		'@styles': 'src/styles',
		// Media & files
		'@fonts': 'src/assets/fonts',
		'@img': 'src/assets/img',
		'@video': 'src/assets/video',
		'@files': 'src/files',
		// Other
		'@pug': 'src/pug'
	},
	coffee: {
		enable: true,
		text: `(!!)Досить працювати, зроби перерву ☕️`,
		interval: 45
	},
	novaposhta: {
		enable: false,
		key: ''
	}
}