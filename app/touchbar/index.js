const {TouchBar, getCurrentWindow} = require('electron').remote;
const {TouchBarButton, TouchBarSpacer} = TouchBar;
const { config, EVENT } = require('../services');
const $ = require('../util');

let btnBookmark;

function initBar () {
	// const btnBack = new TouchBarButton({
	// 	label: '←',
	// 	click: () => $.trigger(EVENT.frame.goto, 'prev')
	// });
	// const btnForward = new TouchBarButton({
	// 	label: '→',
	// 	click: () => $.trigger(EVENT.frame.goto, 'next')
	// });
	const btnRefresh = new TouchBarButton({
		label: '↻',
		click: () => $.trigger(EVENT.frame.goto, 'refresh')
	});

	btnBookmark = new TouchBarButton({
		label: '☆',
		click: () => $.trigger(EVENT.bookmark.toggle)
	});

	const btnAddressbar = new TouchBarButton({
		label: 'Search or type url                                   ',	// these are nbsp chars
		click: () => $.trigger(EVENT.address.focus)
	});

	const btnIssueNo = new TouchBarButton({
		label: 'Issue #                   ',
		click: () => $.trigger(EVENT.address.issueFocus)
	});

	const btnRefreshSidebar = new TouchBarButton({
		label: '↻',
		backgroundColor: '#2C384D',
		click: refreshSidebar
	});

	return new TouchBar([
		btnRefreshSidebar,
		new TouchBarSpacer({ size: 'medium' }),
		// btnBack,
		// btnForward,
		btnAddressbar,
		btnIssueNo,
		btnRefresh,
		btnBookmark,

	]);
}


function bookmarkExists (exists) {
	btnBookmark.label = exists ? '★' : '☆';
	btnBookmark.backgroundColor = exists ? '#E7837C' : '#444';
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
