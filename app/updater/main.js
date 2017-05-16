'use strict';

var _require = require('electron'),
    ipcMain = _require.ipcMain;

var _require2 = require('electron-updater'),
    autoUpdater = _require2.autoUpdater;

var isDev = require('../services/isDev');
var win = null;

if (isDev) {
	var log = require('electron-log');
	autoUpdater.logger = log;
	autoUpdater.logger.transports.file.level = 'debug';
	autoUpdater.updateConfigPath = './app-update.yml';
	autoUpdater.autoDownload = true;
} else autoUpdater.autoDownload = false;

var send = function send(name, val) {
	return win.webContents.send('updater', name, val);
};

autoUpdater.on('checking-for-update', function (ev) {
	return send('checking-for-update', ev);
});
autoUpdater.on('update-available', function (ev) {
	send('update-available', ev);
});
autoUpdater.on('update-not-available', function (ev) {
	return send('update-not-available', ev);
});
autoUpdater.on('error', function (ev) {
	return send('update-error', ev);
});
autoUpdater.on('download-progress', function (ev, progressObj) {
	return send('download-progress', progressObj);
});
autoUpdater.on('update-downloaded', function (ev) {
	return send('update-downloaded', ev);
});

function init(currentWin) {
	win = currentWin;
	ipcMain.on('updater', function (event, msg) {
		if (msg && typeof autoUpdater[msg] === 'function') autoUpdater[msg]();
	});
}

module.exports = {
	init: init
};