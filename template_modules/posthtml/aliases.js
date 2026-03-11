/**
 * Універсальна функція для заміни аліасів у рядках, об’єктах або масивах.
 * @param {string | object | Array} data - Дані для обробки (рядок, об’єкт або масив).
 * @param {Object} options - Опції для заміни.
 * @param {boolean} [options.prependDot=false] - Чи додавати крапку ('.') на початку шляху.
 * @param {boolean} [options.normalizePath=true] - Чи нормалізувати шлях (прибирати подвійні слеші).
 * @param {boolean} [options.sortAliases=true] - Чи сортувати аліаси за довжиною (довші першими).
 * @param {boolean} [options.preserveOriginal=true] - Чи повертати оригінальні дані, якщо аліасів немає.
 * @param {Function} [options.transformReplacement] - Функція для трансформації значення заміни.
 * @returns {string | object | Array} - Оброблені дані з заміненими аліасами.
 */
import templateCfg from '../../template.config.js'

const replaceAliases = (data, { prependDot = false, normalizePath = true, sortAliases = true, preserveOriginal = true, transformReplacement } = {}) => {
	const aliases = templateCfg.aliases || {}

	// Якщо аліасів немає і preserveOriginal увімкнено, повертаємо оригінальні дані
	if (preserveOriginal && Object.keys(aliases).length === 0) {
		return data
	}
	// Функція для екранування спеціальних символів у регулярних виразах
	const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

	// Обробка рядків
	if (typeof data === 'string') {
		let result = data
		// Сортуємо аліаси за довжиною (довші першими), якщо sortAliases увімкнено
		const sortedAliases = sortAliases
			? Object.keys(aliases).sort((a, b) => b.length - a.length)
			: Object.keys(aliases)

		sortedAliases.forEach((alias) => {
			const regex = new RegExp(escapeRegExp(alias), 'g')
			if (result.match(regex)) {
				let replacement = aliases[alias]
				// Додаємо крапку, якщо потрібно
				if (prependDot) {
					replacement = `.${replacement}`
				}
				// Застосовуємо кастомну трансформацію, якщо передана
				if (typeof transformReplacement === 'function') {
					replacement = transformReplacement(replacement, alias)
				}
				result = result.replace(regex, replacement)
			}
		})
		// Нормалізуємо шлях, якщо потрібно
		if (normalizePath && !result.startsWith('http')) {
			result = result.replace(/\/+/g, '/')
		}
		// Прибираємо SRC
		const src = new RegExp('src/', 'g')
		result = result.includes('src/') ? result.replace(src, '') : result

		return result
	}

	// Обробка масивів
	if (Array.isArray(data)) {
		return data.map(item => replaceAliases(item, { prependDot, normalizePath, sortAliases, preserveOriginal, transformReplacement }))
	}

	// Обробка об’єктів
	if (data && typeof data === 'object') {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => [
				key,
				replaceAliases(value, { prependDot, normalizePath, sortAliases, preserveOriginal, transformReplacement }),
			])
		)
	}

	// Повертаємо незмінені дані, якщо це не рядок, масив чи об’єкт
	return data
}

export default replaceAliases