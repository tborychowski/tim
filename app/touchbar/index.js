const {TouchBar, getCurrentWindow} = require('electron').remote;
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar;

const $ = require('../util');
const EVENT = require('../db/events');

function initBar () {
	const btnBack = new TouchBarButton({
		label: '←',
		click: () => $.trigger(EVENT.frame.goto, 'prev')
	});
	const btnForward = new TouchBarButton({
		label: '→',
		click: () => $.trigger(EVENT.frame.goto, 'next')
	});
	const btnRefresh = new TouchBarButton({
		label: '↻',
		click: () => $.trigger(EVENT.frame.goto, 'refresh')
	});

	const btnBookmark = new TouchBarButton({
		label: '☆',
		click: () => {}
	});

	const btnAddressbar = new TouchBarButton({
		label: 'Search or type url                                  ',	// these are nbsp chars
		click: () => $.trigger(EVENT.address.focus)
	});

	const btnIssueNo = new TouchBarButton({
		label: 'Issue #',
		click: () => $.trigger(EVENT.address.issueFocus)
	});

	const btnRefreshNotifications = new TouchBarButton({
		label: '↻',
		backgroundColor: '#2C384D',
		click: () => $.trigger(EVENT.notifications.refresh)
	});

	return new TouchBar([
		btnBack,
		btnForward,
		btnRefresh,
		btnAddressbar,
		btnIssueNo,
		btnBookmark,

		// new TouchBarSpacer({ size: 'small' }),
		btnRefreshNotifications,
	]);
}



function init () {
	const touchBar = initBar();
	getCurrentWindow().setTouchBar(touchBar);
}



module.exports = {
	init
};
