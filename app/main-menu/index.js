const {shell, Menu} = require('electron');

let win;

const menuTemplate = [
	{
		label: 'GithubBrowser',
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{
				label: 'Preferences...',
				accelerator: 'CmdOrCtrl+,',
				click () { win.webContents.send('menu', 'open-settings'); }
			},
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
				click () { win.webContents.send('menu', 'find-in-page'); }
			}
		]
	},
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{
				label: 'Focus address bar',
				accelerator: 'CmdOrCtrl+L',
				click () { win.webContents.send('menu', 'focus-addressbar'); }
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
				click () { win.webContents.send('menu', 'toggle-main-frame-devtools'); }
			},
			{
				label: 'Toggle Notifications Developer Tools',
				accelerator: '',
				click () { win.webContents.send('menu', 'toggle-notifications-devtools'); }
			},
			{ type: 'separator' },
			{
				label: 'Purge Everything (settings, cookies, history)',
				accelerator: 'CmdOrCtrl+Shift+Backspace',
				click () { win.webContents.send('menu', 'clear-cookies'); }
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



module.exports = function (window) {
	win = window;
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
};
