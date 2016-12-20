const {session} = require('electron').remote;
const $ = require('../util');
const Config = require('electron-config');
const config = new Config();

const wpjs = `file://${__dirname}\\..\\..\\app\\frame\\webview.js`;
const ses = session.fromPartition('persist:github');


let webview, pageLoadCallback, isReady = false;


const webviewHandlers = {
	domChanged: (url, issue) => {
		config.set('state.url', url);
		config.set('state.issue', issue);
		$.trigger('issue/changed', issue);
	},
	docReady: res => {
		if (pageLoadCallback) {
			pageLoadCallback(res);
			pageLoadCallback = null;
		}
	}
};


function onMenuClick (target) {
	const wv = webview[0];
	if (target === 'toggle-webview-devtools') {
		if (wv.isDevToolsOpened()) wv.closeDevTools();
		else wv.openDevTools();
	}
	else if (target === 'clear-cookies') {
		ses.clearStorageData(() => {
			gotoUrl('notifications');
		});
	}
}

function gotoUrl (url) {
	webview.addClass('loading');
	if (typeof url !== 'string' || !url.length) return;

	if (url === 'prev') setTimeout(() => { webview[0].goBack(); }, 400);
	else if (url === 'next') setTimeout(() => { webview[0].goForward(); }, 400);
	else {
		console.log(url);
		webview[0].loadURL(url);
	}
}


function onUrlChanged () {
	config.set('state.url', webview[0].getURL());
	setTimeout(() => { webview.removeClass('loading'); }, 100);
}



function init () {
	if (isReady) return;

	const frame = $('#frame');
	const html = `<webview id="webview" class="loading" preload="${wpjs}"
		src="${config.get('baseUrl')}notifications" partition="persist:github"></webview>`;

	frame.html(html);
	webview = frame.find('#webview');


	webview.on('will-navigate', gotoUrl);
	webview.on('dom-ready', onUrlChanged);
	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	// DEBUG
	// webview.on('console-message', e => { console.log('WV:', e.message); });
	// webview.on('dom-ready', () => { webview[0].openDevTools(); });


	$.on('frame/goto', gotoUrl);
	$.on('menu', onMenuClick);

	isReady = true;
}


module.exports = {
	init
};
