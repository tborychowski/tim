const electron = require('electron');
const shell = electron.shell;
const session = electron.remote.session;
const readFile = require('fs').readFileSync;
const $ = require('../util');
const realnames = require('../realnames');
const Config = require('electron-config');
const config = new Config();

const wpjs = `file://${__dirname}/webview.js`;
const wpcss = `${__dirname}/webview.css`;

const ses = session.fromPartition('persist:github');


let webview, isReady = false;

const webviewHandlers = {
	isLogged: (itIs) => { if (!itIs) $.on('toggle-notifications', false); },
	linkClicked: loadingStart,
	externalLinkClicked: (url) => { shell.openExternal(url); },
	docReady: injectCss,
	domChanged: onRendered
};



function injectCss () {
	let css;
	try { css = readFile(wpcss, 'utf8'); } catch (e) { css = ''; }
	webview[0].send('injectCss', css);
}


function onMenuClick (target) {
	const wv = webview[0];
	if (target === 'toggle-main-frame-devtools') {
		if (wv.isDevToolsOpened()) wv.closeDevTools();
		else wv.openDevTools();
	}
	else if (target === 'clear-cookies') {
		config.clear();
		ses.clearStorageData(gotoUrl);
	}
}

function gotoUrl (url) {
	loadingStart();
	if (typeof url !== 'string' || !url.length) return;

	if (url === 'prev') setTimeout(() => { webview[0].goBack(); }, 400);
	else if (url === 'next') setTimeout(() => { webview[0].goForward(); }, 400);
	else if (url === 'refresh') setTimeout(() => { webview[0].reload(); }, 400);
	else if (url === 'stop') { webview[0].stop(); loadingStop(); }
	else webview[0].loadURL(url);
}


function onNavigationStart () {
	config.set('state.url', webview[0].getURL());
	$.trigger('url-changed', webview[0]);
}

function onNavigationEnd () {}

function onRendered (url, issue) {
	config.set('state.url', url);
	config.set('state.issue', issue);
	$.trigger('url-changed', webview[0], issue);
	realnames.replace(webview[0]);
	setTimeout(loadingStop, 100);
}

function loadingStart () {
	webview.addClass('loading');
	$.trigger('url-change-start');
}

function loadingStop () {
	webview.removeClass('loading');
	$.trigger('url-change-end');
}


function init () {
	if (isReady) return;

	const frame = $('#frame');
	const html = `<webview id="webview" class="loading" preload="${wpjs}"
		src="${config.get('baseUrl')}login" partition="persist:github"></webview>`;

	frame.html(html);
	webview = frame.find('#webview');


	webview.on('will-navigate', gotoUrl);
	webview.on('did-navigate-in-page', onNavigationStart);
	webview.on('dom-ready', onNavigationEnd);
	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});


	// DEBUG
	// webview.on('console-message', e => { console.log('WV:', e.message); });


	$.on('frame/goto', gotoUrl);
	$.on('menu', onMenuClick);

	isReady = true;
}


module.exports = {
	init
};
