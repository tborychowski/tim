const { Menu, app } = require('electron').remote;
const { EVENT, helper } = require('../services');
const $ = require('../util');
const name = app.getName();
const ver = app.getVersion();

const menuTemplate = [
	{
		label: 'GithubBrowser',
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },

			{ label: 'Check for Updates...', click: () => $.trigger(EVENT.updater.check) },
			{ label: 'Changelog', click: () => helper.openChangelog(ver) },
			{ type: 'separator' },

			{
				label: 'Preferences...',
				accelerator: 'CmdOrCtrl+,',
				click: () => $.trigger(EVENT.settings.show)
			},
			{ type: 'separator' },

			{ role: 'services', submenu: [] },
			{ type: 'separator' },

			{ label: 'Hide ' + name, accelerator: 'Command+H', role: 'hide' },
			{ label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
			{ label: 'Show All', role: 'unhide' },
			{ type: 'separator' },

			{ role: 'quit' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'pasteandmatchstyle' },
			{ role: 'delete' },
			{ role: 'selectall' },
			{ type: 'separator' },
			{
				label: 'Find',
				accelerator: 'CmdOrCtrl+F',
				click: () => $.trigger(EVENT.search.start)
			}
		]
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click: () => $.trigger(EVENT.frame.goto, 'refresh')
			},
			{
				label: 'Focus address bar',
				accelerator: 'CmdOrCtrl+L',
				click: () => $.trigger(EVENT.address.focus)
			},
			{ type: 'separator' },
			{
				label: 'Reset Zoom',
				accelerator: 'CmdOrCtrl+0',
				click: () => $.trigger(EVENT.frame.resetzoom)
			},
			{
				label: 'Zoom In',
				accelerator: 'CmdOrCtrl+Plus',
				click: () => $.trigger(EVENT.frame.zoomin)
			},
			{
				label: 'Zoom Out',
				accelerator: 'CmdOrCtrl+-',
				click: () => $.trigger(EVENT.frame.zoomout)
			},
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	},
	{
		role: 'window',
		submenu: [
			{ role: 'minimize' },
			{ role: 'close' }
		]
	},
	{
		label: 'Dev',
		submenu: [
			{ role: 'toggledevtools' },
			{
				label: 'Toggle Main Frame Developer Tools',
				accelerator: '',
				click: () => $.trigger(EVENT.frame.devtools)
			},
			{
				label: 'Toggle Notifications Developer Tools',
				accelerator: '',
				click: () => $.trigger(EVENT.notifications.devtools)
			},
			{ type: 'separator' },
			{
				label: 'Purge Everything (settings, cookies, history)',
				accelerator: 'CmdOrCtrl+Shift+Backspace',
				click: () => $.trigger(EVENT.frame.purge)
			}
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Github Page',
				click: () => helper.openInBrowser('https://github.com/tborychowski/github-browser')
			}
		]
	}
];



function init () {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
}


module.exports = {
	init
};
