'use strict';

var BrowserWindow = require('electron').remote.BrowserWindow;

var _require = require('../services'),
    helper = _require.helper;

var windowStateKeeper = require('electron-window-state');

function open(url) {
	var windowState = windowStateKeeper({
		defaultWidth: 1000,
		defaultHeight: 800,
		file: 'preview-window-state.json',
		path: helper.getUserDataFolder()
	});

	var win = new BrowserWindow({
		vibrancy: 'popover',
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height
	});
	windowState.manage(win);

	win.on('closed', function () {
		win = null;
	});

	url = encodeURIComponent(url);
	win.loadURL('file://' + __dirname + '/index.html?' + url);
}

module.exports = {
	open: open
};