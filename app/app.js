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
	'main-menu',
	'contextmenu',
	'projects',
];

components.forEach(init);


const ipc = require('electron').ipcRenderer;
const EVENT = require('./app/db/events');
ipc.on('event', (ev, name) => $.trigger(name));
ipc.on(EVENT.frame.goto, (ev, url) => $.trigger(EVENT.frame.goto, url));

document.addEventListener('click', e => $.trigger(EVENT.document.clicked, e));
