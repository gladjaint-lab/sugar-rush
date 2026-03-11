// Налаштування шаблону
import templateConfig from '../template.config.js'
// Логгер
import logger from './logger.js'

import fs from 'node:fs';
import path from 'node:path'

const projectName = path.basename(path.resolve()).toLowerCase()
const isProduction = process.env.NODE_ENV === 'production'
const isShowStat = process.argv.includes('--stat')
const isClearStat = process.argv.includes('--stat-clear')

const time = Date.now()
const date = new Date
const file = path.resolve('template_modules/statistics/data.json')
const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
const dataStatistics = data.statistics
let dataSessions = data.statistics.sessions;
let dataFiles = data.statistics.files;

global.serverInit

// Плагіни
export const statPlugins = [{
	name: 'stat-dev',
	enforce: 'pre',
	configureServer: {
		order: 'pre',
		handler: async () => {
			if (!global.serverInit && templateConfig.statistics.enable) {
				global.serverInit = true

				// Зупинка сервера (Ctrl+C)
				process.on('SIGINT', endSession)
				// Зупинка сервера (SIGTERM)
				process.on('SIGTERM', endSession)
				// Зупинка сервера (SIGHUP)
				process.on('SIGHUP', endSession)

				const session = {
					date: formatDate(date),
					start: time,
					end: time
				}
				// Старт сесії
				dataSessions.push(session)
				await writeSession()

				!isProduction ? logger('_STAT_ON') : null
			}
		}
	}, handleHotUpdate({ file, server }) {
		if (templateConfig.statistics.enable) {
			file = file.split('/').pop()
			!dataFiles.includes(file) ? dataFiles.push(file) : null
			writeSession()
		}
	}
}, {
	name: 'stat-build',
	apply: 'build',
	writeBundle: async () => {
		templateConfig.statistics.enable ? endSession('build') : null
		templateConfig.statistics.showonbuild ? showStat(dataStatistics) : null
	}
}]
// Кінець сесії
async function endSession(type) {
	if (dataSessions.length) {
		const lastSession = dataSessions[dataSessions.length - 1]
		if (lastSession.type !== 'build') {
			lastSession.end = Date.now()
			isProduction ? lastSession.type = 'build' : null
			await writeSession()
		}
	}
	if (type !== 'build') {
		process.exit()
	}
}
// Запис сесії
async function writeSession() {
	fs.writeFileSync(file, JSON.stringify(data, null, 2))
}
// Формат дати
function formatDate(date) {
	const d = new Date(date);
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	return `${day}.${month}.${year}`;
}
// Формат часу
function formatMilliseconds(ms) {
	const seconds = Math.floor((ms / 1000) % 60);
	const minutes = Math.floor((ms / (1000 * 60)) % 60);
	const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
	const days = Math.floor(ms / (1000 * 60 * 60 * 24));
	const parts = [];
	if (days > 0) parts.push(`${days} ${days[days.length - 1] === 1 ? 'дeнь' : 'днів'}`);
	if (hours > 0) parts.push(`${hours} год`);
	if (minutes > 0) parts.push(`${minutes} хв`);
	if (seconds > 0 || parts.length === 0) parts.push(`${seconds} сек`);

	return parts.join(' ');
}
// Показ статистики
function showStat(data) {
	const dataSessions = data.sessions
	const dataFiles = data.files
	if (dataSessions.length) {
		function getTime(dataSessions) {
			let timeCounter = 0
			dataSessions.forEach(dataSession => {
				timeCounter = timeCounter + (dataSession.end - dataSession.start)
			});
			return formatMilliseconds(timeCounter)
		}
		function getSessions(dataSessions) {
			return dataSessions.length
		}
		function getFiles(dataFiles, count) {
			if (count) {
				return dataFiles.length
			} else {
				console.table(dataFiles)
			}
		}
		function getTimePerDay(dataSessions) {
			let grouped = {}
			dataSessions.forEach(dataSession => {
				const time = dataSession.end - dataSession.start
				if (!grouped[dataSession.date]) {
					grouped[dataSession.date] = 0
				}
				grouped[dataSession.date] += time
			});
			const timePerDay = Object.entries(grouped).map(([date, time]) => {
				time = formatMilliseconds(time)
				return {
					date,
					time
				}
			});
			console.table(timePerDay)
		}
		function getDateRange(dataSessions, type) {
			return type === 'start' ? dataSessions[0].date : dataSessions[dataSessions.length - 1].date
		}
		logger(`_STAT_TITLE`, projectName)
		logger(`_STAT_SHOW_START`, getDateRange(dataSessions, 'start'))
		logger(`_STAT_SHOW_END`, getDateRange(dataSessions, 'end'))
		logger(`_STAT_SHOW_TIME`, getTime(dataSessions))
		logger(`_STAT_SHOW_FILES`, getFiles(dataFiles, true))
		logger(`_STAT_SHOW_SESSIONS`, getSessions(dataSessions))
		logger(`_STAT_SHOW_TIME_TITLE`)
		getTimePerDay(dataSessions)
		//logger(`(!)`)
		//logger(`_STAT_SHOW_FILES_TITLE`)
		//getFiles(dataFiles, false)
		//logger(`(!)`)
	} else {
		logger(`_STAT_NONE`)
	}
	!templateConfig.statistics.enable ? logger(`_STAT_OFF`) : null
}
function clearStat() {
	data.statistics.sessions = []
	data.statistics.files = []
	logger('_STAT_CLEAR')
	writeSession()
}

isClearStat ? clearStat() : null
isShowStat ? showStat(dataStatistics) : null
