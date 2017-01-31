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

const places = require('./app/places');
places.init();




const { ipcRenderer } = require('electron');
ipcRenderer.on('menu', (ev, msg) => { $.trigger('menu', msg); });


window.addEventListener('blur', () => {
	document.body.classList.add('window-inactive');
	$.trigger('window-blurred');
});

window.addEventListener('focus', () => {
	document.body.classList.remove('window-inactive');
	$.trigger('window-focused');
});

document.addEventListener('click', e => {
	$.trigger('document-clicked', e);
});
