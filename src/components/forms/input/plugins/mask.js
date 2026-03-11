// Підключення модуля
import "inputmask/dist/inputmask.min.js";

function inputMask() {
	const inputMasks = document.querySelectorAll('input[data-fls-input-mask]')
	inputMasks.forEach(inputMask => {
		Inputmask({ "mask": `${inputMask.dataset.flsInputMask}` }).mask(inputMask)
	});
}
document.querySelector('input[data-fls-input-mask]') ?
	window.addEventListener('load', inputMask) : null