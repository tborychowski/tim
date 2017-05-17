'use strict';

var $ = require('./app/util');
// const init = c => require(`./app/${c}`).init();
// const components = [
// 	// 'spellchecker',
// 	'nav',
// 	'bookmarks',
// 	'notifications',
// 	'myissues',
// 	'header',
// 	'frame',
// 	'addressbar',
// 	'settings',
// 	'history',
// 	'search',
// 	'mainmenu',
// 	'contextmenu',
// 	'projects',
// 	'updater',
// 	'touchbar',
// ];

// components.forEach(init);


require('./app/nav/index');
require('./app/nav/subnav');

var ipc = require('electron').ipcRenderer;

var _require = require('./app/services'),
    EVENT = _require.EVENT;

ipc.on('event', function (ev, name) {
  return $.trigger(name);
});
ipc.on(EVENT.frame.goto, function (ev, url) {
  return $.trigger(EVENT.frame.goto, url);
});

document.addEventListener('click', function (e) {
  return $.trigger(EVENT.document.clicked, e);
});
document.addEventListener('keyup', function (e) {
  return $.trigger(EVENT.document.keyup, e);
});