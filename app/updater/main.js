const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
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

autoUpdater.on('checking-for-update', (ev) => send('checking-for-update', ev));
autoUpdater.on('update-available', (ev) => { send('update-available', ev); });
autoUpdater.on('update-not-available', (ev) => send('update-not-available', ev));
autoUpdater.on('error', (ev, err) => send('updater-error', JSON.stringify({ev, err}) ));
autoUpdater.on('download-progress', (ev, progressObj) => send('download-progress', progressObj));
autoUpdater.on('update-downloaded', (ev) => send('update-downloaded', ev));

function init (currentWin) {
	win = currentWin;
	ipcMain.on('updater', (event, msg) => {
		if (msg === 'check') return autoUpdater.checkForUpdates();
		if (msg === 'download') return autoUpdater.downloadUpdate();
		if (msg === 'install') return autoUpdater.quitAndInstall();
	});
}


module.exports = {
	init
};
