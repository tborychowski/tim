const $ = require('../util');
const appState = require('../appstate');
const config = require('../../config.json');

const baseUrl = config.url.replace(/\/$/, '');
const wpjs = `file://${__dirname}\\..\\..\\app\\frame\\webview.js`;

let webview, pageLoadCallback, isReady = false;


const webviewHandlers = {
	// isLogged: isLoggedIn => {},
	domChanged: (url, issue) => {
		appState.url = url;
		appState.issue = issue;
		$.trigger('issue/changed', issue);
	},
	docReady: res => {
		if (pageLoadCallback) {
			pageLoadCallback(res);
			pageLoadCallback = null;
		}
	}
};


function onBeforeUrlChange (url) {
	webview.addClass('loading');
	if (typeof url !== 'string' || !url.length) return;

	if (url === 'prev') setTimeout(() => { webview[0].goBack(); }, 400);
	else if (url === 'next') setTimeout(() => { webview[0].goForward(); }, 400);
	else webview[0].loadURL(`${baseUrl}/${url}`);
}


function onUrlChanged () {
	appState.url = webview[0].getURL();
	setTimeout(() => { webview.removeClass('loading'); }, 100);
}



function init () {
	if (isReady) return;

	const frame = $('#frame');
	const html = `<webview id="webview" src="${baseUrl}/notifications" preload="${wpjs}" class="loading" partition="persist:github"></webview>`;

	frame.html(html);
	webview = frame.find('#webview');

	webview.on('will-navigate', onBeforeUrlChange);
	webview.on('dom-ready', onUrlChanged);
	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	// DEBUG
	// webview.on('console-message', e => { console.log('WV:', e.message); });
	// webview.on('dom-ready', () => { webview[0].openDevTools(); });


	$.on('frame/goto', onBeforeUrlChange);

	isReady = true;
}


module.exports = {
	init
};
