const { ipcRenderer, remote } = require('electron');
const { EVENT, helper, isDev } = require('../services');
const $ = require('../util');

const dialog = require('./dialog');
const appName = remote.app.getName();
const appVersion = remote.app.getVersion();
let availableVersion = null;

let SILENT = false;
let IS_DOWNLOADING = false;
const send = (name, value) => ipcRenderer.send('updater', name, value);
const log = msg => isDev && console.log(msg);


const events = {
	'checking-for-update': () => log('Checking for update...'),
	'update-available': updateAvailable,
	'update-not-available': updateNotAvailable,
	'download-progress': () => log('Downloading update...'),
	'update-downloaded': updateDownloaded,
	'update-error': (err) => {
		if (SILENT || isDev) log('Update error', err);
		else dialog.error('There was an error with the update.\nPlease try again later.');
	},
};


function showChangelog () {
	helper.openChangelog(availableVersion);
}


function checkForUpdates (silent) {
	if (IS_DOWNLOADING) dialog.info('The update was found and it\'s already downloading.', 'Please be patient.');
	SILENT = (silent === true);
	send('check');
}

function updateNotAvailable () {
	log('Update not available');
	if (!SILENT) dialog.info(`You have the latest version of\n${appName} ${appVersion}`, 'No need to update');
}

function updateAvailable (resp) {
	log('Update available');
	availableVersion = resp.version;
	if (SILENT) return download();

	$.trigger(EVENT.updater.nav.show);
	dialog.question({
		message: 'There is a newer version available.',
		detail: `You have: ${appVersion}\nAvailable: ${availableVersion}`,
		buttons: [ 'Cancel', 'Update', 'Changelog' ]
	})
	.then(res => {
		if (res === 1) return download();
		if (res === 2) return showChangelog();
	});
}


function download () {
	IS_DOWNLOADING = true;
	send('download');
}

function updateDownloaded () {
	log('Update downloaded');
	if (SILENT) $.trigger(EVENT.updater.nav.show);
	else updateDownloadedInstall();
}


function updateDownloadedInstall () {
	dialog.question({
		message: 'Update downloaded.\nDo you want to install it now or next time you start the app?',
		buttons: [ 'Install later', 'Quit and install', 'Changelog' ]
	})
	.then(res => {
		if (res === 1) return send('install');
		if (res === 2) return showChangelog();
	});
}


function init () {
	ipcRenderer.on('updater', (ev, name, params) => {
		if (typeof events[name] === 'function') events[name](params);
	});
	$.on(EVENT.updater.check, checkForUpdates);
	$.on(EVENT.updater.nav.clicked, updateDownloadedInstall);
	if (!isDev) setTimeout(() => checkForUpdates(true), 5000);
}


module.exports = {
	init
};
