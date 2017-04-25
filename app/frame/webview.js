const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;
const realnames = require('../realnames/realnames-webview');
const helper = require('./webview-helper');


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
	// else console.log('Observer target not found');
	// observer.disconnect();
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
		const a = el.closest('a');
		if (el.tagName === 'IMG') msg('showPreview', e.target.src);
		else if (a) msg('showPreview', a.href);
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


function onContextMenu (e) {
	if (e.target.matches('img')) return msg('showImgMenu', e.target.getAttribute('src'));
	if (e.target.matches('a')) return msg('showLinkMenu', e.target.getAttribute('href'));
	const selText = helper.getSelectionText(document);
	if (selText) return msg('showSelectionMenu', selText);
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
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('wheel', onWheel);
	document.addEventListener('keyup', onKeyUp);

	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');

	onDomChange();
}


document.addEventListener('DOMContentLoaded', init);
