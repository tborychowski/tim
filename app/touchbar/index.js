'use strict';

var _require$remote = require('electron').remote,
    TouchBar = _require$remote.TouchBar,
    getCurrentWindow = _require$remote.getCurrentWindow;

var TouchBarButton = TouchBar.TouchBarButton,
    TouchBarSpacer = TouchBar.TouchBarSpacer;

var _require = require('../services'),
    EVENT = _require.EVENT;

var $ = require('../util');
var imgPath = require('path').resolve(__dirname, '..', '..', 'assets');
var btnBookmark = void 0;

function initBar() {
	var btnRefreshSidebar = new TouchBarButton({
		icon: imgPath + '/tb-refresh.png',
		backgroundColor: '#2C384D',
		click: function click() {
			return $.trigger(EVENT.section.refresh);
		}
	});

	var btnRefresh = new TouchBarButton({
		icon: imgPath + '/tb-refresh.png',
		click: function click() {
			return $.trigger(EVENT.frame.goto, 'refresh');
		}
	});

	btnBookmark = new TouchBarButton({
		icon: imgPath + '/tb-bookmark-outline.png',
		click: function click() {
			return $.trigger(EVENT.bookmark.toggle);
		}
	});

	var btnAddressbar = new TouchBarButton({
		label: 'Search or type url                                   ', // these are nbsp chars
		icon: imgPath + '/tb-logo.png',
		iconPosition: 'left',
		click: function click() {
			return $.trigger(EVENT.address.focus);
		}
	});

	var btnIssueNo = new TouchBarButton({
		label: 'Issue #                   ',
		click: function click() {
			return $.trigger(EVENT.address.issueFocus);
		}
	});

	return new TouchBar([btnRefreshSidebar, new TouchBarSpacer({ size: 'medium' }), btnAddressbar, btnIssueNo, btnRefresh, btnBookmark]);
}

function bookmarkExists(exists) {
	var icons = {
		empty: imgPath + '/tb-bookmark-outline.png',
		full: imgPath + '/tb-bookmark.png'
	};
	btnBookmark.backgroundColor = exists ? '#555' : '#444';
	btnBookmark.icon = exists ? icons.full : icons.empty;
}

function init() {
	var touchBar = initBar();
	getCurrentWindow().setTouchBar(touchBar);

	$.on(EVENT.bookmark.exists, bookmarkExists);
	$.on(EVENT.bookmark.add, function () {
		return bookmarkExists(true);
	});
	$.on(EVENT.bookmark.remove, function () {
		return bookmarkExists(false);
	});
}

module.exports = {
	init: init
};