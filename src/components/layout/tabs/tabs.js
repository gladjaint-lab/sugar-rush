import { FLS, slideUp, slideDown, slideToggle, dataMediaQueries, getHash, setHash } from "@js/common/functions.js";

// Підключення базових стилів
import "./tabs.scss";

export function tabs() {
	const tabs = document.querySelectorAll('[data-fls-tabs]');
	let tabsActiveHash = [];

	if (tabs.length > 0) {
		const hash = getHash();

		FLS(`_FLS_TABS_START`, tabs.length)

		if (hash && hash.startsWith('tab-')) {
			tabsActiveHash = hash.replace('tab-', '').split('-');
		}
		tabs.forEach((tabsBlock, index) => {
			tabsBlock.classList.add('--tab-init');
			tabsBlock.setAttribute('data-fls-tabs-index', index);
			tabsBlock.addEventListener("click", setTabsAction);
			initTabs(tabsBlock);
		});

		// Отримання слойлерів з медіа-запитами
		let mdQueriesArray = dataMediaQueries(tabs, "flsTabs");
		if (mdQueriesArray && mdQueriesArray.length) {
			mdQueriesArray.forEach(mdQueriesItem => {
				// Подія
				mdQueriesItem.matchMedia.addEventListener("change", function () {
					setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
				});
				setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
			});
		}
	}
	// Встановлення позицій заголовків
	function setTitlePosition(tabsMediaArray, matchMedia) {
		tabsMediaArray.forEach(tabsMediaItem => {
			tabsMediaItem = tabsMediaItem.item;
			let tabsTitles = tabsMediaItem.querySelector('[data-fls-tabs-titles]');
			let tabsTitleItems = tabsMediaItem.querySelectorAll('[data-fls-tabs-title]');
			let tabsContent = tabsMediaItem.querySelector('[data-fls-tabs-body]');
			let tabsContentItems = tabsMediaItem.querySelectorAll('[data-fls-tabs-item]');
			tabsTitleItems = Array.from(tabsTitleItems).filter(item => item.closest('[data-fls-tabs]') === tabsMediaItem);
			tabsContentItems = Array.from(tabsContentItems).filter(item => item.closest('[data-fls-tabs]') === tabsMediaItem);
			tabsContentItems.forEach((tabsContentItem, index) => {
				if (matchMedia.matches) {
					tabsContent.append(tabsTitleItems[index]);
					tabsContent.append(tabsContentItem);
					tabsMediaItem.classList.add('--tab-spoller');
				} else {
					tabsTitles.append(tabsTitleItems[index]);
					tabsMediaItem.classList.remove('--tab-spoller');
				}
			});
		});
	}
	// Робота з контентом
	function initTabs(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll('[data-fls-tabs-titles]>*');
		let tabsContent = tabsBlock.querySelectorAll('[data-fls-tabs-body]>*');
		const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
		const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;

		if (tabsActiveHashBlock) {
			const tabsActiveTitle = tabsBlock.querySelector('[data-fls-tabs-titles]>.--tab-active');
			tabsActiveTitle ? tabsActiveTitle.classList.remove('--tab-active') : null;
		}
		if (tabsContent.length) {
			tabsContent.forEach((tabsContentItem, index) => {
				tabsTitles[index].setAttribute('data-fls-tabs-title', '');
				tabsContentItem.setAttribute('data-fls-tabs-item', '');

				if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
					tabsTitles[index].classList.add('--tab-active');
				}
				tabsContentItem.hidden = !tabsTitles[index].classList.contains('--tab-active');
			});
		}
	}
	function setTabsStatus(tabsBlock) {
		let tabsTitles = tabsBlock.querySelectorAll('[data-fls-tabs-title]');
		let tabsContent = tabsBlock.querySelectorAll('[data-fls-tabs-item]');
		const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
		function isTabsAnamate(tabsBlock) {
			if (tabsBlock.hasAttribute('data-fls-tabs-animate')) {
				return tabsBlock.dataset.flsTabsAnimate > 0 ? Number(tabsBlock.dataset.flsTabsAnimate) : 500;
			}
		}
		const tabsBlockAnimate = isTabsAnamate(tabsBlock);
		if (tabsContent.length > 0) {
			const isHash = tabsBlock.hasAttribute('data-fls-tabs-hash');
			tabsContent = Array.from(tabsContent).filter(item => item.closest('[data-fls-tabs]') === tabsBlock);
			tabsTitles = Array.from(tabsTitles).filter(item => item.closest('[data-fls-tabs]') === tabsBlock);
			tabsContent.forEach((tabsContentItem, index) => {
				if (tabsTitles[index].classList.contains('--tab-active')) {
					if (tabsBlockAnimate) {
						slideDown(tabsContentItem, tabsBlockAnimate);
					} else {
						tabsContentItem.hidden = false;
					}
					if (isHash && !tabsContentItem.closest('.popup')) {
						setHash(`tab-${tabsBlockIndex}-${index}`);
					}
				} else {
					if (tabsBlockAnimate) {
						slideUp(tabsContentItem, tabsBlockAnimate);
					} else {
						tabsContentItem.hidden = true;
					}
				}
			});
		}
	}
	function setTabsAction(e) {
		const el = e.target;
		if (el.closest('[data-fls-tabs-title]')) {
			const tabTitle = el.closest('[data-fls-tabs-title]');
			const tabsBlock = tabTitle.closest('[data-fls-tabs]');
			if (!tabTitle.classList.contains('--tab-active') && !tabsBlock.querySelector('.--slide')) {
				let tabActiveTitle = tabsBlock.querySelectorAll('[data-fls-tabs-title].--tab-active');
				tabActiveTitle.length ? tabActiveTitle = Array.from(tabActiveTitle).filter(item => item.closest('[data-fls-tabs]') === tabsBlock) : null;
				tabActiveTitle.length ? tabActiveTitle[0].classList.remove('--tab-active') : null;
				tabTitle.classList.add('--tab-active');
				setTabsStatus(tabsBlock);
			}
			e.preventDefault();
		}
	}
}
window.addEventListener('load', tabs);