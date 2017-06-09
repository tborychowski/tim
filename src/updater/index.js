/**
 * Handles update in the renderer process
 *
 * Uses electron-builder/updater
 * API docs: https://github.com/electron-userland/electron-builder/wiki/Auto-Update
 *
 */


const { ipcRenderer, remote } = require('electron');
const { EVENT, helper, isDev, dialog } = require('../services');
const $ = require('../util');

const appName = remote.app.getName();
const appVersion = remote.app.getVersion();
let availableVersion = null;

let SILENT = true;
let IS_DOWNLOADING = false;

const send = (name, value) => ipcRenderer.send('updater', name, value);
const log = (...args) => isDev && console.log.apply(console, args);


const events = {
	'checking-for-update': () => log('Checking for update...'),
	'update-available': updateAvailable,
	'update-not-available': updateNotAvailable,
	'download-progress': updateProgress,
	'update-downloaded': updateDownloaded,
	'update-error': err => {
		if (SILENT || isDev) log('Update error', err);
		else dialog.error('There was an error with the update.\nPlease try again later.');
	},
};


// bytesPerSecond, delta, percent, total, transferred
function updateProgress (prog) {
	const per = Math.round(prog.percent);
	$.trigger(EVENT.updater.nav.progress, per);
}


function showChangelog () {
	helper.openChangelog(availableVersion);
}


// 1
function checkForUpdates () {
	if (IS_DOWNLOADING) {
		if (!SILENT) {
			dialog.info({
				title: 'Update',
				message: 'An update was found and is downloading.',
				detail: 'Thanks for your patience!'
			});
		}
	}
	else {
		$.trigger(EVENT.updater.nav.progress);	// reset to 0
		send('checkForUpdates');
	}
}

// 2a
function updateNotAvailable () {
	log('Update not available');
	if (SILENT) return;
	dialog.info({
		title: 'Update',
		message: `You have the latest version of\n${appName} ${appVersion}`,
		detail: 'There are no new updates at this time.'
	});
}

// 2b
function updateAvailable (resp) {
	log('Update available');
	availableVersion = resp.version;
	if (SILENT) return download();

	// $.trigger(EVENT.updater.nav.show);
	dialog.question({
		title: 'Update',
		message: 'There is a newer version available.',
		detail: `You have: ${appVersion}\nAvailable: ${availableVersion}`,
		buttons: [ 'Cancel', 'Update', 'Changelog' ]
	})
	.then(res => {
		if (res === 1) return download();
		if (res === 2) return showChangelog();
	});
}

// 3
function download () {
	IS_DOWNLOADING = true;
	send('downloadUpdate');
}

// 4
function updateDownloaded () {
	log('Update downloaded');
	$.trigger(EVENT.updater.nav.progress);
	$.trigger(EVENT.updater.nav.show);

	if (!SILENT) quitAndInstall();
}

// 5
function quitAndInstall () {
	dialog.question({
		title: 'Update',
		message: 'Update downloaded.\nDo you want to install it now or next time you start the app?',
		buttons: [ 'Install later', 'Quit and install', 'Changelog' ]
	})
	.then(res => {
		if (res === 1) return send('quitAndInstall');
		if (res === 2) return showChangelog();
	});
}


function init () {
	ipcRenderer.on('updater', (ev, name, params) => {
		if (typeof events[name] === 'function') events[name](params);
	});
	$.on(EVENT.updater.check, () => {
		SILENT = false;
		checkForUpdates();
	});
	$.on(EVENT.updater.nav.clicked, quitAndInstall);

	setTimeout(() => { if (SILENT) checkForUpdates(); }, 5000);
}


module.exports = {
	init
};
