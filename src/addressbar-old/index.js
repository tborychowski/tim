const $ = require('../util');
const { config, EVENT, bookmarks } = require('../services');

let isReady = false,
	el = null,
	issueBox = null,
	starBox,
	lastFullUrl = '',
	searchTerm = null;

const baseUrl = $.rtrim(config.get('baseUrl'), '/');
const repoToSearch = config.get('repoToSearch');


function getFocusedText () {
	if (searchTerm) return searchTerm;
	return lastFullUrl;
}


function gotoIssue (id) {
	const url = [baseUrl, repoToSearch, 'issues', id].join('/');
	gotoUrl(url);

}

function star (exists) {
	starBox.toggleClass('is-starred', !!exists);
	$.trigger(EVENT.bookmark.exists, !!exists);
}

// BaseURL/Group/RepoName/issues?q=is:open is:issue...
function getSearchUrl (q) {
	const query = 'issues?q=is:open is:issue ' + q;
	return [baseUrl, repoToSearch, query].join('/');
}

function checkIfBookmarked (url) {
	if (url.indexOf('#') > -1) url = url.substr(0, url.indexOf('#'));
	bookmarks.getByUrl(url).then(star);
}


function gotoUrl (url) {
	searchTerm = null;

	if (url) el[0].value = url;
	url = el[0].value.trim();

	const validUrl = $.parseUrl(url);

	if (!validUrl) {	// not a URL - do search
		searchTerm = url;
		url = getSearchUrl(url);
	}

	star(false);
	if (url) $.trigger(EVENT.frame.goto, url);
	$.trigger(EVENT.address.input.end);
}


function onUrlChanged (webview, issue) {
	if (issue) searchTerm = null;

	lastFullUrl = config.get('state.url');

	// el[0].value = getUnfocusedText();
	el[0].value = issue.url;
	issueBox[0].value = (issue && issue.id ? issue.id : '');

	if (issue && issue.url) checkIfBookmarked(issue.url);
}


function focusAddressbar () {
	setTimeout(() => { el[0].select(); }, 10);
}

function focusIssuebox () {
	setTimeout(() => { issueBox[0].select(); }, 10);
}



function onFocus () {
	el[0].select();
}

function onKeyPress (e) {
	if (e.key === 'Enter') return gotoUrl();
}

function onKeyDown (e) {
	if (e.key === 'ArrowDown') return $.trigger(EVENT.history.focus);
	if (e.key === 'Escape') {
		e.target.value = getFocusedText();
		e.target.select();
		$.trigger(EVENT.address.input.end);
	}
}

function onInput (e) {
	$.trigger(EVENT.address.input.key, e);
}

function onIssueBoxFocus(e) {
	e.target.select();
	$.trigger(EVENT.address.input.end);
}

function onIssueBoxKeydown (e) {
	if (!$.isNumberField(e)) return e.preventDefault();
}

function onIssueBoxKeyup (e) {
	const val = e.target.value;
	if (!(/^\d*$/).test(val)) e.target.value = parseInt(val, 10) || '';
}

function onIssueBoxPaste (e) {
	const pasteText = e.clipboardData && e.clipboardData.getData('Text');
	if (!(/^\d*$/).test(pasteText)) e.preventDefault();
}


function init () {
	if (isReady) return;

	el = $('.addressbar');
	issueBox = $('.issue-id-bar');
	starBox = $('header .star-box');

	el.on('focus', onFocus);
	el.on('keydown', onKeyDown);
	el.on('keypress', onKeyPress);
	el.on('input', onInput);

	issueBox.on('focus', onIssueBoxFocus);
	issueBox.on('keypress', e => { if (e.key === 'Enter') gotoIssue(e.target.value); });
	issueBox.on('keydown', onIssueBoxKeydown);
	issueBox.on('keyup', onIssueBoxKeyup);
	issueBox.on('paste', onIssueBoxPaste);


	$.on(EVENT.url.change.to, gotoUrl);
	$.on(EVENT.url.change.done, onUrlChanged);
	$.on(EVENT.address.focus, focusAddressbar);
	$.on(EVENT.address.issueFocus, focusIssuebox);

	isReady = true;
}


module.exports = {
	init
};