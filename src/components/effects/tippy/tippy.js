// Підключення функціоналу "Чертоги Фрілансера"
import { isMobile, FLS } from "@js/common/functions.js";

// Підключення з node_modules
import tippy from 'tippy.js';

// Підключення стилів з src/scss/libs
import "./tippy.scss";
// Підключення стилів з node_modules
//import 'tippy.js/dist/tippy.css';

// Запускаємо та додаємо в об'єкт модулів
document.querySelector('[data-fls-tippy-content]') ?
	tippy('[data-fls-tippy-content]', {}) : null