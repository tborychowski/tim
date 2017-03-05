const {app, BrowserWindow} = require('electron');
const windowStateKeeper = require('electron-window-state');
const EVENT = require('./app/db/events');
const updater = require('./app/updater/main');

const send = (name, val) => win.webContents.send(name, val);

let win;

app.on('ready', () => {
	// Load the previous state with fallback to defaults
	const mainWindowState = windowStateKeeper({ defaultWidth: 1000, defaultHeight: 800 });

	win = new BrowserWindow({
		title: 'Github Browser',
		icon:'assets/icon.png',
		show: false,
		// vibrancy: 'sidebar',
		// transparent: true,
		// titleBarStyle: 'hidden-inset',
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height
	});
	win.on('closed', () => win = null);
	win.on('scroll-touch-begin', () => { send('event', EVENT.swipe.start); });
	win.on('scroll-touch-end', () => { send('event', EVENT.swipe.end); });

	mainWindowState.manage(win);

	win.loadURL(`file://${__dirname}/index.html`);
	win.show();

	updater.init(win);
});


app.on('open-url', (ev, url) => {		// opening URL in GHB
	if (win && win.webContents) {
		win.restore();
		send(EVENT.frame.goto, url);
		if (ev) ev.preventDefault();
	}
	else global.appArgs = [url];		// opening URL in closed GHB
});

app.on('window-all-closed', app.quit);

global.appArgs = process.argv;			// opening URL from CLI
