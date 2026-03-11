import { join as c } from "node:path";
import { compileFile } from "pug";

import templateConfig from '../template.config.js'
const finalAliases = templateConfig.aliases

function pugs(html, pugger, logger) {
	html = html.replace(/<pug.+?(file|src)="(.+?)".*?\/.*?>/gi, (_tag, attr, filename) => {
		return pugger(filename)
	})
	// Aliases
	Object.keys(finalAliases).forEach((alias) => {
		if (html.includes(alias)) {
			finalAliases[alias] = finalAliases[alias].replace(new RegExp(`src`, "g"), ``)
			html = html.replace(new RegExp(alias, "g"), finalAliases[alias])
		}
	})
	return html
}
function f(i, l) {
	return {
		name: "vite-plugin-pug",
		enforce: 'pre',
		handleHotUpdate({ file, server }) {
			file.endsWith(".pug"), server.ws.send({
				type: "full-reload"
			})
		},
		transformIndexHtml: {
			order: 'pre',
			handler: async (html, { server, filename }) => {
				return pugs(html, r => {
					r = 'src' + r
					let g = p => {
						return compileFile(p, i)(l)
					}
					if (typeof i?.localImports == "function" && i.localImports(o) || i?.localImports) {
						let p = filename.replace(/(.*)[\\\/].*\.html$/, "$1"),
							s = c(p, r);
						return g(s)
					}
					return g(r)
				}, server?.config.logger)
			}
		}
	}
}
export { f as default, pugs };

