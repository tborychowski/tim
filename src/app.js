const $ = require('./app/util');
const components = [
	// 'spellchecker',
	'nav',
	'nav/subnav',
	'appheader',
	'addressbar',
	'bookmarks',
	'myissues',

	'notifications',
	'frame',
	'settings',
	// 'history',
	'search',
	'mainmenu',
	'contextmenu',
	'updater',
	'touchbar',
];

components.forEach(c => {
	const m = require(`./app/${c}`);
	if (m && m.init) m.init();
});


const ipc = require('electron').ipcRenderer;
const { EVENT } = require('./app/services');

ipc.on('event', (ev, name) => $.trigger(name));
ipc.on(EVENT.frame.goto, (ev, url) => $.trigger(EVENT.frame.goto, url));

document.addEventListener('click', e => $.trigger(EVENT.document.clicked, e));
document.addEventListener('keyup', e => $.trigger(EVENT.document.keyup, e));

window.addEventListener('blur', () => document.body.classList.add('window-inactive'));
window.addEventListener('focus', () => document.body.classList.remove('window-inactive'));

// don't handle dragging stuff around
document.ondragover = () => { return false; };
document.ondragleave = () => { return false; };
document.ondragend = () => { return false; };
document.ondrop = () => { return false; };
