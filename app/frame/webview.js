const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;

const trim = (str, chars = '\\s') => str.replace(new RegExp(`(^${chars}+)|(${chars}+$)`, 'g'), '');
const isScrollable = el => (el && el.scrollWidth > el.offsetWidth + 5);

function isExternal (url) {
	let u;
	try { u = new URL(url); }
	catch (e) { u = null; }
	return (u && u.host !== location.host);
}

let isScrolling = false, isWheeling = false;



// Throttle
let domChangeTimer;
function onDomChange () {
	if (domChangeTimer) clearTimeout(domChangeTimer);
	domChangeTimer = setTimeout(_onDomChange, 200);
}

function _onDomChange () {
	const isIssue = !!document.getElementById('discussion_bucket');
	let issue = null, url = document.location.href;
	if (url.indexOf('http') !== 0) url = '';	// network error
	const isPR = !!document.querySelector('.mergeability-details');
	if (isIssue) {
		issue = {
			name: document.querySelector('.js-issue-title').innerText,
			id: document.querySelector('.gh-header-number').innerText.substr(1),
			repo: document.querySelector('.js-repo-nav .reponav-item').getAttribute('href').substr(1),
			type: document.querySelector('.tabnav-pr') ? 'pr' : 'issue',
			url
		};
		if (isPR) issue.buildUrl = getJenkinsUrl();
	}
	// just a regular page
	else issue = { name: document.title, url };

	msg('domChanged', url, issue);
}


function getJenkinsUrl () {
	const statusItems = document.querySelectorAll('.mergeability-details .merge-status-item');
	for (let i = 0, item; item = statusItems[i]; i++) {
		let txt = item.innerText.toLowerCase();
		if (txt.indexOf('jenkins') === -1) continue;
		return item.querySelector('.merge-status-details').getAttribute('href');
	}
	return '';
}


function observeChanges () {
	const observer = new MutationObserver(onDomChange);
	const target = document.querySelector('div[role=main]');
	if (target) observer.observe(target, { childList: true, subtree: true });
	else console.log('Observer target not found');
	// observer.disconnect();
}


function injectCss (ev, css) {
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
	msg('cssReady');
}



function getElementsWithUserId () {
	const userSelectors = [
		'.issues-listing .author:not(.user-name-replaced)',
		'.sidebar-assignee .assignee:not(.user-name-replaced)',
		'.user-mention:not(.user-name-replaced)',
		'a .discussion-item-entity:not(.user-name-replaced):not(code)'
	];
	let els = document.querySelectorAll(userSelectors.join(','));
	return Array.prototype.slice.call(els);
}

function getTooltipsWithUserId () {
	const userSelectors = [ '.reaction-summary-item.tooltipped:not(.user-name-replaced)' ];
	let els = document.querySelectorAll(userSelectors.join(','));
	return Array.prototype.slice.call(els);
}


function gatherUserIds () {
	const ids = getElementsWithUserId().map(el => trim(el.innerText, '@'));
	msg('userIdsGathered', [...new Set(ids)]);	// send unique list
}


function updateUserNames (ev, users) {
	getElementsWithUserId().forEach(el => {
		const id = trim(el.innerText, '@');
		if (users[id]) {
			el.innerText = `${users[id].name}`;
			el.title = `${id}`;
			el.classList.add('user-name-replaced');
		}
	});
	getTooltipsWithUserId().forEach(el => {
		if (el.classList.contains('user-name-replaced')) return;
		let lbl = el.getAttribute('aria-label');
		for (let id in users) lbl = lbl.replace(id, users[id].name);
		el.setAttribute('aria-label', lbl);
		el.classList.add('user-name-replaced');
	});
}



function onWheel (e) {
	if (!isScrolling || isWheeling) return;
	isWheeling = true;
	let el = e.target, isIt = false;
	while (el.tagName && isIt === false) {
		if (el.tagName === 'BODY') break;
		if (!isScrollable(el)) el = el.parentNode;
		else {
			isIt = true;
			break;
		}
	}
	if (!isIt) msg('swipe-allowed'); // handled in swiping.js
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
	if (el.tagName === 'A') {
		if (isExternal(el.href)) {
			e.preventDefault();
			msg('externalLinkClicked', el.href);
		}
		else msg('linkClicked', el.href);
	}
}

function getSelectionText() {
	let text = '';
	const activeEl = document.activeElement;
	const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
	const isInput = (activeElTagName === 'input' && /^(?:text|search|password|tel|url)$/i.test(activeEl.type));
	if ((activeElTagName === 'textarea' || isInput) && typeof activeEl.selectionStart === 'number') {
		text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
	}
	else if (window.getSelection) text = window.getSelection().toString();
	return text;
}


function onContextMenu (e) {
	if (e.target.matches('a')) return msg('showLinkMenu', e.target.getAttribute('href'));
	if (e.target.matches('img')) return msg('showImgMenu', e.target.getAttribute('src'));
	const selText = getSelectionText();
	if (selText) return msg('showSelectionMenu', selText);
}


function init () {
	observeChanges();

	const aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();

	ipc.on('gatherUserIds', gatherUserIds);
	ipc.on('userIdsAndNames', updateUserNames);
	ipc.on('injectCss', injectCss);

	ipc.on('swipe-start', onSwipeStart);
	ipc.on('swipe-end', onSwipeEnd);

	document.addEventListener('click', onClick);
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('wheel', onWheel);

	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');

	onDomChange();
}


document.addEventListener('DOMContentLoaded', init);
