const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;


function injectCss (ev, css) {
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
}


function reload () {
	document.querySelector('.filter-list .filter-item.selected').click();
}


let throttled = null;
const throttle = () => {
	if (throttled) clearTimeout(throttled);
	throttled = setTimeout(() => { throttled = null; }, 500);
};


function onClick (e) {
	if (throttled) {
		e.preventDefault();
		return throttle();	// clicked during quiet time
	}
	throttle();

	const el = e.target;

	if (el.matches('.notifications-list .notifications-repo-link')) {
		e.preventDefault();
		msg('gotoRepo', el.href);
	}

	else if (el.matches('.notifications-list .js-navigation-open')) {
		e.preventDefault();
		msg('goto', el.href);
	}

	if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
		msg('actionClicked');
	}
}


function onContextMenu (e) {
	if (e.target.matches('a')) msg('showLinkMenu', e.target.getAttribute('href'));
}

function onKeyUp (e) {
	if (document.activeElement.matches('input,select,textarea,iframe')) return;
	const ev = {
		key: e.key,
		keyCode: e.keyCode,
		metaKey: e.metaKey,
		ctrlKey: e.ctrlKey,
		shiftKey: e.shiftKey,
		type: e.type
	};
	msg('keyup', ev);
}


function init () {
	const aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();


	ipc.on('reload', reload);
	ipc.on('injectCss', injectCss);
	document.addEventListener('click', onClick, true);
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('keyup', onKeyUp);

	// don't handle dragging stuff around
	document.ondragover = () => { return false; };
	document.ondragleave = () => { return false; };
	document.ondragend = () => { return false; };
	document.ondrop = () => { return false; };


	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');
}


document.addEventListener('DOMContentLoaded', init);
