const {app, BrowserWindow} = require('electron');
const windowStateKeeper = require('electron-window-state');
const EVENT = require('./app/services/events');
const config = require('./app/services/config');
const helper = require('./app/services/helper');
const updater = require('./app/updater/main');

let win;


// auto-handle file downloads with progressbar
require('electron-dl')();

const send = (name, val) => win.webContents.send(name, val);
function openUrl (ev, url) {
	console.log(ev, url);
	if (win && win.webContents) {
		win.restore();
		send(EVENT.frame.goto, url);
		if (ev) ev.preventDefault();
	}
	else global.appArgs = [url];		// opening URL in closed GHB
}

function createWindow () {
	const mainWindowState = windowStateKeeper({ defaultWidth: 1000, defaultHeight: 800 });

	win = new BrowserWindow({
		title: helper.appName,
		icon: __dirname + '/assets/icon.png',
		show: false,
		vibrancy: 'dark',
		titleBarStyle: 'hiddenInset',
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		webPreferences: {
			nodeIntegration: true,
			webviewTag: true,
		}
	});
	win.on('closed', () => win = null);
	win.on('scroll-touch-begin', () => send('event', EVENT.swipe.start));
	win.on('scroll-touch-end', () => send('event', EVENT.swipe.end));
	win.webContents.on('crashed', () => { win.destroy(); createWindow(); });

	mainWindowState.manage(win);

	win.loadURL(`file://${__dirname}/index.html`);
	win.show();

	// win.webContents.openDevTools();

	updater.init(win);
}

app.on('window-all-closed', app.quit);
app.on('ready', createWindow);
app.on('open-url', openUrl);			// opening URL in GHB

const dontAsk = config.get('defaultBrowser-dont-ask');
if (!app.isDefaultProtocolClient('http') && !dontAsk) {
	app.setAsDefaultProtocolClient('http');
	config.set('defaultBrowser-dont-ask', true);
}

global.appArgs = process.argv;			// opening URL from CLI
