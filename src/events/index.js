const $ = require('../util');
const ipc = require('electron').ipcRenderer;
const { EVENT, helper } = require('../services');


function onDocumentClick (e) {
	if (e.metaKey || e.ctrlKey) {
		const a = e.target.closest('a');
		if (a && a.matches('#subnav a')) {
			helper.openInBrowser(a.getAttribute('href'));
			e.stopPropagation();
			e.preventDefault();
			return;
		}
	}
	$.trigger(EVENT.document.clicked, e);
}



ipc.on('event', (ev, name) => $.trigger(name));
ipc.on(EVENT.frame.goto, (ev, url) => $.trigger(EVENT.frame.goto, url));

document.addEventListener('click', onDocumentClick);
document.addEventListener('keyup', e => $.trigger(EVENT.document.keyup, e));

window.addEventListener('blur', () => document.body.classList.add('window-inactive'));
window.addEventListener('focus', () => document.body.classList.remove('window-inactive'));

// don't handle dragging stuff around
document.ondragover = () => { return false; };
document.ondragleave = () => { return false; };
document.ondragend = () => { return false; };
document.ondrop = () => { return false; };
