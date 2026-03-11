// Підключення з node_modules
import * as noUiSlider from 'nouislider';

// Підключення стилів з scss/base/forms/range.scss 
import './range.scss';

// Підключення стилів з node_modules
// import 'nouislider/dist/nouislider.css';

export function rangeInit() {
	const priceSlider = document.querySelector('[data-fls-range]')
	if (priceSlider) {
		let textFrom = priceSlider.getAttribute('data-fls-range-from')
		let textTo = priceSlider.getAttribute('data-fls-range-to')
		noUiSlider.create(priceSlider, {
			start: 0, // [0,200000]
			connect: [true, false],
			range: {
				'min': [0],
				'max': [200000]
			},
			// format:''
		});

		/*
		const priceFrom = document.querySelector('[data-fls-range-from]')
		const priceTo = document.querySelector('[data-fls-range-to]')
		priceFrom.addEventListener('change', setPriceValues)
		priceTo.addEventListener('change', setPriceValues)
		
		function setPriceValues() {
			let priceStartValue;
			let priceEndValue;
			if (priceStart.value != '') {
				priceStartValue = priceFrom.value;
			}
			if (priceEnd.value != '') {
				priceEndValue = priceTo.value;
			}
			priceSlider.noUiSlider.set([priceStartValue, priceEndValue]);
		}
		*/
	}
}
document.querySelector('[data-fls-range]') ?
	window.addEventListener('load', rangeInit) : null

