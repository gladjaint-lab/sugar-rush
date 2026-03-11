// Підключення функціоналу "Чортоги Фрілансера"
import { isMobile, FLS } from "@js/common/functions.js";

import './fullpage.scss'

// Клас FullPage
class FullPage {
	constructor(element, options) {
		let config = {
			//===============================
			// Селектор, на якому не працює подія свайпа/колеса
			noEventSelector: '[data-fls-fullpage-noevent]',
			//===============================
			// Налаштування оболонки
			// Клас при ініціалізації плагіна
			classInit: '--fullpage-init',
			// Клас для врапера під час гортання
			wrapperAnimatedClass: '--fullpage-switching',
			//===============================
			// Налаштування секцій
			// СЕЛЕКТОР для секцій
			selectorSection: '[data-fls-fullpage-section]',
			// Клас для активної секції
			activeClass: '--fullpage-active-section',
			// Клас для Попередньої секції
			previousClass: '--fullpage-previous-section',
			// Клас для наступної секції
			nextClass: '--fullpage-next-section',
			// id початково активного класу
			idActiveSection: 0,
			//===============================
			// Інші налаштування
			// Свайп мишею
			// touchSimulator: false,
			//===============================
			// Ефекти
			// Ефекти: fade, cards, slider
			mode: element.dataset.flsFullpageEffect ? element.dataset.flsFullpageEffect : 'slider',
			//===============================
			// Булети
			// Активація буллетів
			bullets: element.hasAttribute('data-fls-fullpage-bullets') ? true : false,
			// Клас оболонки буллетів
			bulletsClass: '--fullpage-bullets',
			// Клас буллета
			bulletClass: '--fullpage-bullet',
			// Клас активного буллета
			bulletActiveClass: '--fullpage-bullet-active',
			//===============================
			// Події
			// Подія створення
			onInit: function () { },
			// Подія перегортання секції
			onSwitching: function () { },
			// Подія руйнування плагіна
			onDestroy: function () { },
		}
		this.options = Object.assign(config, options);
		// Батьківський єлемент
		this.wrapper = element;
		this.sections = this.wrapper.querySelectorAll(this.options.selectorSection);
		// Активний слайд
		this.activeSection = false;
		this.activeSectionId = false;
		// Попередній слайд
		this.previousSection = false;
		this.previousSectionId = false;
		// Наступний слайд
		this.nextSection = false;
		this.nextSectionId = false;
		// Оболонка буллетів
		this.bulletsWrapper = false;
		// Допоміжна змінна
		this.stopEvent = false;
		if (this.sections.length) {
			// Ініціалізація елементів
			this.init();
		}
	}
	//===============================
	// Початкова ініціалізація
	init() {
		if (this.options.idActiveSection > (this.sections.length - 1)) return
		// Розставляємо id
		this.setId();
		this.activeSectionId = this.options.idActiveSection;
		// Присвоєння класів із різними ефектами
		this.setEffectsClasses();
		// Встановлення класів
		this.setClasses();
		// Встановлення стилів
		this.setStyle();
		// Встановлення булетів
		if (this.options.bullets) {
			this.setBullets();
			this.setActiveBullet(this.activeSectionId);
		}
		// Встановлення подій
		this.events();
		// Встановлюємо init клас
		setTimeout(() => {
			FLS('_FLS_FULLPAGE_START', this.sections.length)

			document.documentElement.classList.add(this.options.classInit);
			// Створення кастомної події
			this.options.onInit(this);
			document.dispatchEvent(new CustomEvent("fpinit", {
				detail: {
					fp: this
				}
			}));
		}, 0);
	}
	//===============================
	// Видалити
	destroy() {
		// Видалення подій
		this.removeEvents();
		// Видалення класів у секцій
		this.removeClasses();
		// Видалення класу ініціалізації
		document.documentElement.classList.remove(this.options.classInit);
		// Видалення класу анімації
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
		// Видалення класів ефектів
		this.removeEffectsClasses();
		// Видалення z-index у секцій
		this.removeZIndex();
		// Видалення стилів
		this.removeStyle();
		// Видалення ID
		this.removeId();
		// Створення кастомної події
		this.options.onDestroy(this);
		document.dispatchEvent(new CustomEvent("fpdestroy", {
			detail: {
				fp: this
			}
		}));
	}
	//===============================
	// Встановлення ID для секцій
	setId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.setAttribute('data-fls-fullpage-id', index);
		}
	}
	//===============================
	// Видалення ID для секцій
	removeId() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.removeAttribute('data-fls-fullpage-id');
		}
	}
	//===============================
	// Функція встановлення класів для першої, активної та наступної секцій
	setClasses() {
		// Збереження id для ПОПЕРЕДНЬОГО слайду (якщо такий є)
		this.previousSectionId = (this.activeSectionId - 1) >= 0 ?
			this.activeSectionId - 1 : false;

		// Збереження id для НАСТУПНОГО слайду (якщо такий є)
		this.nextSectionId = (this.activeSectionId + 1) < this.sections.length ?
			this.activeSectionId + 1 : false;

		// Встановлення класу та присвоєння елемента для АКТИВНОГО слайду
		this.activeSection = this.sections[this.activeSectionId];
		this.activeSection.classList.add(this.options.activeClass);

		for (let index = 0; index < this.sections.length; index++) {
			document.documentElement.classList.remove(`--fullpage-section-${index}`);
		}
		document.documentElement.classList.add(`--fullpage-section-${this.activeSectionId}`);

		// Встановлення класу та присвоєння елементу для ПОПЕРЕДНЬОГО слайду
		if (this.previousSectionId !== false) {
			this.previousSection = this.sections[this.previousSectionId];
			this.previousSection.classList.add(this.options.previousClass);
		} else {
			this.previousSection = false;
		}

		// Встановлення класу та присвоєння елемента для НАСТУПНОГО слайду
		if (this.nextSectionId !== false) {
			this.nextSection = this.sections[this.nextSectionId];
			this.nextSection.classList.add(this.options.nextClass);
		} else {
			this.nextSection = false;
		}
	}
	//===============================
	// Присвоєння класів із різними ефектами
	removeEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.remove('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.remove('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.remove('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	//===============================
	// Присвоєння класів із різними ефектами
	setEffectsClasses() {
		switch (this.options.mode) {
			case 'slider':
				this.wrapper.classList.add('slider-mode');
				break;

			case 'cards':
				this.wrapper.classList.add('cards-mode');
				this.setZIndex();
				break;

			case 'fade':
				this.wrapper.classList.add('fade-mode');
				this.setZIndex();
				break;

			default:
				break;
		}
	}
	//===============================
	// Блокування напрямків скролла
	//===============================
	// Функція встановлення стилів
	setStyle() {
		switch (this.options.mode) {
			case 'slider':
				this.styleSlider();
				break;

			case 'cards':
				this.styleCards();
				break;

			case 'fade':
				this.styleFade();
				break;
			default:
				break;
		}
	}
	// slider-mode
	styleSlider() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			} else if (index > this.activeSectionId) {
				section.style.transform = 'translate3D(0,100%,0)';
			}
		}
	}
	// cards mode
	styleCards() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index >= this.activeSectionId) {
				section.style.transform = 'translate3D(0,0,0)';
			} else if (index < this.activeSectionId) {
				section.style.transform = 'translate3D(0,-100%,0)';
			}
		}
	}
	// fade style 
	styleFade() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			if (index === this.activeSectionId) {
				section.style.opacity = '1';
				section.style.pointerEvents = 'all';
				//section.style.visibility = 'visible';
			} else {
				section.style.opacity = '0';
				section.style.pointerEvents = 'none';
				//section.style.visibility = 'hidden';
			}
		}
	}
	//===============================
	// Видалення стилів
	removeStyle() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.opacity = '';
			section.style.visibility = '';
			section.style.transform = '';
		}
	}
	//===============================
	// Функція перевірки чи повністю було прокручено елемент
	checkScroll(yCoord, element) {
		this.goScroll = false;

		// Чи є елемент і чи готовий до роботи 
		if (!this.stopEvent && element) {
			this.goScroll = true;
			// Якщо висота секції не дорівнює висоті вікна
			if (this.haveScroll(element)) {
				this.goScroll = false;
				const position = Math.round(element.scrollHeight - element.scrollTop);
				// Перевірка на те, чи повністю прокручена секція
				if (
					((Math.abs(position - element.scrollHeight) < 2) && yCoord <= 0) ||
					((Math.abs(position - element.clientHeight) < 2) && yCoord >= 0)
				) {
					this.goScroll = true;
				}
			}
		}
	}
	//===============================
	// Перевірка висоти 
	haveScroll(element) {
		return element.scrollHeight !== window.innerHeight
	}
	//===============================
	// Видалення класів 
	removeClasses() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.classList.remove(this.options.activeClass);
			section.classList.remove(this.options.previousClass);
			section.classList.remove(this.options.nextClass);
		}
	}
	//===============================
	// Збірник подій...
	events() {
		this.events = {
			// Колесо миші
			wheel: this.wheel.bind(this),

			// Свайп
			touchdown: this.touchDown.bind(this),
			touchup: this.touchUp.bind(this),
			touchmove: this.touchMove.bind(this),
			touchcancel: this.touchUp.bind(this),

			// Кінець анімації
			transitionEnd: this.transitionend.bind(this),

			// Клік для буллетів
			click: this.clickBullets.bind(this),
		}
		if (isMobile.iOS()) {
			document.addEventListener('touchmove', (e) => {
				e.preventDefault();
			});
		}
		this.setEvents();
	}
	setEvents() {
		// Подія колеса миші
		this.wrapper.addEventListener('wheel', this.events.wheel);
		// Подія натискання на екран
		this.wrapper.addEventListener('touchstart', this.events.touchdown);
		// Подія кліка по булетах
		if (this.options.bullets && this.bulletsWrapper) {
			this.bulletsWrapper.addEventListener('click', this.events.click);
		}
	}
	removeEvents() {
		this.wrapper.removeEventListener('wheel', this.events.wheel);
		this.wrapper.removeEventListener('touchdown', this.events.touchdown);
		this.wrapper.removeEventListener('touchup', this.events.touchup);
		this.wrapper.removeEventListener('touchcancel', this.events.touchup);
		this.wrapper.removeEventListener('touchmove', this.events.touchmove);
		if (this.bulletsWrapper) {
			this.bulletsWrapper.removeEventListener('click', this.events.click);
		}
	}
	//===============================
	// Функція кліка по булетах
	clickBullets(e) {
		// Натиснутий буллет
		const bullet = e.target.closest(`.${this.options.bulletClass}`);
		if (bullet) {
			// Масив усіх буллетів
			const arrayChildren = Array.from(this.bulletsWrapper.children);

			// id Натиснутого буллета
			const idClickBullet = arrayChildren.indexOf(bullet)

			// Перемикання секції
			this.switchingSection(idClickBullet)
		}
	}
	//===============================
	// Установка стилів для буллетів
	setActiveBullet(idButton) {
		if (!this.bulletsWrapper) return
		// Усі буллети
		const bullets = this.bulletsWrapper.children;

		for (let index = 0; index < bullets.length; index++) {
			const bullet = bullets[index];
			if (idButton === index) bullet.classList.add(this.options.bulletActiveClass);
			else bullet.classList.remove(this.options.bulletActiveClass);
		}
	}
	//===============================
	// Функція натискання тач/пера/курсора
	touchDown(e) {
		// Змінна для свайпа
		this._yP = e.changedTouches[0].pageY;
		this._eventElement = e.target.closest(`.${this.options.activeClass}`);
		if (this._eventElement) {
			// Вішаємо подію touchmove та touchup
			this._eventElement.addEventListener('touchend', this.events.touchup);
			this._eventElement.addEventListener('touchcancel', this.events.touchup);
			this._eventElement.addEventListener('touchmove', this.events.touchmove);
			// Тач стався
			this.clickOrTouch = true;

			//==============================
			if (isMobile.iOS()) {
				if (this._eventElement.scrollHeight !== this._eventElement.clientHeight) {
					if (this._eventElement.scrollTop === 0) {
						this._eventElement.scrollTop = 1;
					}
					if (this._eventElement.scrollTop === this._eventElement.scrollHeight - this._eventElement.clientHeight) {
						this._eventElement.scrollTop = this._eventElement.scrollHeight - this._eventElement.clientHeight - 1;
					}
				}
				this.allowUp = this._eventElement.scrollTop > 0;
				this.allowDown = this._eventElement.scrollTop < (this._eventElement.scrollHeight - this._eventElement.clientHeight);
				this.lastY = e.changedTouches[0].pageY;
			}
			//===============================
		}
	}
	//===============================
	// Подія руху тач/пера/курсора
	touchMove(e) {
		// Отримання секції, на якій спрацьовує подію
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		//===============================
		if (isMobile.iOS()) {
			let up = e.changedTouches[0].pageY > this.lastY;
			let down = !up;
			this.lastY = e.changedTouches[0].pageY;
			if (targetElement) {
				if ((up && this.allowUp) || (down && this.allowDown)) {
					e.stopPropagation();
				} else if (e.cancelable) {
					e.preventDefault();
				}
			}
		}
		//===============================
		// Перевірка на завершення анімації та наявність НЕ ПОДІЙНОГО блоку
		if (!this.clickOrTouch || e.target.closest(this.options.noEventSelector)) return
		// Отримання напряму руху
		let yCoord = this._yP - e.changedTouches[0].pageY;
		// Чи дозволено перехід? 
		this.checkScroll(yCoord, targetElement);
		// Перехід
		if (this.goScroll && Math.abs(yCoord) > 20) {
			this.choiceOfDirection(yCoord);
		}
	}
	//===============================
	// Подія відпускання від екрану тач/пера/курсора
	touchUp(e) {
		// Видалення подій
		this._eventElement.removeEventListener('touchend', this.events.touchup);
		this._eventElement.removeEventListener('touchcancel', this.events.touchup);
		this._eventElement.removeEventListener('touchmove', this.events.touchmove);
		return this.clickOrTouch = false;
	}
	//===============================
	// Кінець спрацьовування переходу
	transitionend(e) {
		//if (e.target.closest(this.options.selectorSection)) {
		this.stopEvent = false;
		document.documentElement.classList.remove(this.options.wrapperAnimatedClass);
		this.wrapper.classList.remove(this.options.wrapperAnimatedClass);
		//}
	}
	//===============================
	// Подія прокручування колесом миші
	wheel(e) {
		// Перевірка на наявність НЕ ПОДІЙНОГО блоку
		if (e.target.closest(this.options.noEventSelector)) return
		// Отримання напряму руху
		const yCoord = e.deltaY;
		// Отримання секції, на якій спрацьовує подію
		const targetElement = e.target.closest(`.${this.options.activeClass}`);
		// Чи дозволено перехід? 
		this.checkScroll(yCoord, targetElement);
		// Перехід
		if (this.goScroll) this.choiceOfDirection(yCoord);
	}
	//===============================
	// Функція вибору напряму
	choiceOfDirection(direction) {
		// Встановлення потрібних id
		if (direction > 0 && this.nextSection !== false) {
			this.activeSectionId = (this.activeSectionId + 1) < this.sections.length ?
				++this.activeSectionId : this.activeSectionId;
		} else if (direction < 0 && this.previousSection !== false) {
			this.activeSectionId = (this.activeSectionId - 1) >= 0 ?
				--this.activeSectionId : this.activeSectionId;
		}
		// Зміна слайдів
		this.switchingSection(this.activeSectionId, direction);
	}
	//===============================
	// Функція перемикання слайдів
	switchingSection(idSection = this.activeSectionId, direction) {
		if (!direction) {
			if (idSection < this.activeSectionId) {
				direction = -100;
			} else if (idSection > this.activeSectionId) {
				direction = 100;
			}
		}
		this.activeSectionId = idSection;

		// Зупиняємо роботу подій
		this.stopEvent = true;
		// Якщо слайд крайні, то дозволяємо події
		if (((this.previousSectionId === false) && direction < 0) || ((this.nextSectionId === false) && direction > 0)) {
			this.stopEvent = false;
		}

		if (this.stopEvent) {
			// Встановлення події закінчення програвання анімації
			document.documentElement.classList.add(this.options.wrapperAnimatedClass);
			this.wrapper.classList.add(this.options.wrapperAnimatedClass);
			//this.wrapper.addEventListener('transitionend', this.events.transitionEnd);
			// Видалення класів
			this.removeClasses();
			// Зміна класів 
			this.setClasses();
			// Зміна стилів
			this.setStyle();
			// Встановлення стилів для буллетів
			if (this.options.bullets) this.setActiveBullet(this.activeSectionId);

			// Встановлюємо затримку перемикання
			// Додаємо класи напрямку руху
			let delaySection;
			if (direction < 0) {
				delaySection = this.activeSection.dataset.flsFullpageDirectionUp ? parseInt(this.activeSection.dataset.flsFullpageDirectionUp) : 500;
				document.documentElement.classList.add('--fullpage-up');
				document.documentElement.classList.remove('--fullpage-down');
			} else {
				delaySection = this.activeSection.dataset.flsFullpageDirectionDown ? parseInt(this.activeSection.dataset.flsFullpageDirectionDown) : 500;
				document.documentElement.classList.remove('--fullpage-up');
				document.documentElement.classList.add('--fullpage-down');
			}

			FLS('_FLS_FULLPAGE_GOTO', idSection)

			setTimeout(() => {
				this.events.transitionEnd();
			}, delaySection);


			// Створення події
			this.options.onSwitching(this);
			document.dispatchEvent(new CustomEvent("fpswitching", {
				detail: {
					fp: this
				}
			}));
		}
	}
	//===============================
	// Встановлення булетів
	setBullets() {
		// Пошук оболонки буллетів
		this.bulletsWrapper = document.querySelector(`.${this.options.bulletsClass}`);

		// Якщо немає створюємо
		if (!this.bulletsWrapper) {
			const bullets = document.createElement('div');
			bullets.classList.add(this.options.bulletsClass);
			this.wrapper.append(bullets);
			this.bulletsWrapper = bullets;
		}

		// Створення буллетів
		if (this.bulletsWrapper) {
			for (let index = 0; index < this.sections.length; index++) {
				const span = document.createElement('span');
				span.classList.add(this.options.bulletClass);
				this.bulletsWrapper.append(span);
			}
		}
	}
	//===============================
	// Z-INDEX
	setZIndex() {
		let zIndex = this.sections.length
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = zIndex;
			--zIndex;
		}
	}
	removeZIndex() {
		for (let index = 0; index < this.sections.length; index++) {
			const section = this.sections[index];
			section.style.zIndex = ''
		}
	}
}
// Запускаємо та додаємо в об'єкт модулів
if (document.querySelector('[data-fls-fullpage]')) {
	window.addEventListener('load', () => window.flsFullpage = new FullPage(document.querySelector('[data-fls-fullpage]')))
}
