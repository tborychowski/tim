const {app, BrowserWindow} = require('electron');
const windowStateKeeper = require('electron-window-state');
const menu = require('./app/main-menu');
let win;

global.appArgs = process.argv;

app.on('window-all-closed', app.quit);
app.on('ready', () => {

	// Load the previous state with fallback to defaults
	let mainWindowState = windowStateKeeper({ defaultWidth: 1000, defaultHeight: 800 });

	win = new BrowserWindow({
		title: 'Github Browser',
		icon:'assets/icon.png',
		show: false,
		// frame: false,
		// hasShadow: true,
		// vibrancy: 'dark',
		// transparent: true,
		titleBarStyle: 'hidden-inset',
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height
	});

	mainWindowState.manage(win);

	menu(win);

	win.on('scroll-touch-begin', () => { win.webContents.send('swipe-start'); });
	win.on('scroll-touch-end', () => { win.webContents.send('swipe-end'); });
	win.on('swipe', (dir) => { win.webContents.send('swipe', dir); });

	win.loadURL(`file://${__dirname}/index.html`);
	win.show();

	win.on('closed', () => win = null);
});

app.on('open-url', (ev, url) => {
	if (win && win.webContents) {
		win.webContents.send('goto-url', url);
		if (ev) ev.preventDefault();
	}
	else global.appArgs = [url];
});
