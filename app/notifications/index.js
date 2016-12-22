const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const wpjs = `file://${__dirname}\\..\\..\\app\\notifications\\webview.js`;

let webview, isReady = false, el, content;

const webviewHandlers = {
	goto: url => $.trigger('change-url', url)
};


function onMenuClick (target) {
	const wv = webview[0];
	if (target === 'toggle-notifications-devtools') {
		if (wv.isDevToolsOpened()) wv.closeDevTools();
		else wv.openDevTools();
	}
}


function onUrlChanged () {
	setTimeout(() => { webview.removeClass('loading'); }, 100);
	// webview[0].openDevTools();
}


function toggle (show) {
	el.toggleClass('visible', !!show);
}

function refresh (fullReload) {
	if (fullReload) webview.reload();
	else webview[0].send('reload');
}


function onClick (e) {
	let target = $(e.target);
	if (target.is('.js-refresh')) {
		e.preventDefault();
		refresh();
	}
}


function init () {
	if (isReady) return;

	el = $('#notifications-sidebar');
	content = el.find('.repo-list');
	const html = `<webview id="webview2" preload="${wpjs}" class="loading"
		src="${config.get('baseUrl')}notifications/participating" partition="persist:github"></webview>`;

	content.html(html);
	webview = el.find('#webview2');

	webview.on('dom-ready', onUrlChanged);
	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	el.on('click', onClick);
	$.on('toggle-notifications', toggle);
	$.on('refresh-notifications', refresh);
	$.on('menu', onMenuClick);


	toggle(config.get('state.notifications'));

	isReady = true;
}


module.exports = {
	init
};
