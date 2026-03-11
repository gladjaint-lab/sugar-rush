// Підключення функціоналу "Чортоги Фрілансера"
import { FLS } from "@js/common/functions.js";

import "./marquee.scss";

const marquee = () => {
	const $marqueeArray = document.querySelectorAll("[data-fls-marquee]");
	const ATTR_NAMES = {
		wrapper: "data-fls-marquee-wrapper",
		inner: "data-fls-marquee-inner",
		item: "data-fls-marquee-item",
	};

	if (!$marqueeArray.length) return;

	const { head } = document;

	const debounce = (delay, fn) => {
		let timerId;
		return (...args) => {
			if (timerId) {
				clearTimeout(timerId);
			}
			timerId = setTimeout(() => {
				fn(...args);
				timerId = null;
			}, delay);
		};
	};

	const onWindowWidthResize = (cb) => {
		if (!cb && !isFunction(cb)) return;

		let prevWidth = 0;

		const handleResize = () => {
			const currentWidth = window.innerWidth;

			if (prevWidth !== currentWidth) {
				prevWidth = currentWidth;
				cb();
			}
		};

		window.addEventListener("resize", debounce(50, handleResize));

		handleResize();
	};

	const buildMarquee = (marqueeNode) => {
		if (!marqueeNode) return;

		const $marquee = marqueeNode;
		const $childElements = $marquee.children;

		if (!$childElements.length) return;
		//$marquee.setAttribute(ATTR_NAMES.wrapper, '');
		Array.from($childElements).forEach(($childItem) => $childItem.setAttribute(ATTR_NAMES.item, ''));

		const htmlStructure = `<div ${ATTR_NAMES.inner}>${$marquee.innerHTML}</div>`;
		$marquee.innerHTML = htmlStructure;
	};

	const getElSize = ($el, isVertical) => {
		if (isVertical) return $el.offsetHeight;
		return $el.offsetWidth;
	};

	$marqueeArray.forEach(($wrapper) => {
		if (!$wrapper) return;

		buildMarquee($wrapper);

		const $marqueeInner = $wrapper.firstElementChild;
		let cacheArray = [];

		if (!$marqueeInner) return;

		const dataMarqueeSpace = parseFloat($wrapper.getAttribute("data-fls-marquee-space"));
		const $items = $wrapper.querySelectorAll(`[${ATTR_NAMES.item}]`);
		const speed = parseFloat($wrapper.getAttribute("data-fls-marquee-speed")) / 10 || 100;
		const isMousePaused = $wrapper.hasAttribute("data-fls-marquee-pause");
		const direction = $wrapper.getAttribute("data-fls-marquee-direction");
		const isVertical = direction === "bottom" || direction === "top";
		const animName = `marqueeAnimation-${Math.floor(Math.random() * 10000000)}`;
		let spaceBetweenItem = parseFloat(window.getComputedStyle($items[0])?.getPropertyValue("margin-right"));
		let spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
		let startPosition = parseFloat($wrapper.getAttribute("data-fls-marquee-start")) || 0;

		let sumSize = 0;
		let firstScreenVisibleSize = 0;
		let initialSizeElements = 0;
		let initialElementsLength = $marqueeInner.children.length;
		let index = 0;
		let counterDuplicateElements = 0;

		const initEvents = () => {
			if (startPosition) $marqueeInner.addEventListener("animationiteration", onChangeStartPosition);

			if (!isMousePaused) return;
			$marqueeInner.removeEventListener("mouseenter", onChangePaused);
			$marqueeInner.removeEventListener("mouseleave", onChangePaused);
			$marqueeInner.addEventListener("mouseenter", onChangePaused);
			$marqueeInner.addEventListener("mouseleave", onChangePaused);
		};

		const onChangeStartPosition = () => {
			startPosition = 0;
			$marqueeInner.removeEventListener("animationiteration", onChangeStartPosition);
			onResize();
		};

		const setBaseStyles = (firstScreenVisibleSize) => {
			let baseStyle = "display: flex; flex-wrap: nowrap;";

			if (isVertical) {
				baseStyle += `
				flex-direction: column;
				position: relative;
				will-change: transform;`;

				if (direction === "bottom") {
					baseStyle += `top: -${firstScreenVisibleSize}px;`;
				}
			} else {
				baseStyle += `
				position: relative;
				will-change: transform;`;

				if (direction === "right") {
					baseStyle += `inset-inline-start: -${firstScreenVisibleSize}px;;`;
				}
			}

			$marqueeInner.style.cssText = baseStyle;
		};

		const setdirectionAnim = (totalWidth) => {
			switch (direction) {
				case "right":
				case "bottom":
					return totalWidth;
				default:
					return -totalWidth;
			}
		};

		const animation = () => {
			const keyFrameCss = `@keyframes ${animName} {
					 0% {
						 transform: translate${isVertical ? "Y" : "X"}(${!isVertical && window.stateRtl ? -startPosition : startPosition}%);
					 }
					 100% {
						 transform: translate${isVertical ? "Y" : "X"}(${setdirectionAnim(
				!isVertical && window.stateRtl ? -firstScreenVisibleSize : firstScreenVisibleSize
			)}px);
					 }
				 }`;
			const $style = document.createElement("style");

			$style.classList.add(animName);
			$style.innerHTML = keyFrameCss;
			head.append($style);

			$marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + (startPosition * firstScreenVisibleSize) / 100) / speed
				}s infinite linear`;
		};

		const addDublicateElements = () => {
			sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;

			const $parentNodeWidth = getElSize($wrapper, isVertical);

			let $childrenEl = Array.from($marqueeInner.children);

			if (!$childrenEl.length) return;

			if (!cacheArray.length) {
				cacheArray = $childrenEl.map(($item) => $item);
			} else {
				$childrenEl = [...cacheArray];
			}

			$marqueeInner.style.display = "flex";
			if (isVertical) $marqueeInner.style.flexDirection = "column";
			$marqueeInner.innerHTML = "";
			$childrenEl.forEach(($item) => {
				$marqueeInner.append($item);
			});

			$childrenEl.forEach(($item) => {
				if (isVertical) {
					$item.style.marginBottom = `${spaceBetween}px`;
				} else {
					$item.style.marginRight = `${spaceBetween}px`;
					$item.style.flexShrink = 0;
				}

				const sizeEl = getElSize($item, isVertical);

				sumSize += sizeEl + spaceBetween;
				firstScreenVisibleSize += sizeEl + spaceBetween;
				initialSizeElements += sizeEl + spaceBetween;
				counterDuplicateElements += 1;

				return sizeEl;
			});

			const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;

			for (; sumSize < $multiplyWidth; index += 1) {
				if (!$childrenEl[index]) index = 0;

				const $cloneNone = $childrenEl[index].cloneNode(true);
				const $lastElement = $marqueeInner.children[index];

				$marqueeInner.append($cloneNone);

				sumSize += getElSize($lastElement, isVertical) + spaceBetween;

				if (firstScreenVisibleSize < $parentNodeWidth || counterDuplicateElements % initialElementsLength !== 0) {
					counterDuplicateElements += 1;
					firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
				}
			}

			setBaseStyles(firstScreenVisibleSize);
		};

		const correctSpaceBetween = () => {
			if (spaceBetweenItem) {
				$items.forEach(($item) => $item.style.removeProperty("margin-right"));

				spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue("margin-right"));
				spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
			}
		};

		const init = () => {
			correctSpaceBetween();
			addDublicateElements();
			animation();
			initEvents();
		};

		const onResize = () => {
			head.querySelector(`.${animName}`)?.remove();
			init();
		};

		const onChangePaused = (e) => {
			const { type, target } = e;

			target.style.animationPlayState = type === "mouseenter" ? "paused" : "running";
		};

		onWindowWidthResize(onResize);
	});
};

marquee();
