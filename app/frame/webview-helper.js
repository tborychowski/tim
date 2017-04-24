
function isExternal (url) {
	let u;
	try { u = new URL(url); }
	catch (e) { u = null; }
	return (u && u.host !== location.host);
}

function injectCss (document, css) {
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
}


function getIssueDetails (document) {
	let url = document.location.href;
	if (url.indexOf('http') !== 0) url = '';	// network error

	const isIssue = !!document.querySelector('#discussion_bucket, #files_bucket, #commits_bucket');
	let issue = null;
	if (isIssue) {
		issue = {
			name: document.querySelector('.js-issue-title').innerText,
			id: document.querySelector('.gh-header-number').innerText.substr(1),
			repo: document.querySelector('.js-repo-nav .reponav-item').getAttribute('href').substr(1),
			type: document.querySelector('.tabnav-pr') ? 'pr' : 'issue',
			url
		};
	}
	// just a regular page
	else issue = { name: document.title, url };
	return issue;
}


function getSelectionText (document) {
	let text = '';
	const window = document.defaultView;
	const activeEl = document.activeElement;
	const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
	const isInput = (activeElTagName === 'input' && /^(?:text|search|password|tel|url)$/i.test(activeEl.type));
	if ((activeElTagName === 'textarea' || isInput) && typeof activeEl.selectionStart === 'number') {
		text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
	}
	else if (window.getSelection) text = window.getSelection().toString();
	return text;
}


function isScrollable (el) {
	if (!el) return false;
	let isIt = false;
	while (el.tagName && isIt === false) {
		if (el.tagName === 'BODY') break;
		if (el.scrollWidth < el.offsetWidth + 5) el = el.parentNode;
		else {
			isIt = true;
			break;
		}
	}
	return isIt;
}


module.exports = {
	isExternal,
	injectCss,
	getIssueDetails,
	getSelectionText,
	isScrollable,
};
