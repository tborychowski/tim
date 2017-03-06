const { ipcRenderer, remote } = require('electron');
const $ = require('../util');
const EVENT = require('../db/events');
const isDev = require('electron-is-dev');

const dialog = remote.dialog;
const appName = remote.app.getName();
const appVersion = remote.app.getVersion();

let IS_INITIAL = false;
const send = (name, value) => ipcRenderer.send('updater', name, value);
const log = msg => isDev && console.log(msg);

const events = {
	'checking-for-update': checkingForUpdate,
	'update-available': updateAvailable,
	'update-not-available': updateNotAvailable,
	'error': error,
	'download-progress': downloadProgress,
	'update-downloaded': updateDownloaded,
};


function checkingForUpdate () {
	log('Checking for update...');
}

function updateAvailable (resp) {
	log('Update available');
	dialog.showMessageBox({
		type: 'question',
		title: 'Update',
		message: 'There is a newer version available.',
		detail: `You have: ${appVersion}\nAvailable: ${resp.version}`,
		buttons: [ 'Cancel', 'Download' ],
		defaultId: 1,
	}, res => { if (res === 1) send('download'); });
	updatingDone();
}

function updateNotAvailable () {
	log('Update not available');
	if (!IS_INITIAL) {
		dialog.showMessageBox({
			type: 'info',
			title: 'Update',
			message: `You have the latest version of\n${appName} ${appVersion}`,
			detail: 'No need to update',
			buttons: [ 'OK' ],
			defaultId: 0,
		});
	}
	updatingDone();
}

function error () {
	dialog.showErrorBox('Error', 'There was an error with the upload.\nPlease try again later.');
}

function downloadProgress () {
	log('Downloading update...');
}

function updateDownloaded () {
	log('Update downloaded');
	dialog.showMessageBox({
		type: 'question',
		title: 'Update',
		message: 'Update downloaded.\nDo you want to install it now or next time you start the app?',
		buttons: [ 'Install later', 'Quit and install' ],
		defaultId: 1,
	}, res => { if (res === 1) send('install'); });
}


function checkForUpdates (isInitial = false) {
	// don't show the "you have the latest" window, when triggered automatically
	if (isInitial === true) IS_INITIAL = true;
	send('check');
}

function updatingDone () {
	IS_INITIAL = false;
}


function onEvent (ev, name, params) {
	if (typeof events[name] === 'function') events[name](params);
}


function init () {
	ipcRenderer.on('updater', onEvent);
	$.on(EVENT.updater.check, checkForUpdates);
	setTimeout(() => checkingForUpdate(true), 5000);
}


module.exports = {
	init
};
