// Підключення функціоналу "Чертоги Фрілансера"
import { FLS } from "@js/common/functions.js";

import "./addtocart.scss"

function addToCart() {
	document.addEventListener('click', addToCartAction)
	function addToCartAction(e) {
		const targetElement = e.target
		if (targetElement.closest('[data-fls-addtocart-button]')) {
			let addToCart = document.querySelector('[data-fls-addtocart]')
			const addToCartButton = targetElement.closest('[data-fls-addtocart-button]')
			const addToCartProduct = addToCartButton.closest('[data-fls-addtocart-product]')

			if (addToCartProduct) {
				let addToCartQuantity = addToCartProduct.querySelector('[data-fls-addtocart-quantity]')
				addToCartQuantity = addToCartQuantity ? +addToCartQuantity.value : 1

				const addToCartImage = addToCartProduct.querySelector('[data-fls-addtocart-image]')
				const flyImgSpeed = +addToCartImage.dataset.flsAddtocartImage || 500
				addToCartImage ? addToCartImageFly(addToCartImage, addToCart, flyImgSpeed) : null

				setTimeout(() => {
					addToCart.innerHTML = +addToCart.innerHTML + addToCartQuantity
				}, addToCartImage ? flyImgSpeed : 0)

			} else {
				addToCart.innerHTML = +addToCart.innerHTML + 1
			}
		}
	}
	function addToCartImageFly(addToCartImage, addToCart, flyImgSpeed) {
		const flyImg = document.createElement('img')
		flyImg.src = addToCartImage.src
		flyImg.style.cssText = `
			position: absolute;
			left: ${addToCartImage.getBoundingClientRect().left + scrollX}px;
			top: ${addToCartImage.getBoundingClientRect().top + scrollY}px;
			width: ${addToCartImage.offsetWidth}px;
			transition: all ${flyImgSpeed}ms;
		`
		document.body.insertAdjacentElement('beforeend', flyImg)
		flyImg.style.left = `${addToCart.getBoundingClientRect().left + scrollX}px`
		flyImg.style.top = `${addToCart.getBoundingClientRect().top + scrollY}px`
		flyImg.style.width = 0
		flyImg.style.opacity = `0`

		setTimeout(() => {
			flyImg.remove()
		}, flyImgSpeed);
	}
}
document.querySelector('[data-fls-addtocart]') ?
	window.addEventListener('load', addToCart) : null