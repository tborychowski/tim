const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;
const realnames = require('../realnames/realnames-webview');
const helper = require('./webview-helper');



let isScrolling = false, isWheeling = false, lastFocusedTextarea = null;

function ignoreEvent (e) {
	e.preventDefault();
	return false;
}

// Throttle
let domChangeTimer;
function onDomChange () {
	if (domChangeTimer) clearTimeout(domChangeTimer);
	domChangeTimer = setTimeout(_onDomChange, 200);
}

function _onDomChange () {
	const issue = helper.getIssueDetails(document);
	msg('domChanged', issue.url, issue);
}


function observeChanges () {
	const observer = new MutationObserver(onDomChange);
	const target = document.querySelector('div[role=main]');
	if (target) observer.observe(target, { childList: true, subtree: true });
}



function scrollToLastComment (issue) {
	if (location.hash) return;
	if (issue.type !=='issue' && issue.type !=='pr') return;
	const comments = document.querySelectorAll('#discussion_bucket .js-discussion .js-comment-container');
	const lastComment = Array.from(comments).pop();
	if (lastComment) lastComment.scrollIntoViewIfNeeded();
}

function onWheel (e) {
	if (!isScrolling || isWheeling) return;
	isWheeling = true;
	if (!helper.isScrollable(e.target)) msg('swipe-allowed'); // handled in swiping.js
}

function onSwipeStart () {
	isScrolling = true;
	isWheeling = false;
}

function onSwipeEnd () {
	isScrolling = false;
}


function onClick (e) {
	msg('documentClicked');
	const el = e.target;

	if (e.metaKey || e.ctrlKey) {
		let a = el.closest('a'), url;
		if (a) { e.stopPropagation(); e.preventDefault(); }

		if (el.tagName === 'IMG') url = e.target.src;
		else if (a) url = a.href;

		return msg('openInBrowser', url);
	}
	if (el.tagName === 'A') {
		if (helper.isExternal(el.href)) {
			e.preventDefault();
			msg('openInBrowser', el.href);
		}
	}
}


function onWindowFocus () {
	if (lastFocusedTextarea) lastFocusedTextarea.focus();
	else document.documentElement.focus();
}

function onElementFocus (e) {
	if (e.target.matches('textarea')) lastFocusedTextarea = e.target;
	else lastFocusedTextarea = null;
}

function init () {
	observeChanges();

	const aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();

	realnames();

	ipc.on('injectCss', (ev, css) => helper.injectCss(document, css));
	ipc.on('zoom', (ev, zoom) => { document.body.style.zoom = zoom * 0.1 + 1; });

	ipc.on('swipe-start', onSwipeStart);
	ipc.on('swipe-end', onSwipeEnd);

	document.addEventListener('click', onClick);
	document.addEventListener('wheel', onWheel);

	// don't handle dragging stuff around
	document.addEventListener('dragover', ignoreEvent);
	document.addEventListener('dragleave', ignoreEvent);
	document.addEventListener('dragend', ignoreEvent);
	document.addEventListener('drop', ignoreEvent);

	window.addEventListener('focus', onWindowFocus);
	document.addEventListener('focus', onElementFocus, true);

	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');

	const issue = helper.getIssueDetails(document);
	scrollToLastComment(issue);

	onDomChange();
}


document.addEventListener('DOMContentLoaded', init);
