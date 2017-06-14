const $ = require('../util');
const ipc = require('electron').ipcRenderer;
const { EVENT, helper } = require('../services');

function ignoreEvent (e) {
	e.preventDefault();
	return false;
}

function onDocumentClick (e) {
	if (e.metaKey || e.ctrlKey) {
		const a = e.target.closest('a');
		if (a && a.matches('#subnav a')) {
			e.stopPropagation();
			e.preventDefault();
			helper.openInBrowser(a.getAttribute('href'));
			return;
		}
	}
	$.trigger(EVENT.document.clicked, e);
}


function windowFocus () {
	document.body.classList.add('window-inactive');
	$.trigger(EVENT.window.focus);
}

function windowBlur () {
	document.body.classList.remove('window-inactive');
	$.trigger(EVENT.window.blur);
}

function init () {
	ipc.on('event', (ev, name) => $.trigger(name));
	ipc.on(EVENT.frame.goto, (ev, url) => $.trigger(EVENT.frame.goto, url));

	document.addEventListener('click', onDocumentClick);

	// don't handle dragging stuff around
	document.addEventListener('dragover', ignoreEvent);
	document.addEventListener('dragleave', ignoreEvent);
	document.addEventListener('dragend', ignoreEvent);
	document.addEventListener('drop', ignoreEvent);

	window.addEventListener('focus', windowFocus);
	window.addEventListener('blur', windowBlur);
}

module.exports = {
	init
};
