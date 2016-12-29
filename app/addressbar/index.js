const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const starsDB = require('../db/stars');

let isReady = false, el, starBox;


function gotoUrl (url) {
	if (url) el[0].value = url;
	url = el[0].value.trim();
	const validUrl = isValidUrl(url);
	if (!validUrl) url = config.get('baseUrl') + parseAnyAddress(url);
	starBox.addClass('disabled');

	if (url) $.trigger('frame/goto', url);
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
	el[0].value = getCustomAddress(config.get('state.url'));
	if (issue && issue.id) {
		starBox.removeClass('disabled');
		starsDB.getById(issue.id).then(res => {
			starBox.toggleClass('is-starred', !!res);
		});
	}
}


function getCustomAddress (url) {
	return url.replace(config.get('baseUrl'), '').replace('pull/', '').replace('issues/', '');
}

function init () {
	if (isReady) return;

	el = $('.addressbar');
	starBox = $('header .star-box');

	el.on('focus', e => { e.target.select(); });
	el.on('keypress', e => { if (e.key === 'Enter') gotoUrl(); });

	$.on('change-url', gotoUrl);
	$.on('url-changed', onUrlChanged);
	$.on('focus-addressbar', () => { el[0].focus(); });

	isReady = true;
}


module.exports = {
	init
};
