const { ipcRenderer, remote } = require('electron');
const { EVENT } = require('../services');
const $ = require('../util');
const isDev = require('electron-is-dev');

const dialog = require('./dialog');
const appName = remote.app.getName();
const appVersion = remote.app.getVersion();

let SILENT = false;
let IS_DOWNLOADING = false;
const send = (name, value) => ipcRenderer.send('updater', name, value);
const log = msg => isDev && console.log(msg);

const events = {
	'checking-for-update': () => log('Checking for update...'),
	'update-available': updateAvailable,
	'update-not-available': updateNotAvailable,
	'error': () => dialog.error('There was an error with the upload.\nPlease try again later.'),
	'download-progress': () => log('Downloading update...'),
	'update-downloaded': updateDownloaded,
};


function checkForUpdates (silent) {
	if (IS_DOWNLOADING) dialog.info('The update was found and it\'s already downloading.', 'Please be patient.');
	SILENT = (silent === true);
	send('check');
}

function updateNotAvailable () {
	log('Update not available');
	if (!SILENT) dialog.info(`You have the latest version of\n${appName} ${appVersion}`, 'No need to update');
	SILENT = false;
}

function updateAvailable (resp) {
	log('Update available');
	if (SILENT) return download();
	dialog.question({
		message: 'There is a newer version available.',
		detail: `You have: ${appVersion}\nAvailable: ${resp.version}`,
		buttons: [ 'Cancel', 'Update' ]
	})
	.then(download);
}

function download () {
	IS_DOWNLOADING = true;
	send('download');
}

function updateDownloaded () {
	log('Update downloaded');
	dialog.question({
		message: 'Update downloaded.\nDo you want to install it now or next time you start the app?',
		buttons: [ 'Install later', 'Quit and install' ]
	})
	.then(() => send('install'));
	SILENT = false;
}



function init () {
	ipcRenderer.on('updater', (ev, name, params) => {
		if (typeof events[name] === 'function') events[name](params);
	});
	$.on(EVENT.updater.check, checkForUpdates);
	if (!isDev) setTimeout(() => checkForUpdates(true), 5000);
}


module.exports = {
	init
};
