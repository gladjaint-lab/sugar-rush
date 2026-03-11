// Підключення функціоналу "Чортоги Фрілансера"
import { addTouchAttr, bodyLockStatus, bodyLockToggle, FLS } from "@js/common/functions.js"

import Chart from 'chart.js/auto';

import "./chart.scss"

function chartInit() {
	const chartItem = document.querySelector('[data-fls-chart]')

	const labels = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень'];
	const data = {
		labels: labels,
		datasets: [
			{
				label: 'Дані №1',
				data: [1, 5, 8, 2, 10, 3, 4],
				borderColor: 'blue',
				backgroundColor: 'blue',
			},
			{
				label: 'Дані №2',
				data: [7, 4, 12, 15, 2, 8, 5],
				borderColor: 'yellow',
				backgroundColor: 'yellow',
			}
		]
	};

	new Chart(chartItem, {
		type: 'line',
		data: data,
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: 'bottom',
				},
				title: {
					display: true,
					text: 'Приклад графіку'
				}
			}
		},
	});

}
document.querySelector('[data-fls-chart]') ?
	window.addEventListener('load', chartInit) : null