'use strict';

var _require = require('electron'),
    ipcRenderer = _require.ipcRenderer,
    remote = _require.remote;

var _require2 = require('../services'),
    EVENT = _require2.EVENT,
    helper = _require2.helper,
    isDev = _require2.isDev,
    dialog = _require2.dialog;

var $ = require('../util');

var appName = remote.app.getName();
var appVersion = remote.app.getVersion();
var availableVersion = null;

var SILENT = false;
var IS_DOWNLOADING = false;

var send = function send(name, value) {
	return ipcRenderer.send('updater', name, value);
};
var log = function log() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return isDev && console.log.apply(console, args);
};

var events = {
	'checking-for-update': function checkingForUpdate() {
		return log('Checking for update...');
	},
	'update-available': updateAvailable,
	'update-not-available': updateNotAvailable,
	'download-progress': function downloadProgress() {
		return log('Downloading update...');
	},
	'update-downloaded': updateDownloaded,
	'update-error': function updateError(err) {
		if (SILENT || isDev) log('Update error', err);else dialog.error('There was an error with the update.\nPlease try again later.');
	}
};

function showChangelog() {
	helper.openChangelog(availableVersion);
}

function checkForUpdates(silent) {
	if (IS_DOWNLOADING) {
		dialog.info({
			title: 'Update',
			message: 'An update was found and is downloading.',
			detail: 'Thanks for your patience!'
		});
	}
	SILENT = silent === true;
	send('checkForUpdates');
}

function updateNotAvailable() {
	log('Update not available');
	if (!SILENT) dialog.info({
		title: 'Update',
		message: 'You have the latest version of\n' + appName + ' ' + appVersion,
		detail: 'There are no new updates at this time.'
	});
}

function updateAvailable(resp) {
	log('Update available');
	availableVersion = resp.version;
	if (SILENT) return download();

	$.trigger(EVENT.updater.nav.show);
	dialog.question({
		title: 'Update',
		message: 'There is a newer version available.',
		detail: 'You have: ' + appVersion + '\nAvailable: ' + availableVersion,
		buttons: ['Cancel', 'Update', 'Changelog']
	}).then(function (res) {
		if (res === 1) return download();
		if (res === 2) return showChangelog();
	});
}

function download() {
	IS_DOWNLOADING = true;
	send('downloadUpdate');
}

function updateDownloaded() {
	log('Update downloaded');
	if (SILENT) return $.trigger(EVENT.updater.nav.show);

	updateDownloadedInstall();
}

function updateDownloadedInstall() {
	dialog.question({
		title: 'Update',
		message: 'Update downloaded.\nDo you want to install it now or next time you start the app?',
		buttons: ['Install later', 'Quit and install', 'Changelog']
	}).then(function (res) {
		if (res === 1) return send('quitAndInstall');
		if (res === 2) return showChangelog();
	});
}

function init() {
	ipcRenderer.on('updater', function (ev, name, params) {
		if (typeof events[name] === 'function') events[name](params);
	});
	$.on(EVENT.updater.check, checkForUpdates);
	$.on(EVENT.updater.nav.clicked, updateDownloadedInstall);
	if (!isDev) setTimeout(function () {
		return checkForUpdates(true);
	}, 5000);
}

module.exports = {
	init: init
};