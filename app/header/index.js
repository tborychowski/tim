const {shell, clipboard} = require('electron');
const $ = require('../util');
const config = $.getConfig();
const EVENT = require('../db/events');

let isReady = false, el, starBox, btnBack, btnForw;

const clickHandlers = {
	prev () { $.trigger(EVENT.frame.goto, 'prev'); },
	next () { $.trigger(EVENT.frame.goto, 'next'); },
	refresh () { $.trigger(EVENT.frame.goto, 'refresh'); },
	stop () { $.trigger(EVENT.frame.goto, 'stop'); },
	browser () { shell.openExternal(config.get('state.url')); },
	copy () { clipboard.writeText(config.get('state.url')); },
	hideNotifications () { $.trigger(EVENT.notifications.toggle, false); },
	showNotifications () { $.trigger(EVENT.notifications.toggle, true); },
	home () { $.trigger(EVENT.url.change.to, config.get('homeUrl') || config.get('baseUrl')); },
	star () { $.trigger(EVENT.bookmark.add, config.get('state.issue')); },
	unstar () { $.trigger(EVENT.bookmark.remove, config.get('state.issue')); },
};

function star () {
	starBox.addClass('is-starred');
}

function unstar () {
	starBox.removeClass('is-starred');
}

function showConnectionError () {
	el.addClass('error');
}

function hideConnectionError () {
	el.removeClass('error');
}


function onClick (e) {
	let target = $(e.target);
	if (target.is('.header-btn')) {
		e.preventDefault();
		const to = target.data('go');
		if (to && clickHandlers[to]) clickHandlers[to]();
	}
}

function onUrlChangeStart () { el.addClass('loading'); }
function onUrlChangeEnd () { el.removeClass('loading'); }

function onUrlChanged (webview) {
	btnBack.toggleClass('disabled', !webview.canGoBack());
	btnForw.toggleClass('disabled', !webview.canGoForward());
}


function init () {
	if (isReady) return;

	el = $('#header');
	starBox = el.find('.star-box');
	btnBack = el.find('.js-prev');
	btnForw = el.find('.js-next');

	el.on('click', onClick);

	$.on(EVENT.url.change.done, onUrlChanged);
	$.on(EVENT.url.change.start, onUrlChangeStart);
	$.on(EVENT.url.change.end, onUrlChangeEnd);
	$.on(EVENT.connection.error.show, showConnectionError);
	$.on(EVENT.connection.error.hide, hideConnectionError);
	$.on(EVENT.bookmark.add, star);
	$.on(EVENT.bookmark.remove, unstar);

	isReady = true;
}


module.exports = {
	init
};
