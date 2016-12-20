const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const wpjs = `file://${__dirname}\\..\\..\\app\\notifications\\webview.js`;

let webview, isReady = false, el;

const webviewHandlers = {
	goto: url => $.trigger('change-url', url)
};

function onUrlChanged () {
	setTimeout(() => { webview.removeClass('loading'); }, 100);
	// webview[0].openDevTools();
}


function toggle (show) {
	el.toggleClass('visible', !!show);
}


function init () {
	if (isReady) return;

	el = $('#notifications-sidebar');
	const html = `<webview id="webview2" preload="${wpjs}" class="loading"
		src="${config.get('baseUrl')}notifications" partition="persist:github"></webview>`;

	el.html(html);
	webview = el.find('#webview2');

	webview.on('dom-ready', onUrlChanged);
	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	$.on('toggle-notifications', toggle);

	toggle(config.get('state.notifications'));

	isReady = true;
}


module.exports = {
	init
};
