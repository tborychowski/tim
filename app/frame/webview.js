const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;
const readFile = require('fs').readFileSync;
const cssFile = './app/frame/webview.css';


function updateCss () {
	let css;
	try { css = readFile(cssFile, 'utf8'); } catch (e) { css = ''; }
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
	document.querySelector('.accessibility-aid').remove();
}


function onDomChange () {
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


function init () {
	updateCss();
	observeChanges();
	onDomChange();
	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady', '<div>' + document.querySelector('body').innerHTML + '</div>');
}



document.addEventListener('DOMContentLoaded', init);
