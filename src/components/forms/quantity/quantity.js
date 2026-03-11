// Підключення функціоналу "Чортоги Фрілансера"
import { FLS } from "@js/common/functions.js";

import './quantity.scss'

export function formQuantity() {
	document.addEventListener("click", quantityActions)
	document.addEventListener("input", quantityActions)
	function quantityActions(e) {
		const type = e.type
		const targetElement = e.target
		if (type === 'click') {
			if (targetElement.closest('[data-fls-quantity-plus]') || targetElement.closest('[data-fls-quantity-minus]')) {
				const valueElement = targetElement.closest('[data-fls-quantity]').querySelector('[data-fls-quantity-value]');
				let value = parseInt(valueElement.value);
				if (targetElement.hasAttribute('data-fls-quantity-plus')) {
					value++;
					if (+valueElement.dataset.flsQuantityMax && +valueElement.dataset.flsQuantityMax < value) {
						value = valueElement.dataset.flsQuantityMax;
					}
				} else {
					--value;
					if (+valueElement.dataset.flsQuantityMin) {
						if (+valueElement.dataset.flsQuantityMin > value) {
							value = valueElement.dataset.flsQuantityMin;
						}
					} else if (value < 1) {
						value = 1;
					}
				}
				targetElement.closest('[data-fls-quantity]').querySelector('[data-fls-quantity-value]').value = value;
			}
		} else if (type === 'input') {
			if (targetElement.closest('[data-fls-quantity-value]')) {
				const valueElement = targetElement.closest('[data-fls-quantity-value]')
				valueElement.value == 0 || (/[^0-9]/gi).test(valueElement.value) ? valueElement.value = 1 : null
			}
		}
	}
}
document.querySelector('[data-fls-quantity]') ?
	window.addEventListener('load', formQuantity) : null