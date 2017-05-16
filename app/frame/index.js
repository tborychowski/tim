'use strict';

var _require$remote = require('electron').remote,
    session = _require$remote.session,
    getGlobal = _require$remote.getGlobal;

var ses = session.fromPartition('persist:github');
var args = getGlobal('appArgs');

var _require = require('../services'),
    config = _require.config,
    EVENT = _require.EVENT,
    helper = _require.helper,
    isDev = _require.isDev;

var $ = require('../util');
var realnames = require('../realnames');
var swiping = require('./swiping');

var wpjs = 'file://' + __dirname + '/webview.js';
var wpcss = __dirname + '/webview.css';

var frame = void 0,
    webview = void 0,
    skeleton = void 0,
    isReady = false,
    pageZoom = 0,
    isLoggedIn = false,
    lastURL = '',
    urlLoading = '';

var webviewHandlers = {
	documentClicked: function documentClicked() {
		return $.trigger(EVENT.document.clicked);
	},
	externalLinkClicked: function externalLinkClicked(url) {
		return helper.openInBrowser(url);
	},
	keyup: function keyup(e) {
		return $.trigger(EVENT.document.keyup, e);
	},

	showPreview: function showPreview(url) {
		return $.trigger(EVENT.preview, url);
	},
	showLinkMenu: function showLinkMenu(url) {
		return $.trigger(EVENT.contextmenu.show, { url: url, type: 'link' });
	},
	showImgMenu: function showImgMenu(url) {
		return $.trigger(EVENT.contextmenu.show, { url: url, type: 'img' });
	},
	showSelectionMenu: function showSelectionMenu(txt) {
		return $.trigger(EVENT.contextmenu.show, { txt: txt, type: 'selection' });
	},

	isLogged: function isLogged(itIs) {
		if (itIs && !isLoggedIn) {
			isLoggedIn = true;
			$.trigger(EVENT.notifications.reload);
		}
		if (!config.get('baseUrl')) $.trigger(EVENT.settings.show);
	},
	docReady: function docReady() {
		return $.injectCSS(webview, wpcss);
	},
	domChanged: onRendered
};

var gotoActions = {
	prev: function prev() {
		if (webview[0].canGoBack()) webview[0].goBack();
	},
	next: function next() {
		if (webview[0].canGoForward()) webview[0].goForward();
	},
	refresh: function refresh() {
		return webview[0].reload();
	},
	stop: function stop() {
		return webview[0].stop();
	}
};

function gotoUrl(where) {
	$.trigger(EVENT.search.stop);
	var isEvent = where instanceof Event;
	urlLoading = isEvent ? where.url : where;
	if (typeof urlLoading !== 'string' || !urlLoading || !webview.length) return;
	if (urlLoading in gotoActions) gotoActions[urlLoading]();else if (!isEvent && webview[0].loadURL) webview[0].loadURL(urlLoading);
}

function initialURL(initial) {
	if (initial && args) {
		var url = $.parseUrl(args.pop());
		if (url) return url;
	}
	if (initial && config.get('state.url')) return config.get('state.url');
	return config.get('baseUrl') + 'login';
}

function toggleDevTools() {
	if (webview[0].isDevToolsOpened()) webview[0].closeDevTools();else webview[0].openDevTools();
}

function purge() {
	config.clear();
	webview[0].clearHistory();
	ses.clearStorageData(webviewHandlers.isLogged);
	setTimeout(function () {
		gotoUrl(initialURL(true));
		helper.setBadge(0);
		$.trigger(EVENT.section.badge, 'notifications', 0);
		$.trigger(EVENT.section.badge, 'myissues', 0);
		$.trigger(EVENT.section.badge, 'bookmarks', 0);
		$.trigger(EVENT.notifications.reload);
	});
}

function onNavigationStart() {
	$.trigger(EVENT.search.stop);
	config.set('state.url', webview[0].getURL());
	$.trigger(EVENT.url.change.done, webview[0]);
}

function onNavigationError(er) {
	if (er.errorDescription === 'ERR_NAME_NOT_RESOLVED') $.trigger(EVENT.connection.error.show);else if (isDev) console.log('NavigationError:', er);
}

function onRendered(url, issue) {
	if (issue.url.indexOf('#') > -1) issue.url = issue.url.substr(0, issue.url.indexOf('#'));
	issue.url = $.rtrim(issue.url, '\/files');
	issue.url = $.rtrim(issue.url, '\/commits');

	config.set('state.url', url);
	config.set('state.issue', issue);
	realnames.replace(webview[0]);
	if (lastURL !== url) $.trigger(EVENT.url.change.done, webview[0], issue);
	lastURL = url;
}

function loadingStart() {
	if (!urlLoading) urlLoading = webview.attr('src');
	var pageType = helper.getPageTypeFromUrl(urlLoading);

	skeleton.attr('class', 'skeleton ' + pageType);
	frame.addClass('loading');
	webview[0].focus();
	$.trigger(EVENT.url.change.start);
}

function loadingStop() {
	frame.removeClass('loading');
	$.trigger(EVENT.url.change.end);
	webview[0].focus();
	urlLoading = '';
}

function setZoom(n) {
	pageZoom = n === 0 ? 0 : pageZoom + n;
	webview[0].send('zoom', pageZoom);
}

function init() {
	if (isReady) return;

	frame = $('#frame');
	var html = '<webview id="webview" preload="' + wpjs + '" src="' + initialURL(true) + '" partition="persist:github"></webview>\n\t\t<div class="skeleton"><div class="skeleton-header"></div><div class="skeleton-sidebar"></div><div class="skeleton-main"></div><div class="skeleton-shine"></div></div>';

	frame.html(html);
	webview = frame.find('#webview');
	skeleton = frame.find('.skeleton');

	webview.on('focus', function () {
		return $.trigger(EVENT.frame.focused);
	});
	webview.on('will-navigate', gotoUrl);
	webview.on('did-navigate-in-page', onNavigationStart);
	webview.on('did-fail-load', onNavigationError);
	webview.on('ipc-message', function (ev) {
		var fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	webview.on('did-start-loading', loadingStart);
	webview.on('did-stop-loading', loadingStop);

	if (isDev) {
		webview.on('console-message', function (e) {
			console.log('WV:', e.message);
		});
	}

	$.on(EVENT.frame.goto, gotoUrl);
	$.on(EVENT.frame.devtools, toggleDevTools);
	$.on(EVENT.frame.purge, purge);
	$.on(EVENT.settings.changed, function () {
		return gotoUrl(initialURL());
	});
	$.on(EVENT.frame.lookup, function () {
		return webview[0].showDefinitionForSelection();
	});

	$.on(EVENT.frame.zoomout, function () {
		return setZoom(-1);
	});
	$.on(EVENT.frame.zoomin, function () {
		return setZoom(1);
	});
	$.on(EVENT.frame.resetzoom, function () {
		return setZoom(0);
	});

	swiping(frame, webview);

	isReady = true;
}

module.exports = {
	init: init
};