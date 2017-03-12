const { TouchBar, getCurrentWindow } = require('electron').remote;
const { TouchBarButton, TouchBarSpacer } = TouchBar;
const { config, EVENT } = require('../services');
const $ = require('../util');

let btnBookmark;

function initBar () {
	const btnRefreshSidebar = new TouchBarButton({
		icon: './assets/tb-refresh.png',
		backgroundColor: '#2C384D',
		click: refreshSidebar
	});

	const btnRefresh = new TouchBarButton({
		icon: './assets/tb-refresh.png',
		click: () => $.trigger(EVENT.frame.goto, 'refresh')
	});

	btnBookmark = new TouchBarButton({
		icon: './assets/tb-bookmark-outline.png',
		click: () => $.trigger(EVENT.bookmark.toggle)
	});

	const btnAddressbar = new TouchBarButton({
		label: 'Search or type url                                   ',	// these are nbsp chars
		// image: './assets/tb-logo.png',
		click: () => $.trigger(EVENT.address.focus)
	});

	const btnIssueNo = new TouchBarButton({
		label: 'Issue #                   ',
		click: () => $.trigger(EVENT.address.issueFocus)
	});

	return new TouchBar([
		btnRefreshSidebar,
		new TouchBarSpacer({ size: 'medium' }),
		btnAddressbar,
		btnIssueNo,
		btnRefresh,
		btnBookmark,

	]);
}


function bookmarkExists (exists) {
	const icons = {
		empty: './assets/tb-bookmark-outline.png',
		full: './assets/tb-bookmark.png',
	};
	btnBookmark.backgroundColor = exists ? '#555' : '#444';
	btnBookmark.icon = exists ? icons.full : icons.empty;
}


function refreshSidebar () {
	const currentSection = config.get('state.section');
	const handlers = {
		notifications: EVENT.notifications.refresh,
		bookmarks: EVENT.bookmarks.refresh,
		projects: EVENT.projects.refresh,
		myissues: EVENT.myissues.refresh
	};
	$.trigger(handlers[currentSection]);
}


function init () {
	const touchBar = initBar();
	getCurrentWindow().setTouchBar(touchBar);

	$.on(EVENT.bookmark.exists, bookmarkExists);
	$.on(EVENT.bookmark.add, () => bookmarkExists(true));
	$.on(EVENT.bookmark.remove, () => bookmarkExists(false));
}



module.exports = {
	init
};
