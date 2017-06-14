const $ = require('../util');
const ipc = require('electron').ipcRenderer;
const { EVENT, helper, config } = require('../services');

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


function onDocumentKeyUp (e) {
	const cmdOrCtrl = e.metaKey || e.ctrlKey;
	const handledKeys = {
		r: () => $.trigger(EVENT.section.refresh, config.get('state.section')),
		b: () => $.trigger(EVENT.bookmark.toggle),
		o: () => helper.openInBrowser(config.get('state.url')),
		p: () => $.trigger(EVENT.address.copy),
		1: () => $.trigger(EVENT.section.change, 'notifications'),
		2: () => $.trigger(EVENT.section.change, 'bookmarks'),
		3: () => $.trigger(EVENT.section.change, 'myissues'),
		4: () => $.trigger(EVENT.section.change, 'projects')
	};
	if (e.key in handledKeys && !cmdOrCtrl) {
		// if real event and focused on these - ignore
		if ($.type(e) === 'keyboardevent' && document.activeElement.matches('input,select,textarea,webview')) return;

		// if not input or event passed from webview:
		handledKeys[e.key]();
	}
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
	document.addEventListener('keyup', e => $.trigger(EVENT.document.keyup, e));

	// don't handle dragging stuff around
	document.addEventListener('dragover', ignoreEvent);
	document.addEventListener('dragleave', ignoreEvent);
	document.addEventListener('dragend', ignoreEvent);
	document.addEventListener('drop', ignoreEvent);

	window.addEventListener('focus', windowFocus);
	window.addEventListener('blur', windowBlur);

	$.on(EVENT.document.keyup, onDocumentKeyUp);
}

module.exports = {
	init
};
