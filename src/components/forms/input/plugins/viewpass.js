// Функціонал "Показати пароль"
function viewPass() {
	document.addEventListener("click", function (e) {
		let targetElement = e.target;
		if (targetElement.closest('[data-fls-input-viewpass]')) {
			let inputType = targetElement.classList.contains('--viewpass-active') ? "password" : "text";
			targetElement.parentElement.querySelector('input').setAttribute("type", inputType);
			targetElement.classList.toggle('--viewpass-active');
		}
	});
}
document.querySelector('[data-fls-input-viewpass]') ?
	window.addEventListener('load', viewPass) : null