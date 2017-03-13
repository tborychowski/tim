const $ = require('./app/util');
const init = c => require(`./app/${c}`).init();
const components = [
	// 'spellchecker',
	'nav',
	'bookmarks',
	'notifications',
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

components.forEach(init);


const ipc = require('electron').ipcRenderer;
const { EVENT } = require('./app/services');

ipc.on('event', (ev, name) => $.trigger(name));
ipc.on(EVENT.frame.goto, (ev, url) => $.trigger(EVENT.frame.goto, url));

document.addEventListener('click', e => $.trigger(EVENT.document.clicked, e));
