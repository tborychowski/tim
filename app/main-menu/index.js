const { shell, Menu } = require('electron').remote;
const $ = require('../util');
const EVENT = require('../db/events');

const menuTemplate = [
	{
		label: 'GithubBrowser',
		submenu: [
			{ role: 'about' },
			{
				label: 'Check for Updates...',
				click () { $.trigger(EVENT.updater.check); }
			},
			{ type: 'separator' },
			{
				label: 'Preferences...',
				accelerator: 'CmdOrCtrl+,',
				click () { $.trigger(EVENT.settings.show); }
			},
			{ type: 'separator' },
			{ role: 'services', submenu: [] },
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
				click () { $.trigger(EVENT.search.start); }
			}
		]
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click () { $.trigger(EVENT.frame.goto, 'refresh'); }
			},
			{
				label: 'Focus address bar',
				accelerator: 'CmdOrCtrl+L',
				click () { $.trigger(EVENT.address.focus); }
			},
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
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
				click () { $.trigger(EVENT.frame.devtools); }
			},
			{
				label: 'Toggle Notifications Developer Tools',
				accelerator: '',
				click () { $.trigger(EVENT.notifications.devtools); }
			},
			{ type: 'separator' },
			{
				label: 'Purge Everything (settings, cookies, history)',
				accelerator: 'CmdOrCtrl+Shift+Backspace',
				click () { $.trigger(EVENT.frame.purge); }
			}
		]
	},
	{
		role: 'help',
		submenu: [
			{ label: 'Github Page', click () {
				shell.openExternal('https://github.com/tborychowski/github-browser');
			}}
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
