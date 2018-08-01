const $ = require('../util');
const { config, EVENT, github, helper, WebView } = require('../services');

let webview, isReady = false, el, content, isLoggedIn, loginTimer, notificationsTimer;
const refreshDelay = 5 * 60 * 1000; // every 5 minutes

const PARTICIPATING = true;


const getNotificationsUrl = () => `${config.get('baseUrl')}notifications${PARTICIPATING ? '/participating' : ''}`;

const webviewHandlers = {
	gotoRepo: repo => $.trigger(EVENT.url.change.to, $.trim(repo, '/') + '/issues'),
	goto: url => $.trigger(EVENT.url.change.to, url),
	showLinkMenu: url => $.trigger(EVENT.contextmenu.show, { url, type: 'link' }),
	actionClicked: () => checkNotifications(1000),
	isLogged: (isit) => { isLoggedIn = isit; }
};


function loadingStart () {
	webview.addClass('loading');
}

function loadingStop () {
	if (isLoggedIn) webview.removeClass('loading');
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
	$.trigger(EVENT.subsection.backbtn.toggle, curr !== getNotificationsUrl());
}

function backToRoot () {
	webview[0].loadURL(getNotificationsUrl());

}

function refresh (fullReload) {
	checkNotifications();
	if (!webview || !webview.length || !webview[0].send) return;
	if (fullReload) webview[0].reload();
	else webview[0].send('reload');
}



async function checkNotifications (delay = 0) {
	if (notificationsTimer) clearTimeout(notificationsTimer);
	if (delay) return notificationsTimer = setTimeout(checkNotifications, delay);

	const count = await github.getNotificationsCount(PARTICIPATING) || 0;
	helper.setBadge(count);
	$.trigger(EVENT.section.badge, 'notifications', count);
	notificationsTimer = setTimeout(checkNotifications, refreshDelay);
}


function initWebview () {
	webview = WebView({
		url: getNotificationsUrl(),
		renderTo: content,
		js: `${__dirname}/webview.js`,
		css: `${__dirname}/webview.css`,
		cls: 'notifications-webview loading',
		msgHandlers: webviewHandlers
	});

	webview.on('did-frame-finish-load', checkIfRootUrl);
	webview.on('did-start-loading', loadingStart);
	webview.on('did-stop-loading', loadingStop);
}


function sectionRefresh (id) {
	if (id === 'notifications') refresh();
}

function sectionChanged (id) {
	if (id === 'notifications' && !webview) initWebview();
}


function init () {
	if (isReady) return;

	el = $('.subnav-notifications');
	content = el.find('.subnav-section-list');


	$.on(EVENT.subsection.backbtn.click, backToRoot);

	$.on(EVENT.section.refresh, sectionRefresh);
	$.on(EVENT.section.change, sectionChanged);
	$.on(EVENT.notifications.devtools, () => webview.toggleDevTools());
	$.on(EVENT.notifications.reload, () => refresh(true));
	$.on(EVENT.settings.changed, () => refresh(true));
	$.on(EVENT.url.change.end, onFrameUrlChanged);

	checkNotifications();

	isReady = true;
}


module.exports = {
	init
};
