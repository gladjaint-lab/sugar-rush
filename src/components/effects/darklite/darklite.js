// Підключення функціоналу "Чортоги Фрілансера"
import { isMobile, FLS } from "@js/common/functions.js";

import './darklite.scss'

function getHours() {
	const now = new Date()
	const hours = now.getHours()
	return hours
}

function darkliteInit() {
	// HTML
	const htmlBlock = document.documentElement;

	// Отримуємо збережену тему
	const saveUserTheme = localStorage.getItem('fls-user-theme');

	let userTheme;

	if (document.querySelector('[data-fls-darklite-time]')) {
		// Користувацький проміжок часу
		let customRange = document.querySelector('[data-fls-darklite-time]').dataset.flsDarkliteTime
		customRange = customRange || '18,5'
		const timeFrom = +customRange.split(',')[0]
		const timeTo = +customRange.split(',')[1]
		console.log(timeFrom);
		// Робота з часом
		userTheme = getHours() >= timeFrom && getHours() <= timeTo ? 'dark' : 'light'
	} else {
		// Робота з системними налаштуваннями
		if (window.matchMedia) {
			userTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
			!saveUserTheme ? changeTheme() : null;
		});
	}

	// Зміна теми по кліку
	const themeButton = document.querySelector('[data-fls-darklite-set]')
	const resetButton = document.querySelector('[data-fls-darklite-reset]')

	if (themeButton) {
		themeButton.addEventListener("click", function (e) {
			changeTheme(true);
		})
	}
	if (resetButton) {
		resetButton.addEventListener("click", function (e) {
			localStorage.setItem('fls-user-theme', '');
		})
	}
	// Функція додавання класу теми
	function setThemeClass() {
		htmlBlock.setAttribute(`data-fls-darklite-${saveUserTheme ? saveUserTheme : userTheme}`, '')
	}
	// Додаємо клас теми
	setThemeClass();

	// Функція зміни теми
	function changeTheme(saveTheme = false) {
		let currentTheme = htmlBlock.hasAttribute('data-fls-darklite-light') ? 'light' : 'dark';
		let newTheme;

		if (currentTheme === 'light') {
			newTheme = 'dark';
		} else if (currentTheme === 'dark') {
			newTheme = 'light';
		}
		htmlBlock.removeAttribute(`data-fls-darklite-${currentTheme}`)
		htmlBlock.setAttribute(`data-fls-darklite-${newTheme}`, '')
		saveTheme ? localStorage.setItem('fls-user-theme', newTheme) : null;
	}
}
document.querySelector('[data-fls-darklite]') ?
	window.addEventListener("load", darkliteInit) : null