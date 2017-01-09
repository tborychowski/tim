const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const readFile = require('fs').readFileSync;
const wpjs = `file://${__dirname}/webview.js`;
const wpcss = `${__dirname}/webview.css`;

let webview, isReady = false, el, content, notifToggle, isLoggedIn, loginTimer;

const webviewHandlers = {
	goto: url => $.trigger('change-url', url),
	docReady: onDocReady,
	cssReady: onCssReady,
	isLogged: onIsLogged
};


function injectCss () {
	let css;
	try { css = readFile(wpcss, 'utf8'); } catch (e) { css = ''; }
	webview[0].send('injectCss', css);
}


function onMenuClick (target) {
	const wv = webview[0];
	if (target === 'toggle-notifications-devtools') {
		if (wv.isDevToolsOpened()) wv.closeDevTools();
		else wv.openDevTools();
	}
}


function onIsLogged (isit) {
	isLoggedIn = isit;
	notifToggle.toggle(isit);
}

function onNavigationEnd () {
	// webview[0].openDevTools();
}

function onDocReady () {
	injectCss();
}

function onCssReady () {
	setTimeout(() => { webview.removeClass('loading'); }, 100);
}


/**
 * If not logged in to GH:
 * when the url changes in the main frame - try refreshing notifications
 * if user logs-in in the main - the session will pick-up here as well
 */
function onFrameUrlChanged () {
	if (loginTimer) clearTimeout(loginTimer);
	if (!isLoggedIn) loginTimer = setTimeout(() => { refresh(true); }, 500);
}


function toggle (show) {
	config.set('state.notifications', !!show);
	notifToggle.toggleClass('is-visible', !!show);
	el.toggleClass('visible', !!show);
}

function refresh (fullReload) {
	if (fullReload) webview[0].reload();
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
	notifToggle = $('.notification-toggle');


	const html = `<webview id="webview2" preload="${wpjs}" class="loading"
		src="${config.get('baseUrl')}notifications/participating" partition="persist:github"></webview>`;

	content.html(html);
	webview = el.find('#webview2');

	webview.on('dom-ready', onNavigationEnd);
	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	el.on('click', onClick);
	$.on('toggle-notifications', toggle);
	$.on('settings-changed', () => refresh(true));
	$.on('menu', onMenuClick);
	$.on('url-change-end', onFrameUrlChanged);



	toggle(config.get('state.notifications'));


	isReady = true;
}


module.exports = {
	init
};
