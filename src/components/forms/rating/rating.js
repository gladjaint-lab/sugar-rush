// Підключення функціоналу "Чортоги Фрілансера"
import { FLS } from "@js/common/functions.js";

import './rating.scss'

export function formRating() {
	// Rating
	const ratings = document.querySelectorAll('[data-fls-rating]');
	if (ratings) {
		ratings.forEach(rating => {
			const ratingValue = +rating.dataset.flsRatingValue
			const ratingSize = +rating.dataset.flsRatingSize ? +rating.dataset.flsRatingSize : 5
			formRatingInit(rating, ratingSize)
			ratingValue ? formRatingSet(rating, ratingValue) : null
			document.addEventListener('click', formRatingAction)
		});
	}
	function formRatingAction(e) {
		const targetElement = e.target;
		if (targetElement.closest('.rating__input')) {
			const currentElement = targetElement.closest('.rating__input');
			const ratingValue = +currentElement.value
			const rating = currentElement.closest('.rating')
			const ratingSet = rating.dataset.flsRating === 'set'
			ratingSet ? formRatingGet(rating, ratingValue) : null;
		}
	}
	function formRatingInit(rating, ratingSize) {
		let ratingItems = ``;
		for (let index = 0; index < ratingSize; index++) {
			index === 0 ? ratingItems += `<div class="rating__items">` : null
			ratingItems += `
				<label class="rating__item">
					<input class="rating__input" type="radio" name="rating" value="${index + 1}">
				</label>`
			index === ratingSize ? ratingItems += `</div">` : null
		}
		rating.insertAdjacentHTML("beforeend", ratingItems)
	}
	function formRatingGet(rating, ratingValue) {
		// Тут відправка оцінки (ratingValue) на бекенд...
		// Отримуємо нову седню оцінку formRatingSend()
		// Або виводимо ту яку вказав користувач
		const resultRating = ratingValue;
		formRatingSet(rating, resultRating);
	}
	function formRatingSet(rating, value) {
		const ratingItems = rating.querySelectorAll('.rating__item');
		const resultFullItems = parseInt(value);
		const resultPartItem = value - resultFullItems;

		rating.hasAttribute('data-rating-title') ? rating.title = value : null

		ratingItems.forEach((ratingItem, index) => {
			ratingItem.classList.remove('rating__item--active');
			ratingItem.querySelector('span') ? ratingItems[index].querySelector('span').remove() : null;

			if (index <= (resultFullItems - 1)) {
				ratingItem.classList.add('rating__item--active');
			}
			if (index === resultFullItems && resultPartItem) {
				ratingItem.insertAdjacentHTML("beforeend", `<span style="width:${resultPartItem * 100}%"></span>`)
			}
		});
	}
	function formRatingSend() { }

}
document.querySelector('[data-fls-rating]') ?
	window.addEventListener('load', formRating) : null