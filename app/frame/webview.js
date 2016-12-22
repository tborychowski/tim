const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;


// Throttle
let domChangeTimer;
function onDomChange () {
	if (domChangeTimer) clearTimeout(domChangeTimer);
	domChangeTimer = setTimeout(_onDomChange, 200);
}

function _onDomChange () {
	const isIssue = !!document.getElementById('discussion_bucket');
	let issue = null;
	const url = document.location.href;
	if (isIssue) {
		issue = {
			name: document.querySelector('.js-issue-title').innerText,
			id: document.querySelector('.gh-header-number').innerText.substr(1),
			repo: document.querySelector('.js-repo-nav .reponav-item').getAttribute('href').substr(1),
			type: document.querySelector('.tabnav-pr') ? 'pr' : 'issue',
			url: url
		};
	}
	msg('domChanged', url, issue);
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
}


function trim (str, chars) {
	chars = chars || '\\s';
	return str.replace(new RegExp(`(^${chars}+)|(${chars}+$)`, 'g'), '');
}


function getElementsWithUserId () {
	const userSelectors = [
		'.issues-listing .author:not(.user-name-replaced)',
		'.sidebar-assignee .assignee:not(.user-name-replaced)',
		'.user-mention:not(.user-name-replaced)',
		'a .discussion-item-entity:not(.user-name-replaced)'
	];
	let els = document.querySelectorAll(userSelectors.join(','));
	return Array.prototype.slice.call(els);
}

function getTooltipsWithUserId () {
	const userSelectors = [
		'.reaction-summary-item.tooltipped:not(.user-name-replaced)'
	];
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


function isExternal (url) {
	let u;
	try { u = new URL(url); }
	catch (e) { u = null; }
	return (u && u.host !== location.host);
}


function onClick (e) {
	const el = e.target;
	if (el.tagName === 'A') {
		if (isExternal(el.href)) {
			e.preventDefault();
			msg('externalLinkClicked', el.href);
		}
		else msg('linkClicked', el.href);
	}
}


function init () {
	observeChanges();

	const aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();

	ipc.on('gatherUserIds', gatherUserIds);
	ipc.on('userIdsAndNames', updateUserNames);
	ipc.on('injectCss', injectCss);
	document.addEventListener('click', onClick, true);

	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady', '<div>' + document.querySelector('body').innerHTML + '</div>');

	onDomChange();
}


document.addEventListener('DOMContentLoaded', init);
