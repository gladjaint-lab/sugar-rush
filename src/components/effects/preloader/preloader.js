import './preloader.scss'

function preloader() {
	const preloaderImages = document.querySelectorAll('img')
	const htmlDocument = document.documentElement
	const isPreloaded = localStorage.getItem(location.href) && document.querySelector('[data-fls-preloader="true"]')
	if (preloaderImages.length && !isPreloaded) {
		const preloaderTemplate = `
			<div class="fls-preloader">
				<div class="fls-preloader__body">
					<div class="fls-preloader__counter">0%</div>
					<div class="fls-preloader__line"><span></span></div>
				</div>
			</div>`
		document.body.insertAdjacentHTML("beforeend", preloaderTemplate);
		const
			preloader = document.querySelector('.fls-preloader'),
			showPecentLoad = document.querySelector('.fls-preloader__counter'),
			showLineLoad = document.querySelector('.fls-preloader__line span')

		let imagesLoadedCount = 0
		let counter = 0
		let progress = 0

		htmlDocument.setAttribute('data-fls-preloader-loading', '')
		htmlDocument.setAttribute('data-fls-scrolllock', '')

		preloaderImages.forEach(preloaderImage => {
			const imgClone = document.createElement('img');
			if (imgClone) {
				imgClone.onload = imageLoaded;
				imgClone.onerror = imageLoaded;
				preloaderImage.dataset.src ? imgClone.src = preloaderImage.dataset.src : imgClone.src = preloaderImage.src;
			}
		})
		function setValueProgress(progress) {
			showPecentLoad ? showPecentLoad.innerText = `${progress}%` : null;
			showLineLoad ? showLineLoad.style.width = `${progress}%` : null;
		}
		setValueProgress(progress)

		function imageLoaded() {
			imagesLoadedCount++;
			progress = Math.round((100 / preloaderImages.length) * imagesLoadedCount)
			const intervalId = setInterval(() => {
				counter >= progress ? clearInterval(intervalId) : setValueProgress(++counter);
				counter >= 100 ? addLoadedClass() : null;
			}, 10)
		}
		const preloaderOnce = () => localStorage.setItem(location.href, 'preloaded')

		document.querySelector('[data-fls-preloader="true"]') ? preloaderOnce() : null
	} else {
		addLoadedClass()
	}
	function addLoadedClass() {
		htmlDocument.setAttribute('data-fls-preloader-loaded', '')
		htmlDocument.removeAttribute('data-fls-preloader-loading')
		htmlDocument.removeAttribute('data-fls-scrolllock')
	}
}
document.addEventListener('DOMContentLoaded', preloader)