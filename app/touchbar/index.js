const { TouchBar, getCurrentWindow } = require('electron').remote;
const { TouchBarButton, TouchBarSpacer } = TouchBar;
const { EVENT } = require('../services');
const $ = require('../util');
const imgPath = require('path').resolve(__dirname, '..', '..', 'assets');
let btnBookmark;

function initBar () {
	const btnRefreshSidebar = new TouchBarButton({
		icon: imgPath + '/tb-refresh.png',
		backgroundColor: '#2C384D',
		click: () => $.trigger(EVENT.section.refresh)
	});

	const btnRefresh = new TouchBarButton({
		icon: imgPath + '/tb-refresh.png',
		click: () => $.trigger(EVENT.frame.goto, 'refresh')
	});

	btnBookmark = new TouchBarButton({
		icon: imgPath + '/tb-bookmark-outline.png',
		click: () => $.trigger(EVENT.bookmark.toggle)
	});

	const btnAddressbar = new TouchBarButton({
		label: 'Search or type url                                   ',	// these are nbsp chars
		// icon: imgPath + '/tb-logo.png',
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
		empty: imgPath + '/tb-bookmark-outline.png',
		full: imgPath + '/tb-bookmark.png',
	};
	btnBookmark.backgroundColor = exists ? '#555' : '#444';
	btnBookmark.icon = exists ? icons.full : icons.empty;
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
