const $ = require('../util');
const { config, EVENT, github, helper } = require('../services');
const isDev = require('electron-is-dev');

const wpjs = `file://${__dirname}/webview.js`;
const wpcss = `${__dirname}/webview.css`;

let webview, isReady = false, el, content, isLoggedIn, loginTimer, notificationsTimer, backBtn;
const refreshDelay = 5 * 60 * 1000; // every 5 minutes

const PARTICIPATING = !isDev;


const getNotificationsUrl = () => `${config.get('baseUrl')}notifications${PARTICIPATING ? '/participating' : ''}`;

const webviewHandlers = {
	gotoRepo: repo => $.trigger(EVENT.url.change.to, $.trim(repo, '/') + '/issues'),
	goto: url => $.trigger(EVENT.url.change.to, url),
	showLinkMenu: url => $.trigger(EVENT.contextmenu.show, { url, type: 'link' }),
	actionClicked: () => checkNotifications(1000),
	docReady: () => $.injectCSS(webview, wpcss),
	cssReady: () => setTimeout(() => { webview.removeClass('loading'); }, 100),
	isLogged: (isit) => { isLoggedIn = isit; }
};


function toggleDevTools () {
	const wv = webview[0];
	if (wv.isDevToolsOpened()) wv.closeDevTools();
	else wv.openDevTools();
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


function checkIfRootUrl () {
	const curr = webview[0].getURL();
	backBtn.toggle(curr !== getNotificationsUrl());
}

function backToRoot (e) {
	e.preventDefault();
	webview[0].loadURL(getNotificationsUrl());

}

function toggle (show) {
	config.set('state.notifications', !!show);
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



function checkNotifications (delay = 0) {
	if (notificationsTimer) clearTimeout(notificationsTimer);
	if (delay) return notificationsTimer = setTimeout(checkNotifications, delay);

	github.getNotificationsCount(PARTICIPATING)
		.then(count => {
			helper.setBadge(count);
			$.trigger(EVENT.notifications.count, count);
			notificationsTimer = setTimeout(checkNotifications, refreshDelay);
		});
}



function init () {
	if (isReady) return;

	el = $('.subnav-notifications');
	content = el.find('.subnav-section-list');
	backBtn = $('.subnav-notifications .js-prev');


	const html = `<webview id="webview2" preload="${wpjs}" class="loading"
		src="${getNotificationsUrl()}" partition="persist:github"></webview>`;

	content.html(html);
	webview = el.find('#webview2');

	webview.on('did-frame-finish-load', checkIfRootUrl);

	webview.on('ipc-message', function (ev) {
		const fn = webviewHandlers[ev.channel];
		if (typeof fn === 'function') fn.apply(fn, ev.args);
	});

	el.on('click', onClick);
	backBtn.on('click', backToRoot);

	$.on(EVENT.notifications.refresh, refresh);
	$.on(EVENT.notifications.toggle, toggle);
	$.on(EVENT.notifications.devtools, toggleDevTools);
	$.on(EVENT.settings.changed, () => refresh(true));
	$.on(EVENT.url.change.end, onFrameUrlChanged);

	toggle(config.get('state.notifications'));

	checkNotifications();

	isReady = true;
}


module.exports = {
	init
};
