const ipc = require('electron').ipcRenderer;
const msg = ipc.sendToHost;


function injectCss (ev, css) {
	const style = document.createElement('style');
	style.innerHTML = css;
	document.head.appendChild(style);
	msg('cssReady');
}


function reload () {
	document.querySelector('.filter-list .filter-item.selected').click();
}


function onClick (e) {
	const el = e.target;

	if (el.matches('.notifications-list .notifications-repo-link')) {
		e.preventDefault();
		msg('gotoRepo', el.href);
	}

	else if (el.matches('.notifications-list .js-navigation-open')) {
		e.preventDefault();
		msg('goto', el.href);
	}
}


function onContextMenu (e) {
	if (e.target.matches('a')) msg('showLinkMenu', e.target.getAttribute('href'));
}



function init () {
	const aid = document.querySelector('.accessibility-aid');
	if (aid) aid.remove();


	ipc.on('reload', reload);
	ipc.on('injectCss', injectCss);
	document.addEventListener('click', onClick, true);
	document.addEventListener('contextmenu', onContextMenu);


	msg('isLogged', document.body.classList.contains('logged-in'));
	msg('docReady');
}


document.addEventListener('DOMContentLoaded', init);
