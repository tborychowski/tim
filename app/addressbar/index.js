const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const starsDB = require('../db/stars');

let isReady = false, el, starBox, lastShortUrl = '', lastFullUrl = '', lastIssue = '';


function getUnfocusedText () {
	return lastIssue && lastIssue.name ? lastIssue.name : lastShortUrl;
}


function gotoUrl (url) {
	if (url) el[0].value = url;
	url = el[0].value.trim();
	const validUrl = isValidUrl(url);
	if (!validUrl) url = config.get('baseUrl') + parseAnyAddress(url);
	starBox.addClass('disabled');

	// $.trigger('hide-connection-error');
	if (url) $.trigger('frame/goto', url);
	$.trigger('address-input-end');
}

function isValidUrl (url) {
	let urlt;
	try { urlt = new URL(url); }
	catch (e) { urlt = null; }
	return urlt;
}


function parseAnyAddress (url) {
	url = shortenUrl(url);
	const parts = url.split('/');
	let id;
	url = '';
	if (parts.length > 2) id = parts.pop();
	if (parts.length > 1) {
		url = parts.join('/');
		if (id === 'issues') id = '/';
		if (id) url += `/issues/${id}`;
	}
	return $.rtrim(url, '/');
}


function onUrlChanged (webview, issue) {
	lastFullUrl = config.get('state.url');
	lastShortUrl = shortenUrl(lastFullUrl);
	lastIssue = issue || {};

	el[0].value = getUnfocusedText();

	if (issue && issue.id) {
		starBox.removeClass('disabled');
		starsDB.getById(issue.id).then(res => {
			starBox.toggleClass('is-starred', !!res);
		});
	}
}


function shortenUrl (url = '') {
	return url
		.replace(config.get('baseUrl'), '')
		.replace('pull/', '')
		.replace('issues/', '')
		.split('#')
		.shift();
}

function focusAddressbar () {
	setTimeout(() => { el[0].select(); }, 10);
}



function onFocus () {
	el[0].value = lastFullUrl;
	el[0].select();
}

function onBlur () {
	el[0].value = getUnfocusedText();
}

function onKeyDown (e) {
	if (e.key === 'ArrowDown') return $.trigger('focus-address-results');
	if (e.key === 'Escape') {
		e.target.value = lastFullUrl;
		e.target.select();
		$.trigger('address-input-end');
	}
}

function onKeyPress (e) {
	if (e.key === 'Enter') return gotoUrl();
}

function onInput (e) {
	$.trigger('address-input', e);
}

function onMenuClick (target) {
	if (target === 'focus-addressbar') focusAddressbar();
}


function init () {
	if (isReady) return;

	el = $('.addressbar');
	starBox = $('header .star-box');

	el.on('focus', onFocus);
	el.on('blur', onBlur);
	el.on('keydown', onKeyDown);
	el.on('keypress', onKeyPress);
	el.on('input', onInput);

	$.on('change-url', gotoUrl);
	$.on('url-changed', onUrlChanged);
	$.on('focus-addressbar', focusAddressbar);
	$.on('menu', onMenuClick);

	isReady = true;
}


module.exports = {
	init
};
