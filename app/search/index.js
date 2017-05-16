'use strict';

var $ = require('../util');

var _require = require('../services'),
    EVENT = _require.EVENT;

var webview = void 0,
    el = void 0,
    inp = void 0,
    info = void 0,
    isReady = false,
    isVisible = false;
var TOP_H = '37px';

function show() {
	if (isVisible) return;
	isVisible = true;
	el.show().animate({ top: 0 }, { top: TOP_H });
	inp[0].focus();
}

function hide() {
	if (!isReady || !isVisible) return;
	isVisible = false;
	inp[0].value = '';
	highlightFindings();
	updateInfo();
	el.animate({ top: TOP_H }, { top: 0 });
	$.trigger(EVENT.address.focus);
}

function updateInfo(no, total) {
	var txt = no + ' of ' + total;
	if (!total) {
		if (!inp[0].value) txt = '';else txt = 'no results';
	}
	info.html(txt);
}

function highlightFindings() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { findNext: false, forward: true };

	var text = inp[0].value;
	if (!text) webview[0].stopFindInPage('clearSelection');else webview[0].findInPage(text, options);
}

function findNext() {
	highlightFindings({ findNext: true });
}

function findPrev() {
	highlightFindings({ findNext: true, forward: false });
}

function onKeyUp(ev) {
	if (ev.key === 'Escape') hide();else if (ev.key === 'Enter') {
		if (ev.shiftKey) findPrev();else findNext();
	}
}

function foundInPage(ev) {
	if (!ev.result || !ev.result.finalUpdate) return;
	var no = ev.result.activeMatchOrdinal || 0;
	var total = ev.result.matches || 0;
	updateInfo(no, total);
}

function onClick(e) {
	var target = $(e.target);
	var go = target.data('go');
	if (target.is('.search-btn')) {
		e.preventDefault();
		if (go === 'close') hide();else if (go === 'prev') findPrev();else if (go === 'next') findNext();
	}
}

function init() {
	if (isReady) return;
	el = $('.search-bar');
	inp = el.find('.search-input');
	info = el.find('.search-info');
	webview = $('#frame #webview');

	el.on('click', onClick);
	inp.on('input', function () {
		return highlightFindings();
	});
	inp.on('keyup', onKeyUp);
	webview.on('found-in-page', foundInPage);

	$.on(EVENT.search.start, show);
	$.on(EVENT.search.stop, hide);

	isReady = true;
}

module.exports = {
	init: init
};