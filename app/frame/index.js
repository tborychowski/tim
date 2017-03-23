const { session, getGlobal } = require('electron').remote;
const path = require('path');
const isDev = require('electron-is-dev');

const args = getGlobal('appArgs');
const $ = require('../util');
const { config, EVENT, helper } = require('../services');

const realnames = require('../realnames');
const swiping = require('./swiping');


const wpjs = `file://${__dirname}/webview.js`;
const wpcss = `${__dirname}/webview.css`;

const ses = session.fromPartition('persist:github');

let webview, isReady = false, pageZoom = 0;

const webviewHandlers = {
	documentClicked: () => $.trigger(EVENT.document.clicked),
	externalLinkClicked: url => helper.openInBrowser(url),

	showLinkMenu: url => $.trigger(EVENT.contextmenu.show, { url, type: 'link' }),
	showImgMenu: url => $.trigger(EVENT.contextmenu.show, { url, type: 'img' }),
	showPreview: url => $.trigger(EVENT.preview, url),

	showSelectionMenu: txt => $.trigger(EVENT.contextmenu.show, { txt, type: 'selection' }),
	isLogged: itIs => {
		if (itIs) return;
		$.trigger(EVENT.notifications.toggle, false);
		if (!config.get('baseUrl')) $.trigger(EVENT.settings.show);
	},
	linkClicked,
	docReady: () => $.injectCSS(webview, wpcss),
	domChanged: onRendered,
};


const gotoActions = {
	prev: () => {
		if (webview[0].canGoBack()) {
			webview[0].goBack();
		}
	},
	next: () => {
		if (webview[0].canGoForward()) {
			webview[0].goForward();
		}
	},
	refresh: () => webview[0].reload(),
	stop: () => webview[0].stop()
};


function linkClicked (url, href) {
	if (href[0] === '#') return;	// don't do loading for local links
	if (path.extname(url)) return;	// don't do loading for file downloads
}

function initialURL (initial) {
	if (initial && args) {
		const url = $.parseUrl(args.pop());
		if (url) return url;
	}
	if (initial && config.get('state.url')) return config.get('state.url');
	return `${config.get('baseUrl')}login`;
}

function toggleDevTools () {
	if (webview[0].isDevToolsOpened()) webview[0].closeDevTools();
	else webview[0].openDevTools();
}

function purge () {
	config.clear();
	webview[0].clearHistory();
	ses.clearStorageData(webviewHandlers.isLogged);
}



function gotoUrl (url) {
	$.trigger(EVENT.search.stop);
	if (typeof url !== 'string' || !url.length || !webview.length) return;
	if (url in gotoActions) gotoActions[url]();
	else if (webview[0].loadURL) webview[0].loadURL(url);
}

function onNavigationStart () {
	$.trigger(EVENT.search.stop);
	config.set('state.url', webview[0].getURL());
	$.trigger(EVENT.url.change.done, webview[0]);
}

function onNavigationError (er) {
	if (er.errorDescription === 'ERR_NAME_NOT_RESOLVED') $.trigger(EVENT.connection.error.show);
	else if (isDev) console.log('NavigationError:', er);
}

function onRendered (url, issue) {
	if (issue.url.indexOf('#') > -1) issue.url = issue.url.substr(0, issue.url.indexOf('#'));
	issue.url = $.rtrim(issue.url, '\/files');
	issue.url = $.rtrim(issue.url, '\/commits');

	config.set('state.url', url);
	config.set('state.issue', issue);
	$.trigger(EVENT.url.change.done, webview[0], issue);
	realnames.replace(webview[0]);
}

function loadingStart () {
	webview.addClass('loading');
	webview[0].focus();
	$.trigger(EVENT.url.change.start);
}

function loadingStop () {
	webview.removeClass('loading');
	$.trigger(EVENT.url.change.end);
}


function setZoom (n) {
	pageZoom = (n === 0 ? 0 : pageZoom + n);
	webview[0].send('zoom', pageZoom);
}


function init () {
	if (isReady) return;

	const frame = $('#frame');
	const html = `<webview id="webview" class="loading" preload="${wpjs}"
		src="${initialURL(true)}" partition="persist:github"></webview>`;

	frame.html(html);
	webview = frame.find('#webview');


	webview.on('focus', () => $.trigger(EVENT.frame.focused));
	webview.on('will-navigate', gotoUrl);
	webview.on('did-navigate-in-page', onNavigationStart);
	webview.on('did-fail-load', onNavigationError);
	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});


	webview.on('did-start-loading', loadingStart);
	webview.on('did-stop-loading', loadingStop);


	if (isDev) {
		webview.on('console-message', e => { console.log('WV:', e.message); });
	}

	$.on(EVENT.frame.goto, gotoUrl);
	$.on(EVENT.frame.devtools, toggleDevTools);
	$.on(EVENT.frame.purge, purge);
	$.on(EVENT.settings.changed, () => gotoUrl(initialURL()));
	$.on(EVENT.frame.lookup, () => webview[0].showDefinitionForSelection());

	$.on(EVENT.frame.zoomout, () => setZoom(-1));
	$.on(EVENT.frame.zoomin, () => setZoom(1));
	$.on(EVENT.frame.resetzoom, () => setZoom(0));


	swiping(frame, webview);

	isReady = true;
}


module.exports = {
	init
};
