// Фнкціонал "Автовисота"
export const autoHeight = () => {
	const textareas = document.querySelectorAll('textarea[data-fls-input-autoheight]');
	if (textareas.length) {
		textareas.forEach(textarea => {
			const startHeight = textarea.hasAttribute('data-fls-input-autoheight-min') ?
				Number(textarea.dataset.flsInputAutoheightMin) : Number(textarea.offsetHeight);
			const maxHeight = textarea.hasAttribute('data-fls-input-autoheight-max') ?
				Number(textarea.dataset.flsInputAutoheightMax) : Infinity;
			setHeight(textarea, Math.min(startHeight, maxHeight))
			textarea.addEventListener('input', () => {
				if (textarea.scrollHeight > startHeight) {
					textarea.style.height = `auto`;
					setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
				}
			});
		});
		function setHeight(textarea, height) {
			textarea.style.height = `${height}px`;
		}
	}
}
document.querySelector('textarea[data-fls-input-autoheight]') ?
	window.addEventListener('load', autoHeight) : null