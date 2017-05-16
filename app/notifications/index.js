'use strict';

var $ = require('../util');

var _require = require('../services'),
    config = _require.config,
    EVENT = _require.EVENT,
    github = _require.github,
    helper = _require.helper,
    isDev = _require.isDev;

var wpjs = 'file://' + __dirname + '/webview.js';
var wpcss = __dirname + '/webview.css';

var webview = void 0,
    isReady = false,
    el = void 0,
    content = void 0,
    isLoggedIn = void 0,
    loginTimer = void 0,
    notificationsTimer = void 0,
    backBtn = void 0;
var refreshDelay = 5 * 60 * 1000; // every 5 minutes

var PARTICIPATING = !isDev;

var getNotificationsUrl = function getNotificationsUrl() {
	return config.get('baseUrl') + 'notifications' + (PARTICIPATING ? '/participating' : '');
};

var webviewHandlers = {
	keyup: function keyup(e) {
		return $.trigger(EVENT.document.keyup, e);
	},
	gotoRepo: function gotoRepo(repo) {
		return $.trigger(EVENT.url.change.to, $.trim(repo, '/') + '/issues');
	},
	goto: function goto(url) {
		return $.trigger(EVENT.url.change.to, url);
	},
	showLinkMenu: function showLinkMenu(url) {
		return $.trigger(EVENT.contextmenu.show, { url: url, type: 'link' });
	},
	actionClicked: function actionClicked() {
		return checkNotifications(1000);
	},
	docReady: function docReady() {
		return $.injectCSS(webview, wpcss);
	},
	// cssReady: () => setTimeout(() => { webview.removeClass('loading'); }, 100),
	isLogged: function isLogged(isit) {
		isLoggedIn = isit;
	}
};

function toggleDevTools() {
	var wv = webview[0];
	if (wv.isDevToolsOpened()) wv.closeDevTools();else wv.openDevTools();
}

function loadingStart() {
	webview.addClass('loading');
}

function loadingStop() {
	if (isLoggedIn) webview.removeClass('loading');
}

/**
 * If not logged in to GH:
 * when the url changes in the main frame - try refreshing notifications
 * if user logs-in in the main - the session will pick-up here as well
 */
function onFrameUrlChanged() {
	if (loginTimer) clearTimeout(loginTimer);
	if (!isLoggedIn) loginTimer = setTimeout(function () {
		refresh(true);
	}, 500);
}

function checkIfRootUrl() {
	var curr = webview[0].getURL();
	backBtn.toggle(curr !== getNotificationsUrl());
}

function backToRoot(e) {
	e.preventDefault();
	webview[0].loadURL(getNotificationsUrl());
}

function refresh(fullReload) {
	if (fullReload) webview[0].reload();else webview[0].send('reload');
}

function onClick(e) {
	var target = $(e.target);
	if (target.is('.js-refresh')) {
		e.preventDefault();
		refresh();
	}
}

function checkNotifications() {
	var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

	if (notificationsTimer) clearTimeout(notificationsTimer);
	if (delay) return notificationsTimer = setTimeout(checkNotifications, delay);

	github.getNotificationsCount(PARTICIPATING).then(function () {
		var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

		helper.setBadge(count);
		$.trigger(EVENT.section.badge, 'notifications', count);
		notificationsTimer = setTimeout(checkNotifications, refreshDelay);
	});
}

function init() {
	if (isReady) return;

	el = $('.subnav-notifications');
	content = el.find('.subnav-section-list');
	backBtn = $('.subnav-notifications .js-prev');

	var html = '<webview id="webview2" preload="' + wpjs + '" class="notifications-webview loading"\n\t\tsrc="' + getNotificationsUrl() + '" partition="persist:github"></webview>';

	content.html(html);
	webview = el.find('#webview2');

	webview.on('did-frame-finish-load', checkIfRootUrl);
	webview.on('did-start-loading', loadingStart);
	webview.on('did-stop-loading', loadingStop);

	webview.on('ipc-message', function (ev) {
		var fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	el.on('click', onClick);
	backBtn.on('click', backToRoot);

	$.on(EVENT.notifications.refresh, refresh);
	$.on(EVENT.notifications.reload, function () {
		return refresh(true);
	});
	$.on(EVENT.notifications.devtools, toggleDevTools);
	$.on(EVENT.settings.changed, function () {
		return refresh(true);
	});
	$.on(EVENT.url.change.end, onFrameUrlChanged);

	checkNotifications();

	isReady = true;
}

module.exports = {
	init: init
};