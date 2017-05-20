const $ = require('./app/util');
const components = [
	// 'spellchecker',
	'nav',
	'nav/subnav',
	'bookmarks',
	'notifications',
	'myissues',
	'header',
	'frame',
	'addressbar',
	'settings',
	'history',
	'search',
	'mainmenu',
	'contextmenu',
	'projects',
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
