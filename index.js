const {app, shell, BrowserWindow, Menu} = require('electron');
const windowStateKeeper = require('electron-window-state');

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
			{ role: 'selectall' }
		]
	},
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
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
		role: 'help',
		submenu: [
			{ label: 'Github Page', click () {
				shell.openExternal('https://github.com/tborychowski/github-browser');
			}},
			{ type: 'separator' },
			{
				label: 'Clear Cookies & Config',
				accelerator: 'CmdOrCtrl+Shift+Backspace',
				click () { win.webContents.send('menu', 'clear-cookies'); }
			},
		]
	}
];
const menu = Menu.buildFromTemplate(menuTemplate);



app.on('window-all-closed', app.quit);
app.on('ready', () => {
	Menu.setApplicationMenu(menu);

	// Load the previous state with fallback to defaults
	let mainWindowState = windowStateKeeper({
		defaultWidth: 1000,
		defaultHeight: 800
	});

	win = new BrowserWindow({
		title: 'Issue Monitor',
		icon:'assets/icon.png',
		show: false,
		frame: false,
		hasShadow: true,
		titleBarStyle: 'hidden-inset',
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height
	});

	mainWindowState.manage(win);

	win.loadURL(`file://${__dirname}/index.html`);
	win.show();

	win.on('closed', () => win = null);
});
