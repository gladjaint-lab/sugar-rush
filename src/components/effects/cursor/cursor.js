// Підключення функціоналу "Чертоги Фрілансера"
import { FLS, isMobile } from "@js/common/functions.js";

// Базові стилі
import "./cursor.scss";

export function customCursor() {
	const wrapper = document.querySelector('[data-fls-cursor]')
	if (wrapper && !isMobile.any()) {
		const isShadowTrue = document.querySelector('[data-fls-cursor-shadow]')
		// Створюємо та додаємо об'єкт курсору
		const cursor = document.createElement('div');
		cursor.classList.add('fls-cursor');
		cursor.style.opacity = 0;
		cursor.insertAdjacentHTML('beforeend', `<span class="fls-cursor__pointer"></span>`);
		isShadowTrue ? cursor.insertAdjacentHTML('beforeend', `<span class="fls-cursor__shadow"></span>`) : null;
		wrapper.append(cursor);

		const cursorPointer = document.querySelector('.fls-cursor__pointer');
		const cursorPointerStyle = {
			width: cursorPointer.offsetWidth,
			height: cursorPointer.offsetHeight
		}
		let cursorShadow, cursorShadowStyle;
		if (isShadowTrue) {
			cursorShadow = document.querySelector('.fls-cursor__shadow');
			cursorShadowStyle = {
				width: cursorShadow.offsetWidth,
				height: cursorShadow.offsetHeight
			}
		}
		function mouseActions(e) {
			if (e.type === 'mouseout') {
				cursor.style.opacity = 0;
			} else if (e.type === 'mousemove') {
				cursor.style.removeProperty('opacity');
				if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || (window.getComputedStyle(e.target).cursor !== 'none' && window.getComputedStyle(e.target).cursor !== 'default')) {
					cursor.classList.add('--hover');
				} else {
					cursor.classList.remove('--hover');
				}
			} else if (e.type === 'mousedown') {
				cursor.classList.add('--active');

			} else if (e.type === 'mouseup') {
				cursor.classList.remove('--active');
			}
			cursorPointer ? cursorPointer.style.transform = `translate3d(${e.clientX - cursorPointerStyle.width / 2}px, ${e.clientY - cursorPointerStyle.height / 2}px, 0)` : null;
			cursorShadow ? cursorShadow.style.transform = `translate3d(${e.clientX - cursorShadowStyle.width / 2}px, ${e.clientY - cursorShadowStyle.height / 2}px, 0)` : null;
		}

		wrapper.addEventListener('mouseup', mouseActions);
		wrapper.addEventListener('mousedown', mouseActions);
		wrapper.addEventListener('mousemove', mouseActions);
		wrapper.addEventListener('mouseout', mouseActions);
	}
}
document.querySelector('[data-fls-cursor]') ?
	window.addEventListener('load', customCursor) : null