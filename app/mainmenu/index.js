'use strict';

var _require$remote = require('electron').remote,
    Menu = _require$remote.Menu,
    app = _require$remote.app;

var _require = require('../services'),
    EVENT = _require.EVENT,
    helper = _require.helper;

var $ = require('../util');
var name = app.getName();
var ver = app.getVersion();

var menuTemplate = [{
	label: 'GithubBrowser',
	submenu: [{ role: 'about' }, { type: 'separator' }, { label: 'Check for Updates...', click: function click() {
			return $.trigger(EVENT.updater.check);
		} }, { label: 'Changelog', click: function click() {
			return helper.openChangelog(ver);
		} }, { type: 'separator' }, {
		label: 'Preferences...',
		accelerator: 'CmdOrCtrl+,',
		click: function click() {
			return $.trigger(EVENT.settings.show);
		}
	}, { type: 'separator' }, { role: 'services', submenu: [] }, { type: 'separator' }, { label: 'Hide ' + name, accelerator: 'Command+H', role: 'hide' }, { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' }, { label: 'Show All', role: 'unhide' }, { type: 'separator' }, { role: 'quit' }]
}, {
	label: 'Edit',
	submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'pasteandmatchstyle' }, { role: 'delete' }, { role: 'selectall' }, { type: 'separator' }, {
		label: 'Find',
		accelerator: 'CmdOrCtrl+F',
		click: function click() {
			return $.trigger(EVENT.search.start);
		}
	}]
}, {
	label: 'View',
	submenu: [{
		label: 'Reload',
		accelerator: 'CmdOrCtrl+R',
		click: function click() {
			return $.trigger(EVENT.frame.goto, 'refresh');
		}
	}, {
		label: 'Focus address bar',
		accelerator: 'CmdOrCtrl+L',
		click: function click() {
			return $.trigger(EVENT.address.focus);
		}
	}, { type: 'separator' }, {
		label: 'Reset Zoom',
		accelerator: 'CmdOrCtrl+0',
		click: function click() {
			return $.trigger(EVENT.frame.resetzoom);
		}
	}, {
		label: 'Zoom In',
		accelerator: 'CmdOrCtrl+Plus',
		click: function click() {
			return $.trigger(EVENT.frame.zoomin);
		}
	}, {
		label: 'Zoom Out',
		accelerator: 'CmdOrCtrl+-',
		click: function click() {
			return $.trigger(EVENT.frame.zoomout);
		}
	}, { type: 'separator' }, { role: 'togglefullscreen' }]
}, {
	role: 'window',
	submenu: [{ role: 'minimize' }, { role: 'close' }]
}, {
	label: 'Dev',
	submenu: [{ role: 'toggledevtools' }, {
		label: 'Toggle Main Frame Developer Tools',
		accelerator: '',
		click: function click() {
			return $.trigger(EVENT.frame.devtools);
		}
	}, {
		label: 'Toggle Notifications Developer Tools',
		accelerator: '',
		click: function click() {
			return $.trigger(EVENT.notifications.devtools);
		}
	}, { type: 'separator' }, {
		label: 'Purge Everything (settings, cookies, history)',
		accelerator: 'CmdOrCtrl+Shift+Backspace',
		click: function click() {
			return $.trigger(EVENT.frame.purge);
		}
	}]
}, {
	role: 'help',
	submenu: [{
		label: 'Github Page',
		click: function click() {
			return helper.openInBrowser('https://github.com/tborychowski/github-browser');
		}
	}]
}];

function init() {
	var menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
}

module.exports = {
	init: init
};