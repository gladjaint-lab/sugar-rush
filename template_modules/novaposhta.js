// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import fs from 'fs'

const KEY = templateConfig.novaposhta.key

async function getData(request, file) {
	const url = 'https://api.novaposhta.ua/v2.0/json/'
	try {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify(request)
		})
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`)
		}
		const responseData = await response.json()
		writeData(responseData.data, file)
	} catch (error) {
		logger(`(!)Помилка запиту даних з НП: ${error.message}`)
	}
}

function writeData(responseData, file) {
	!fs.existsSync('src/files/novaposhta') ? fs.mkdirSync(`src/files/novaposhta`) : null
	if (!fs.existsSync(file)) {
		fs.writeFileSync(file, JSON.stringify(responseData, null, 2))
	}
}

export function novaPoshta() {
	const requestAreas = {
		apiKey: KEY,
		modelName: "AddressGeneral",
		calledMethod: "getCities",
		methodProperties: {}
	}
	const areasFile = `src/files/novaposhta/cities.json`
	getData(requestAreas, areasFile)

	const requestWarehouses = {
		apiKey: KEY,
		modelName: "AddressGeneral",
		calledMethod: "getWarehouses",
		methodProperties: {}
	}
	const warehousesFile = `src/files/novaposhta/warehouses.json`
	getData(requestWarehouses, warehousesFile)

}