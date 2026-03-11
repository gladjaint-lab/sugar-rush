// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'
import { globSync } from 'glob'

import ghpages from 'gh-pages'

//const message = process.argv[5].toLowerCase()
/*
function publishToGit() {
	logger(`_GIT_DEPLOY_START`)
	//const files = globSync(`dist/assets/img/*.*`)
	//console.log(files);
	ghpages.publish('dist', {
		branch: templateConfig.git.branch,
		repo: templateConfig.git.repo,
		//message: message
	}, (err) => {
		if (err) {
			logger(`(!!)${err}`)
		} else {
			logger(`_GIT_DEPLOY_DONE`)
		}
	});
}
publishToGit()
*/
export const gitPlugins = [{
	name: "git-deploy",
	apply: 'build',
	enforce: 'post',
	closeBundle: {
		order: 'post',
		handler: async () => {
			logger(`_GIT_DEPLOY_START`)
			//const files = globSync(`dist/assets/img/*.*`)
			//console.log(files);
			ghpages.publish('dist', {
				branch: templateConfig.git.branch,
				repo: templateConfig.git.repo,
				//message: message
			}, (err) => {
				if (err) {
					logger(`(!!)${err}`)
				} else {
					logger(`_GIT_DEPLOY_DONE`)
				}
			});
		}
	}
}]