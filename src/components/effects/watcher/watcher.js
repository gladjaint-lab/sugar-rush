// Підключення функціоналу "Чортоги Фрілансера"
import { isMobile, uniqArray, FLS } from "@js/common/functions.js";

class ScrollWatcher {
	constructor(props) {
		let defaultConfig = {
			logging: true,
		}
		this.config = Object.assign(defaultConfig, props);
		this.observer;

		!document.documentElement.hasAttribute('data-fls-watch') ? this.scrollWatcherRun() : null;
	}
	// Оновлюємо конструктор
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	// Запускаємо конструктор
	scrollWatcherRun() {
		//document.documentElement.classList.add('watcher');
		document.documentElement.setAttribute('data-fls-watch', '')
		this.scrollWatcherConstructor(document.querySelectorAll('[data-fls-watcher]'));
	}
	// Конструктор спостерігачів
	scrollWatcherConstructor(items) {
		if (items.length) {
			FLS(`_FLS_WATCHER_START_WATCH`, items.length);
			// Унікалізуємо параметри
			let uniqParams = uniqArray(Array.from(items).map(function (item) {
				// Обчислення автоматичного Threshold
				if (item.dataset.flsWatcher === 'navigator' && !item.dataset.flsWatcherThreshold) {
					let valueOfThreshold;
					if (item.clientHeight > 2) {
						valueOfThreshold =
							window.innerHeight / 2 / (item.clientHeight - 1);
						if (valueOfThreshold > 1) {
							valueOfThreshold = 1;
						}
					} else {
						valueOfThreshold = 1;
					}
					item.setAttribute(
						'data-fls-watcher-threshold',
						valueOfThreshold.toFixed(2)
					);
				}
				return `${item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null}|${item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : '0px'}|${item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0}`;
			}));
			// Отримуємо групи об'єктів з однаковими параметрами,
			// створюємо налаштування, ініціалізуємо спостерігач
			uniqParams.forEach(uniqParam => {
				let uniqParamArray = uniqParam.split('|');
				let paramsWatch = {
					root: uniqParamArray[0],
					margin: uniqParamArray[1],
					threshold: uniqParamArray[2]
				}
				let groupItems = Array.from(items).filter(function (item) {
					let watchRoot = item.dataset.flsWatcherRoot ? item.dataset.flsWatcherRoot : null;
					let watchMargin = item.dataset.flsWatcherMargin ? item.dataset.flsWatcherMargin : '0px';
					let watchThreshold = item.dataset.flsWatcherThreshold ? item.dataset.flsWatcherThreshold : 0;
					if (
						String(watchRoot) === paramsWatch.root &&
						String(watchMargin) === paramsWatch.margin &&
						String(watchThreshold) === paramsWatch.threshold
					) {
						return item;
					}
				});

				let configWatcher = this.getScrollWatcherConfig(paramsWatch);

				// Ініціалізація спостерігача зі своїми налаштуваннями
				this.scrollWatcherInit(groupItems, configWatcher);
			});
		} else {
			FLS("_FLS_WATCHER_SLEEP")
		}
	}
	// Функція створення налаштувань
	getScrollWatcherConfig(paramsWatch) {
		//Створюємо налаштування
		let configWatcher = {}
		// Батько, у якому ведеться спостереження
		if (document.querySelector(paramsWatch.root)) {
			configWatcher.root = document.querySelector(paramsWatch.root);
		} else if (paramsWatch.root !== 'null') {
			FLS(`_FLS_WATCHER_NOPARENT`, paramsWatch.root)
		}
		// Відступ спрацьовування
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
			FLS(`_FLS_WATCHER_WARN_MARGIN`)
			return
		}
		// Точки спрацьовування
		if (paramsWatch.threshold === 'prx') {
			// Режим паралаксу
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1.0; i += 0.005) {
				paramsWatch.threshold.push(i);
			}
		} else {
			paramsWatch.threshold = paramsWatch.threshold.split(',');
		}
		configWatcher.threshold = paramsWatch.threshold;
		return configWatcher;
	}
	// Функція створення нового спостерігача зі своїми налаштуваннями
	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	// Функція ініціалізації спостерігача зі своїми налаштуваннями
	scrollWatcherInit(items, configWatcher) {
		// Створення нового спостерігача зі своїми налаштуваннями
		this.scrollWatcherCreate(configWatcher);
		// Передача спостерігачеві елементів
		items.forEach(item => this.observer.observe(item));
	}
	// Функція обробки базових дій точок спрацьовування
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) {
			// Бачимо об'єкт
			// Додаємо клас
			!targetElement.classList.contains('--watcher-view') ? targetElement.classList.add('--watcher-view') : null;
			FLS(`_FLS_WATCHER_VIEW`, targetElement.classList[0]);
		} else {
			// Не бачимо об'єкт
			// Забираємо клас
			targetElement.classList.contains('--watcher-view') ? targetElement.classList.remove('--watcher-view') : null;
			FLS(`_FLS_WATCHER_NOVIEW`, targetElement.classList[0]);
		}
	}
	// Функція відключення стеження за об'єктом
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
		FLS(`_FLS_WATCHER_STOP_WATCH`, targetElement.classList[0]);
	}
	// Функція обробки спостереження
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		// Обробка базових дій точок спрацьовування
		this.scrollWatcherIntersecting(entry, targetElement);
		// Якщо є атрибут data-watch-once прибираємо стеження
		targetElement.hasAttribute('data-fls-watcher-once') && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
		// Створюємо свою подію зворотного зв'язку
		document.dispatchEvent(new CustomEvent("watcherCallback", {
			detail: {
				entry: entry
			}
		}));

		/*
		// Вибираємо потрібні об'єкти
		if (targetElement.dataset.flsWatcher === 'some value') {
			// пишемо унікальну специфіку
		}
		if (entry.isIntersecting) {
			//Бачимо об'єкт
		} else {
			//Не бачимо об'єкт
		}
		*/
	}
}
document.querySelector('[data-fls-watcher]') ?
	window.addEventListener('load', () => new ScrollWatcher({})) : null