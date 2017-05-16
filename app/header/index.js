'use strict';

var _require = require('../services'),
    config = _require.config,
    EVENT = _require.EVENT,
    helper = _require.helper;

var $ = require('../util');

var isReady = false,
    el = void 0,
    starBox = void 0,
    btnBack = void 0,
    btnForw = void 0,
    confirmEl = void 0;

var clickHandlers = {
	prev: function prev() {
		$.trigger(EVENT.frame.goto, 'prev');
	},
	next: function next() {
		$.trigger(EVENT.frame.goto, 'next');
	},
	refresh: function refresh() {
		$.trigger(EVENT.frame.goto, 'refresh');
	},
	stop: function stop() {
		$.trigger(EVENT.frame.goto, 'stop');
	},
	browser: function browser() {
		helper.openInBrowser(config.get('state.url'));
	},
	copy: function copy() {
		helper.copyToClipboard(config.get('state.url'));
	},
	home: function home() {
		$.trigger(EVENT.url.change.to, config.get('homeUrl') || config.get('baseUrl'));
	},
	star: function star() {
		$.trigger(EVENT.bookmark.add, config.get('state.issue'));
	},
	unstar: function unstar() {
		$.trigger(EVENT.bookmark.remove, config.get('state.issue'));
	}
};

function star() {
	starBox.addClass('is-starred');
}

function unstar() {
	starBox.removeClass('is-starred');
}

function toggleStar() {
	if (starBox.hasClass('is-starred')) clickHandlers.unstar();else clickHandlers.star();
}

function showConnectionError() {
	el.addClass('error');
}

function hideConnectionError() {
	el.removeClass('error');
}

function onClick(e) {
	var target = $(e.target);

	if (target.is('.js-copy')) {
		confirmEl.addClass('flash');
		setTimeout(function () {
			confirmEl.removeClass('flash');
		}, 1600);
	}

	if (target.is('.header-btn')) {
		e.preventDefault();
		var to = target.data('go');
		if (to && clickHandlers[to]) clickHandlers[to]();
	}
}

function onUrlChangeStart() {
	hideConnectionError();el.addClass('loading');
}
function onUrlChangeEnd() {
	el.removeClass('loading');
}

function onUrlChanged(webview) {
	btnBack.toggleClass('disabled', !webview.canGoBack());
	btnForw.toggleClass('disabled', !webview.canGoForward());
}

function init() {
	if (isReady) return;

	el = $('#header');
	starBox = el.find('.star-box');
	btnBack = el.find('.js-prev');
	btnForw = el.find('.js-next');
	confirmEl = $('.copy-link-confirmation');

	el.on('click', onClick);

	$.on(EVENT.url.change.done, onUrlChanged);
	$.on(EVENT.url.change.start, onUrlChangeStart);
	$.on(EVENT.url.change.end, onUrlChangeEnd);
	$.on(EVENT.connection.error.show, showConnectionError);
	$.on(EVENT.connection.error.hide, hideConnectionError);
	$.on(EVENT.bookmark.add, star);
	$.on(EVENT.bookmark.remove, unstar);
	$.on(EVENT.bookmark.toggle, toggleStar);

	isReady = true;
}

module.exports = {
	init: init
};