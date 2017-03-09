const {BrowserWindow, app} = require('electron').remote;
const windowStateKeeper = require('electron-window-state');

function open (url) {
	const windowState = windowStateKeeper({
		defaultWidth: 1000,
		defaultHeight: 800,
		file: 'preview-window-state.json',
		path: app.getPath('userData')
	});

	let win = new BrowserWindow({
		vibrancy: 'popover',
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height
	});
	windowState.manage(win);

	win.on('closed', () => { win = null; });

	url = encodeURIComponent(url);
	win.loadURL(`file://${__dirname}/index.html?${url}`);
}


module.exports = {
	open
};
