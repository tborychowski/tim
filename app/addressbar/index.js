const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const starsDB = require('../db/stars');

let isReady = false, el, starBox, lastShortUrl = '', lastFullUrl = '', lastIssue = '',
	searchTerm = null;

const baseUrl = $.rtrim(config.get('baseUrl'), '/');
const repoToSearch = config.get('repoToSearch');


function getUnfocusedText () {
	if (searchTerm) return searchTerm;
	if (!lastIssue || !lastIssue.name) return lastShortUrl || '';
	const mod = lastIssue.repo ? lastIssue.repo.split('/').pop() : '';
	let url = `${mod} / ${lastIssue.name}`;
	return url.replace(/(^[\/\s]+)|([\/\s]+$)/g, '');
}

function getFocusedText () {
	if (searchTerm) return searchTerm;
	return lastFullUrl;
}


// BaseURL/Group/RepoName/issues?q=is:open is:issue...
function getSearchUrl (q) {
	const query = 'issues?q=is:open is:issue ' + q;
	return [baseUrl, repoToSearch, query].join('/');
}

function checkIfBookmarked (url) {
	if (url.indexOf('#') > -1) url = url.substr(0, url.indexOf('#'));
	starsDB.getByUrl(url).then(res => {
		starBox.toggleClass('is-starred', !!res);
	});
}


function gotoUrl (url) {
	searchTerm = null;

	if (url) el[0].value = url;
	url = el[0].value.trim();

	const validUrl = isValidUrl(url);

	if (!validUrl) {	// not a URL - do search
		searchTerm = url;
		url = getSearchUrl(url);
	}

	starBox.toggleClass('is-starred', false);
	if (url) $.trigger('frame/goto', url);
	$.trigger('address-input-end');
}

function isValidUrl (url) {
	let urlt;
	try { urlt = new URL(url); }
	catch (e) { urlt = null; }
	return urlt;
}


function onUrlChanged (webview, issue) {
	if (issue) searchTerm = null;

	lastFullUrl = config.get('state.url');
	lastShortUrl = shortenUrl(lastFullUrl);
	lastIssue = issue || {};

	el[0].value = getUnfocusedText();

	if (issue && issue.url) checkIfBookmarked(issue.url);
}


function shortenUrl (url = '') {
	if (url.indexOf('?q=') > -1) {	// it's search url
		return searchTerm = url
			.split('?q=').pop()
			.replace(/is(:|%3A)(issue|open|closed)/g, '')
			.replace(/(%20|\+)/g, ' ')
			.trim();
	}
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
	el[0].value = getFocusedText();
	el[0].select();
}

function onBlur () {
	el[0].value = getUnfocusedText();
}

function onKeyPress (e) {
	if (e.key === 'Enter') return gotoUrl();
}

function onKeyDown (e) {
	if (e.key === 'ArrowDown') return $.trigger('focus-address-results');
	if (e.key === 'Escape') {
		e.target.value = getFocusedText();
		e.target.select();
		$.trigger('address-input-end');
	}
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
