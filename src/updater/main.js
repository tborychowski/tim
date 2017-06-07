/**
 * Handles update in the main process
 *
 * Uses electron-builder/updater
 * API docs: https://github.com/electron-userland/electron-builder/wiki/Auto-Update
 *
 */

const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = require('../services/isDev');
let win = null;

if (isDev) {
	const log = require('electron-log');
	autoUpdater.logger = log;
	autoUpdater.logger.transports.file.level = 'debug';
	autoUpdater.updateConfigPath = './app-update.yml';
	autoUpdater.autoDownload = true;
}
else autoUpdater.autoDownload = false;


const send = (name, val) => win.webContents.send('updater', name, val);

autoUpdater.on('checking-for-update', ev => send('checking-for-update', ev));
autoUpdater.on('update-available', ev => { send('update-available', ev); });
autoUpdater.on('update-not-available', ev => send('update-not-available', ev));
autoUpdater.on('error', ev => send('update-error', ev));
autoUpdater.on('download-progress', ev => send('download-progress', ev));
autoUpdater.on('update-downloaded', ev => send('update-downloaded', ev));

function init (currentWin) {
	win = currentWin;

	// handle: checkForUpdates, downloadUpdate, quitAndInstall
	ipcMain.on('updater', (event, msg) => {
		if (msg && typeof autoUpdater[msg] === 'function') autoUpdater[msg]();
	});
}


module.exports = {
	init
};
