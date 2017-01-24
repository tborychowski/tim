const $ = require('../util');

let webview, el, inp, info,
	timers = [],
	isReady = false,
	isVisible = false;

const clickHandlers = {
	prev: findPrev,
	next: findNext,
	close: hide
};


function delay (fn, d) { timers.push(setTimeout(fn, d || 0)); }
function clearDelays () { timers.forEach(t => clearTimeout(t)); }


function toggle (force) {
	if (typeof force === 'boolean') isVisible = force;
	else isVisible = !isVisible;

	clearDelays();
	if (isVisible) {
		el.removeClass('hidden');
		delay(() => {
			el.addClass('visible');
			inp[0].focus();
		}, 10);
	}
	else hide(true);
}

function hide (toggling) {
	if (!isReady) return;
	el.removeClass('visible');
	inp[0].value = '';
	findInPage();
	updateInfo();
	if (toggling) {
		$.trigger('focus-addressbar');
		delay(() => { el.addClass('hidden'); }, 350);
	}
}


function updateInfo (no, total) {
	let txt = `${no} of ${total}`;
	if (!total) {
		if (!inp[0].value) txt = '';
		else txt = 'no results';
	}
	info.html(txt);
}


function findInPage (options) {
	const text = inp[0].value;
	const opts = Object.assign({ findNext: false, forward: true }, options || {});
	if (!text) webview.stopFindInPage('clearSelection');
	else webview.findInPage(text, opts);
}
function findNext () { findInPage({ findNext: true }); }
function findPrev () { findInPage({ forward: false, findNext: true }); }


function onKeyUp (ev) {
	const key = ev.key;
	if (key === 'Escape') toggle(false);
	else if (key === 'Enter') {
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
	let target = $(e.target);
	if (target.is('.search-btn')) {
		e.preventDefault();
		const to = target.data('go');
		if (to && clickHandlers[to]) clickHandlers[to]();
	}
}


function init (wv) {
	webview = wv;
	el = $('.search-bar');
	inp = el.find('.search-input');
	info = el.find('.search-info');

	el.on('click', onClick);
	inp.on('input', () => findInPage());
	inp.on('keyup', onKeyUp);
	webview.addEventListener('found-in-page', foundInPage);

	isReady = true;
}


function find (wv) {
	if (!isReady) init(wv);
	toggle();
}


module.exports = {
	start: find,
	stop: hide
};
