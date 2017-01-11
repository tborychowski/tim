const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const starsDB = require('../db/stars');

let isReady = false, el, starBox, lastUrl;


function gotoUrl (url) {
	if (url) el[0].value = url;
	url = el[0].value.trim();
	const validUrl = isValidUrl(url);
	if (!validUrl) url = config.get('baseUrl') + parseAnyAddress(url);
	starBox.addClass('disabled');

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
	url = getCustomAddress(url);
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
	lastUrl = el[0].value = getCustomAddress(config.get('state.url'));
	if (issue && issue.id) {
		starBox.removeClass('disabled');
		starsDB.getById(issue.id).then(res => {
			starBox.toggleClass('is-starred', !!res);
		});
	}
	el[0].select();
}


function getCustomAddress (url) {
	return url.replace(config.get('baseUrl'), '').replace('pull/', '').replace('issues/', '');
}


function onKeyDown (e) {
	if (e.key === 'ArrowDown') return $.trigger('focus-address-results');
	if (e.key === 'Escape') {
		e.target.value = lastUrl;
		e.target.select();
		$.trigger('address-input-end');
	}
}

function onKeyPress (e) {
	if (e.key === 'Enter') return gotoUrl();
}



function init () {
	if (isReady) return;

	el = $('.addressbar');
	starBox = $('header .star-box');

	el.on('focus', e => { e.target.select(); });
	el.on('keydown', onKeyDown);
	el.on('keypress', onKeyPress);
	el.on('input', e => { $.trigger('address-input', e); });

	$.on('change-url', gotoUrl);
	$.on('url-changed', onUrlChanged);
	$.on('focus-addressbar', () => { el[0].focus(); });

	isReady = true;
}


module.exports = {
	init
};
