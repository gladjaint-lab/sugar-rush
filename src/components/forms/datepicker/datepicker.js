// Підключення модуля
import datepicker from 'js-datepicker';

import langs from "./_lang.json"
import './datepicker.scss'

if (document.querySelector('[data-fls-datepicker]')) {
	const LANG = 'ua' // en
	const datePicker = datepicker('[data-fls-datepicker]', {
		customDays: langs[LANG].week,
		customMonths: langs[LANG].month,
		overlayButton: langs[LANG].button,
		overlayPlaceholder: langs[LANG].year,
		startDay: 1,
		formatter: (input, date, instance) => {
			const value = date.toLocaleDateString()
			input.value = value
		},
		onSelect: function (input, instance, date) {

		}
	});
	window.flsDatepicker = datePicker;
}
