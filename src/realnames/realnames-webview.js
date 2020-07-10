const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;

const trim = (str, chars = '\\s') => str.replace(new RegExp(`(^${chars}+)|(${chars}+$)`, 'g'), '');

const REAL_NAME_CLS = 'real-name-replaced';
const notRealName = `:not(.${REAL_NAME_CLS})`;

let READY = false;

const elementSelectors = [
	`#show_issue .author${notRealName}`,
	`.issues-listing .author${notRealName}`,
	`.sidebar-assignee .assignee${notRealName}`,
	`.user-mention${notRealName}`,
	`a .discussion-item-entity:not(code)${notRealName}`,
	`.project-card .d-block a.text-gray-dark${notRealName}`,
	`.js-issue-row .opened-by a${notRealName}`,
];

const tooltipSelectors = [
	`.reaction-summary-item.tooltipped${notRealName}`
];

function getElementsWithUserId (document) {
	let els = document.querySelectorAll(elementSelectors.join(','));
	return Array.from(els);
}


function getTooltipsWithUserId (document) {
	let els = document.querySelectorAll(tooltipSelectors.join(','));
	return Array.from(els);
}


function gatherUserIds (document) {
	const ids = getElementsWithUserId(document).map(el => trim(el.innerText, '@'));
	return [...new Set(ids)];	// unique list
}



function updateUserNames (document, users) {
	getElementsWithUserId(document).forEach(el => {
		const id = trim(el.innerText, '@');
		if (users[id] && users[id].name) {
			el.innerText = `${users[id].name}`;
			el.title = `${id}`;
			el.classList.add(REAL_NAME_CLS);
		}
	});
	getTooltipsWithUserId(document).forEach(el => {
		let lbl = el.getAttribute('aria-label');
		for (let id in users) lbl = lbl.replace(id, users[id].name);
		el.setAttribute('aria-label', lbl);
		el.classList.add(REAL_NAME_CLS);
	});
}


function init () {
	if (READY) return;
	ipc.on('gatherUserIds', () => msg('userIdsGathered', gatherUserIds(document)));
	ipc.on('userIdsAndNames', (ev, users) => updateUserNames(document, users));
	READY = true;
}

module.exports = init;
