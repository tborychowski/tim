const $ = require('../util');
const {EVENT} = require('../services');

let webview, el, inp, info, isReady = false, isVisible = false;
const TOP_H = '37px';


function show () {
	if (isVisible) return;
	isVisible = true;
	el.show().animate({ top: 0 }, { top: TOP_H });
	inp[0].focus();
}


function hide () {
	if (!isReady || !isVisible) return;
	isVisible = false;
	inp[0].value = '';
	highlightFindings();
	updateInfo();
	el.animate({ top: TOP_H }, { top: 0 });
	$.trigger(EVENT.address.focus);
}


function updateInfo (no, total) {
	let txt = `${no} of ${total}`;
	if (!total) {
		if (!inp[0].value) txt = '';
		else txt = 'no results';
	}
	info.html(txt);
}


function highlightFindings (options = { findNext: false, forward: true }) {
	const text = inp[0].value;
	if (!text) webview[0].stopFindInPage('clearSelection');
	else webview[0].findInPage(text, options);
}

function findNext () { highlightFindings({ findNext: true }); }

function findPrev () { highlightFindings({ findNext: true, forward: false }); }


function onKeyUp (ev) {
	if (ev.key === 'Escape') hide();
	else if (ev.key === 'Enter') {
		if (ev.shiftKey) findPrev();
		else findNext();
	}
}


function foundInPage (ev) {
	if (!ev.result || !ev.result.finalUpdate) return;
	const no = ev.result.activeMatchOrdinal || 0;
	const total = ev.result.matches || 0;
	updateInfo(no, total);
}


function onClick (e) {
	const target = $(e.target);
	const go = target.data('go');
	if (target.is('.search-btn')) {
		e.preventDefault();
		if (go === 'close') hide();
		else if (go === 'prev') findPrev();
		else if (go === 'next') findNext();
	}
}


function init () {
	if (isReady) return;
	el = $('.search-bar');
	inp = el.find('.search-input');
	info = el.find('.search-info');
	webview = $('#frame #webview');

	el.on('click', onClick);
	inp.on('input', () => highlightFindings());
	inp.on('keyup', onKeyUp);
	webview.on('found-in-page', foundInPage);

	$.on(EVENT.search.start, show);
	$.on(EVENT.search.stop, hide);

	isReady = true;
}


module.exports = {
	init
};
