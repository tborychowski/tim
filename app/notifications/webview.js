'use strict';

var ipc = require('electron').ipcRenderer;
var msg = ipc.sendToHost;

function injectCss(ev, css) {
	var style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
	msg('cssReady');
}

function reload() {
	document.querySelector('.filter-list .filter-item.selected').click();
}

var throttled = null;
var throttle = function throttle() {
	if (throttled) clearTimeout(throttled);
	throttled = setTimeout(function () {
		throttled = null;
	}, 1000);
};

function onClick(e) {
	if (throttled) {
		e.preventDefault();
		return throttle(); // if clicked during quiet time - throttle again
	}
	throttle();

	var el = e.target;

	if (el.matches('.notifications-list .notifications-repo-link')) {
		e.preventDefault();
		msg('gotoRepo', el.href);
	} else if (el.matches('.notifications-list .js-navigation-open')) {
		e.preventDefault();
		msg('goto', el.href);
	}

	if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
		msg('actionClicked');
	}
}

function onContextMenu(e) {
	if (e.target.matches('a')) msg('showLinkMenu', e.target.getAttribute('href'));
}

function onKeyUp(e) {
	if (document.activeElement.matches('input,select,textarea,iframe')) return;
	var ev = {
		key: e.key,
		keyCode: e.keyCode,
		metaKey: e.metaKey,
		ctrlKey: e.ctrlKey,
		shiftKey: e.shiftKey,
		type: e.type
	};
	msg('keyup', ev);
}

function init() {
	var aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();

	ipc.on('reload', reload);
	ipc.on('injectCss', injectCss);
	document.addEventListener('click', onClick, true);
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('keyup', onKeyUp);

	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');
}

document.addEventListener('DOMContentLoaded', init);