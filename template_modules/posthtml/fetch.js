import isUrl from 'is-url'
import { resolve as resolvePath } from 'node:path'
import { readFile } from 'node:fs/promises'
import { ofetch } from 'ofetch'
import posthtml from 'posthtml'
import { defu as merge } from 'defu'
import matcher from 'posthtml-match-helper'
import expressions from 'posthtml-expressions'
import replaceAliases from './aliases.js'
import { platform } from 'node:os'

export default (options = {}) => async (tree) => {
	options = {
		ofetch: {},
		attribute: 'url',
		expressions: {},
		preserveTag: false,
		tags: ['fetch', 'remote'],
		...options,
	}

	const processNode = async (node) => {
		if (!node.attrs?.[options.attribute]) {
			return node
		}

		let url = options.ofetch.url || node.attrs[options.attribute]
		let content = tree.render(node)


		if (options.plugins?.before) {
			const beforePlugins = Array.isArray(options.plugins.before) ? options.plugins.before : [options.plugins.before]
			content = (await posthtml(beforePlugins).process(content)).html
		}

		let response
		if (isUrl(url)) {
			try {
				response = await ofetch(url, options.ofetch)
				response = Array.isArray(response) ? JSON.stringify(response) : response
				response = { body: response }
			} catch (error) {
				console.error(`Failed to fetch URL ${url}:`, error)
				response = { body: undefined }
			}
		} else {
			url = !url.startsWith('src') ? `src/${url}` : url
			try {
				const filePath = resolvePath(url)
				const fileContent = await readFile(filePath, 'utf8')
				response = { body: fileContent }
			} catch (error) {
				console.error(`Failed to load local file ${url}:`, error)
				response = { body: undefined }
			}
		}
		let locals = {}
		if (response.body) {
			try {
				locals.response = JSON.parse(response.body)
				locals.response = replaceAliases(locals.response)
				const expressionPlugin = expressions(merge(options.expressions, { locals }))
				content = (await posthtml([expressionPlugin]).process(tree.render(node.content))).html
			} catch (error) {
				console.error('Error processing expressions:', error)
				content = tree.render(node.content)
			}
		} else {
			console.warn('No response body, using original content')
			content = tree.render(node.content)
		}

		node.content = content

		if (options.plugins?.after) {
			const afterPlugins = Array.isArray(options.plugins.after) ? options.plugins.after : [options.plugins.after]
			try {
				content = (await posthtml(afterPlugins).process(tree.render(node))).html
				const [item] = (await posthtml(afterPlugins).process(content)).tree
				Object.assign(node, typeof item === 'string' ? { content: [item] } : item)
			} catch (error) {
				console.error('Error in after plugins:', error)
			}
		}

		if (!options.preserveTag) {
			node.tag = false
		}

		return node
	}

	const promises = []
	tree.match(matcher(options.tags.join(',')), (node) => {
		promises.push(processNode(node))
		return node
	})

	await Promise.all(promises)
	return tree
}