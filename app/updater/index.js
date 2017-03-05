const { ipcRenderer, remote } = require('electron');
const $ = require('../util');
const EVENT = require('../db/events');
const dialog = remote.dialog;
const appName = remote.app.getName();
const appVersion = remote.app.getVersion();


const send = (name, value) => ipcRenderer.send('updater', name, value);

const events = {
	'checking-for-update': checkingForUpdate,
	'update-available': updateAvailable,
	'update-not-available': updateNotAvailable,
	'error': error,
	'download-progress': downloadProgress,
	'update-downloaded': updateDownloaded,
};


function checkingForUpdate () {
	console.log('Checking for update...');
}

function updateAvailable (resp) {
	dialog.showMessageBox({
		type: 'question',
		title: 'Update',
		message: `There is a newer version available.\nYou have: ${appVersion}\nAvailable: ${resp.version}`,
		buttons: [ 'Cancel', 'Download' ],
		defaultId: 1,
	}, res => { if (res === 1) send('download'); });
}

function updateNotAvailable () {
	dialog.showMessageBox({
		type: 'info',
		title: 'Update',
		message: `You have the latest version of ${appName} ${appVersion}`,
		buttons: [ 'OK' ]
	});
}

function error () {
	dialog.showErrorBox('Error', 'There was an error with the upload.\nPlease try again later.');
}

function downloadProgress () {
	console.log('Downloading update...');
}

function updateDownloaded () {
	dialog.showMessageBox({
		type: 'question',
		title: 'Update',
		message: 'Update downloaded.\nDo you want to install it now or next time you start the app?',
		buttons: [ 'Install later', 'Quit and install' ],
		defaultId: 1,
	}, res => { if (res === 1) send('install'); });
}


function checkForUpdates () {
	send('check');
}


function onEvent (ev, name, params) {
	if (typeof events[name] === 'function') events[name](params);
}


function init () {
	ipcRenderer.on('updater', onEvent);
	$.on(EVENT.updater.check, checkForUpdates);
}


module.exports = {
	init
};
