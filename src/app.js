const components = [
	'events',
	'nav',
	'nav/subnav',
	'appheader',
	'addressbar',
	'bookmarks',
	'myissues',

	'notifications',
	'frame',
	'settings',
	'history',
	'mainmenu',
	'updater',
	'touchbar',

	'contextmenu',
];

components.forEach(c => {
	const m = require(`./app/${c}`);
	if (m && m.init) m.init();
});
