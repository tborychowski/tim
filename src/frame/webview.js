const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;
const realnames = require('../realnames/realnames-webview');
const helper = require('./webview-helper');

const {SpellCheckHandler, ContextMenuListener, ContextMenuBuilder} = require('electron-spellchecker');


let isScrolling = false, isWheeling = false;


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


function onKeyUp (e) {
	if (document.activeElement.matches('input,select,iframe,textarea')) return;
	const ev = {
		key: e.key,
		keyCode: e.keyCode,
		metaKey: e.metaKey,
		ctrlKey: e.ctrlKey,
		shiftKey: e.shiftKey,
		type: e.type
	};
	msg('keyup', ev);
}


function initSpellchecker () {
	window.spellCheckHandler = new SpellCheckHandler();
	window.spellCheckHandler.attachToInput();
	window.spellCheckHandler.switchLanguage('en-US');
	let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
	return new ContextMenuListener(info => { contextMenuBuilder.showPopupMenu(info); });
}


function init () {
	observeChanges();

	const aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();

	ipc.on('gatherUserIds', () => msg('userIdsGathered', realnames.gatherUserIds(document)));
	ipc.on('userIdsAndNames', (ev, users) => realnames.updateUserNames(document, users));


	ipc.on('injectCss', (ev, css) => helper.injectCss(document, css));
	ipc.on('zoom', (ev, zoom) => { document.body.style.zoom = zoom * 0.1 + 1; });

	ipc.on('swipe-start', onSwipeStart);
	ipc.on('swipe-end', onSwipeEnd);

	document.addEventListener('click', onClick);
	document.addEventListener('wheel', onWheel);
	document.addEventListener('keyup', onKeyUp);

	// don't handle dragging stuff around
	document.ondragover = () => { return false; };
	document.ondragleave = () => { return false; };
	document.ondragend = () => { return false; };
	document.ondrop = () => { return false; };

	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');

	const issue = helper.getIssueDetails(document);
	scrollToLastComment(issue);

	onDomChange();

	initSpellchecker();
}


document.addEventListener('DOMContentLoaded', init);
