const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;
const readFile = require('fs').readFileSync;
const cssFile = './app/notifications/webview.css';


function updateCss () {
	let css;
	try { css = readFile(cssFile, 'utf8'); } catch (e) { css = ''; }
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
	document.querySelector('.accessibility-aid').remove();
}


function onClick (e) {
	const el = e.target;
	if (el.matches('.notifications-list .js-navigation-open')) {
		e.preventDefault();
		msg('goto', el.href);
	}
}


function init () {
	updateCss();
	document.addEventListener('click', onClick, true);
}



document.addEventListener('DOMContentLoaded', init);
