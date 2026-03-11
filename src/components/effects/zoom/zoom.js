// Підключення функціоналу "Чертоги Фрілансера"
import { FLS } from "@js/common/functions.js";

import "./zoom.scss"

function zoomInit() {
	const zoomItems = document.querySelectorAll('[data-fls-zoom]')

	document.addEventListener('mouseover', inAction)
	document.addEventListener('mouseout', inAction)
	document.addEventListener('mousemove', inAction)

	function inAction(e) {
		const targetElement = e.target
		if (targetElement.closest('[data-fls-zoom]')) {
			const zoomBlock = targetElement.closest('[data-fls-zoom]')
			const zoomValue = +zoomBlock.dataset.flsZoom || 3
			const zoomImage = zoomBlock.querySelector('img')
			if (!zoomImage) {
				FLS('_FLS_ZOOM_NOIMAGE')
			} else {
				const zoomImageParent = zoomImage.parentElement
				if (e.type === 'mouseover') {
					let cloneImage = document.createElement('img')
					cloneImage.setAttribute('data-fls-zoom-image', '')
					cloneImage.src = zoomImage.src
					if (!zoomImageParent.querySelector('[data-fls-zoom-image]')) {
						zoomImageParent.insertAdjacentElement('beforeend', cloneImage)
					}
				} else if (e.type === 'mousemove') {
					const mousePos = {
						left: (e.clientX - zoomBlock.getBoundingClientRect().left) / zoomBlock.offsetWidth * (100 - zoomBlock.offsetWidth / (zoomBlock.offsetWidth * zoomValue) * 100),
						top: (e.clientY - zoomBlock.getBoundingClientRect().top) / zoomBlock.offsetHeight * (100 - zoomBlock.offsetHeight / (zoomBlock.offsetHeight * zoomValue) * 100)
					}
					setStyles(zoomImageParent.querySelector('[data-fls-zoom-image]'), zoomImage, mousePos, zoomValue)
				} else if (e.type === 'mouseout') {
					if (zoomImageParent.querySelector('[data-fls-zoom-image]')) {
						zoomImageParent.querySelector('[data-fls-zoom-image]').remove()
					}
				}
			}
		}
	}
	function setStyles(cloneImage, zoomImage, mousePos, zoomValue) {
		const imageSize = {
			width: zoomImage.offsetWidth * zoomValue
		}
		cloneImage.style.cssText = `
			width: ${imageSize.width}px;
			transform: translate(-${mousePos.left}%,-${mousePos.top}%);
		`
	}
}

document.querySelector('[data-fls-zoom]') ?
	window.addEventListener('load', zoomInit) : null