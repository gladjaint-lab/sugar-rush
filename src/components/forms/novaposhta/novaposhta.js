// Підключення функціоналу "Чортоги Фрілансера"
import { FLS } from "@js/common/functions.js"
// Підключення стилів
import "./novaposhta.scss"

const citiesFile = `files/novaposhta/cities.json`
const warehousesFile = `files/novaposhta/warehouses.json`

async function getData(url) {
	try {
		const response = await fetch(url, { mode: "no-cors" })

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`)
		}
		const responseData = await response.json()
		return responseData
	} catch (error) {
		FLS(`(!)Помилка запиту даних з НП: ${error.message}`)
	}
}
function buildSelect(responseData, type) {
	let template = `<option selected value="">${type === '#np-city' ? 'Населений пункт' : 'Відділення/Поштомат'}</option>`
	responseData.forEach(responseItem => {
		template += `<option value="${responseItem.Ref}">${responseItem.Description}</option>`
	});
	const select = document.querySelector(`${type}`)
	const selectOriginal = document.querySelector(`${type} select`)
	selectOriginal.innerHTML = template
	flsSelect.setOptions(select, selectOriginal)
	type === '#np-point' ? flsSelect.setSelectTitleValue(select, selectOriginal) : null
}
document.addEventListener('selectCallback', async (e) => {
	const select = e.detail.select
	if (select.parentElement.id === 'np-city') {
		const cityRef = select.value
		if (cityRef) {
			const warehouses = await getData(warehousesFile)
			const filteredWarehouses = await warehouses.filter(warehouse => warehouse.CityRef === cityRef)
			if (filteredWarehouses.length) {
				buildSelect(filteredWarehouses, '#np-point')
			}
		}
	}
})
document.addEventListener('input', async (e) => {
	const targetElement = e.target
	if (targetElement.closest('#np-city')) {
		let filteredCities = []
		if (targetElement.value.length) {
			const cities = await getData(citiesFile)
			const inputValue = targetElement.value.toLowerCase()
			filteredCities = cities.filter(city => city.Description.toLowerCase().startsWith(inputValue))
		} else {
			filteredCities = []
		}
		if (filteredCities.length) {
			buildSelect(filteredCities, '#np-city')
		}
	}
})
