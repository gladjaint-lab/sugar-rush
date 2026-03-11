import { exec } from "child_process"

import logger from '../logger.js'

const args = process.argv.slice(2)

const isMacOS = process.platform === "darwin"
const isLinux = process.platform === "linux"

const isSudo = isMacOS || isLinux ? "sudo " : ""

const startScriptString = `${isSudo}docker compose up -d`
const stopScriptString = `${isSudo}docker compose down --volumes`

if (args.includes("up")) {
	dockerStart()
} else if (args.includes("down")) {
	dockerStop()
}
function dockerStart() {
	logger("(!)Запуск Docker...")
	exec(startScriptString, (error, stdout, stderr) => {
		if (error) {
			logger(`(!!)Помилка: ${error.message}`)
			return
		}
		//if (stderr) {
		//	logger(`Попередження: ${stderr}`)
		//}
		logger(`Docker запущено`) //:\n${stdout}
	})
}
function dockerStop() {
	logger("(!)Зупинка Docker...")
	exec(stopScriptString, (error, stdout, stderr) => {
		if (error) {
			logger(`(!!)Помилка: ${error.message}`)
			return
		}
		//if (stderr) {
		//logger(`(!!)Попередження: ${stderr}`)
		//}
		logger(`Docker зупинено`) //:\n${stdout}
	})
}