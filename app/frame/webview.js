'use strict';

var ipc = require('electron').ipcRenderer;
var msg = ipc.sendToHost;
var realnames = require('../realnames/realnames-webview');
var helper = require('./webview-helper');

var isScrolling = false,
    isWheeling = false;

// Throttle
var domChangeTimer = void 0;
function onDomChange() {
	if (domChangeTimer) clearTimeout(domChangeTimer);
	domChangeTimer = setTimeout(_onDomChange, 200);
}

function _onDomChange() {
	var issue = helper.getIssueDetails(document);
	msg('domChanged', issue.url, issue);
}

function observeChanges() {
	var observer = new MutationObserver(onDomChange);
	var target = document.querySelector('div[role=main]');
	if (target) observer.observe(target, { childList: true, subtree: true });
	// else console.log('Observer target not found');
	// observer.disconnect();
}

function scrollToLastComment(issue) {
	if (location.hash) return;
	if (issue.type !== 'issue' && issue.type !== 'pr') return;
	var comments = document.querySelectorAll('#discussion_bucket .js-discussion .js-comment-container');
	var lastComment = Array.from(comments).pop();
	if (lastComment) lastComment.scrollIntoViewIfNeeded();
}

function onWheel(e) {
	if (!isScrolling || isWheeling) return;
	isWheeling = true;
	if (!helper.isScrollable(e.target)) msg('swipe-allowed'); // handled in swiping.js
}

function onSwipeStart() {
	isScrolling = true;
	isWheeling = false;
}

function onSwipeEnd() {
	isScrolling = false;
}

function onClick(e) {
	msg('documentClicked');
	var el = e.target;

	if (e.metaKey || e.ctrlKey) {
		var a = el.closest('a');
		if (el.tagName === 'IMG') msg('showPreview', e.target.src);else if (a) msg('showPreview', a.href);
		if (a) {
			e.stopPropagation();
			e.preventDefault();
		}
		return;
	}
	if (el.tagName === 'A') {
		if (helper.isExternal(el.href)) {
			e.preventDefault();
			msg('externalLinkClicked', el.href);
		}
	}
}

function onContextMenu(e) {
	if (e.target.matches('img')) return msg('showImgMenu', e.target.getAttribute('src'));
	if (e.target.matches('a')) return msg('showLinkMenu', e.target.getAttribute('href'));
	var selText = helper.getSelectionText(document);
	if (selText) return msg('showSelectionMenu', selText);
}

function onKeyUp(e) {
	if (document.activeElement.matches('input,select,iframe,textarea')) return;
	var ev = {
		key: e.key,
		keyCode: e.keyCode,
		metaKey: e.metaKey,
		ctrlKey: e.ctrlKey,
		shiftKey: e.shiftKey,
		type: e.type
	};
	msg('keyup', ev);
}

function init() {
	observeChanges();

	var aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();

	ipc.on('gatherUserIds', function () {
		return msg('userIdsGathered', realnames.gatherUserIds(document));
	});
	ipc.on('userIdsAndNames', function (ev, users) {
		return realnames.updateUserNames(document, users);
	});

	ipc.on('injectCss', function (ev, css) {
		return helper.injectCss(document, css);
	});
	ipc.on('zoom', function (ev, zoom) {
		document.body.style.zoom = zoom * 0.1 + 1;
	});

	ipc.on('swipe-start', onSwipeStart);
	ipc.on('swipe-end', onSwipeEnd);

	document.addEventListener('click', onClick);
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('wheel', onWheel);
	document.addEventListener('keyup', onKeyUp);

	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');

	var issue = helper.getIssueDetails(document);
	scrollToLastComment(issue);

	onDomChange();
}

document.addEventListener('DOMContentLoaded', init);