const { config, EVENT, helper } = require('../services');
const $ = require('../util');

let isReady = false, el, starBox, btnBack, btnForw, confirmEl;

const clickHandlers = {
	// prev () { $.trigger(EVENT.frame.goto, 'prev'); },
	// next () { $.trigger(EVENT.frame.goto, 'next'); },
	// refresh () { $.trigger(EVENT.frame.goto, 'refresh'); },
	// stop () { $.trigger(EVENT.frame.goto, 'stop'); },
	// home () { $.trigger(EVENT.url.change.to, config.get('homeUrl') || config.get('baseUrl')); },
	// browser () { helper.openInBrowser(config.get('state.url')); },
	// copy () { helper.copyToClipboard(config.get('state.url')); },
	// star () { $.trigger(EVENT.bookmark.add, config.get('state.issue')); },
	// unstar () { $.trigger(EVENT.bookmark.remove, config.get('state.issue')); },
};

function star () {
	starBox.addClass('is-starred');
}

function unstar () {
	starBox.removeClass('is-starred');
}

function toggleStar () {
	if (starBox.hasClass('is-starred')) clickHandlers.unstar();
	else clickHandlers.star();
}

function showConnectionError () {
	el.addClass('error');
}

function hideConnectionError () {
	el.removeClass('error');
}


function onClick (e) {
	let target = $(e.target);

	if (target.is('.js-copy')) {
		// confirmEl.addClass('flash');
		// setTimeout(() => { confirmEl.removeClass('flash'); }, 5000);
	}

	if (target.is('.header-btn')) {
		e.preventDefault();
		const to = target.data('go');
		if (to && clickHandlers[to]) clickHandlers[to]();
	}
}

function onUrlChangeStart () { hideConnectionError(); el.addClass('loading'); }
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
	confirmEl =  $('.copy-link-confirmation');


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
	init
};
