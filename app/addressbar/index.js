const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const starsDB = require('../db/stars');

let isReady = false, el, starBox;


function gotoUrl (url) {
	if (url) el[0].value = url;
	url = el[0].value.trim();
	const validUrl = isValidUrl(url);
	if (!config.get('baseUrl') && validUrl) {
		config.set('baseUrl', validUrl.href);
		url = '';
	}
	if (!validUrl) url = config.get('baseUrl') + parseAnyAddress(url);

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
		if (id) url += `/issues/${id}`;
	}
	return url;
}


function onIssueChange (issue) {
	el[0].value = getCustomAddress(config.get('state.url'));
	issue = issue || { id: '' };
	starBox.toggleClass('is-issue', !!issue.id);
	if (issue.id) {
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

	if (!config.get('baseUrl')) {
		el[0].setAttribute('placeholder', 'Start by entering your github URL');
	}

	el.on('focus', e => { e.target.select(); });
	el.on('keypress', e => { if (e.key === 'Enter') gotoUrl(); });

	$.on('change-url', gotoUrl);
	$.on('issue/changed', onIssueChange);

	isReady = true;
}


module.exports = {
	init
};
