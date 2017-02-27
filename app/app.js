const $ = require('./app/util');

const header = require('./app/header');
header.init();

const frame = require('./app/frame');
frame.init();

const sidebar = require('./app/sidebar');
sidebar.init();

const address = require('./app/addressbar');
address.init();

const settings = require('./app/settings');
settings.init();

const notifications = require('./app/notifications');
notifications.init();

const history = require('./app/history');
history.init();


const contextmenu = require('./app/contextmenu');
contextmenu.init();




const { ipcRenderer } = require('electron');
const EVENT = require('./app/db/events');
ipcRenderer.on('menu', (ev, msg) => { $.trigger(EVENT.menu.click, msg); });

document.addEventListener('click', e => { $.trigger(EVENT.document.clicked, e); });


// currently doesn't work
ipcRenderer.on('swipe', (ev, dir) => { console.log('swipe', dir); });
// this does
ipcRenderer.on('swipe-start', () => { $.trigger(EVENT.swipe.start); });
ipcRenderer.on('swipe-end', () => { $.trigger(EVENT.swipe.end); });
ipcRenderer.on('goto-url', (ev, url) => { $.trigger(EVENT.frame.goto, url); });
