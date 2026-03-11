// Підключення функціоналу "Чертоги Фрілансера"
import { isMobile, FLS } from "@js/common/functions.js";

/*
Документація по роботі у шаблоні: https://www.lightgalleryjs.com/docs/
Документація плагіна: https://www.lightgalleryjs.com/docs/
Сніппет(HTML):
*/

// Підключення базового набору функціоналу
import lightGallery from 'lightgallery';
const KEY = '7EC452A9-0CFD441C-BD984C7C-17C8456E';

// Плагіни
// lgZoom, lgAutoplay, lgComment, lgFullscreen, lgHash, lgPager, lgRotate, lgShare, lgThumbnail, lgVideo, lgMediumZoom
// import lgThumbnail from 'lightgallery/plugins/thumbnail/lg-thumbnail.min.js'
//import lgZoom from 'lightgallery/plugins/zoom/lg-zoom.min.js'

// Базові стилі
import './assets/lightgallery.css';

// Стилі доповнень
// import './assets/lg-transitions.css';
// import './assets/lg-thumbnail.css';
// import './assets/lg-video.css';
// import './assets/lg-autoplay.css';
// import './assets/lg-zoom.css';
// import './assets/lg-pager.css';
// import './assets/lg-fullscreen.css';
// import './assets/lg-share.css';
// import './assets/lg-comments.css';
// import './assets/lg-rotate.css';
// import './assets/lg-rotate.css';
// import './assets/lg-medium-zoom.css';
// import './assets/lg-relative-caption.css';

// Усі стилі
// import './assets/lightgallery-bundle.css';

/*
const galleries = document.querySelectorAll('[data-fls-gallery]');
if (galleries.length) {
	galleries.forEach(gallery => {
		lightGallery(gallery, {
			// plugins: [lgZoom, lgThumbnail],
			licenseKey: KEY,
			speed: 500,
		})
	});
}
*/
// Запуск
function initGallery() {
	if (document.querySelector('[data-fls-gallery]')) {
		const gallery = new lightGallery(document.querySelector('[data-fls-gallery]'), {
			//plugins: [lgZoom, lgThumbnail],
			licenseKey: KEY,
			selector: 'a',
			speed: 500,
		})
	}
}
window.addEventListener('load', initGallery())

