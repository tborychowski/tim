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


const { ipcRenderer } = require('electron');
ipcRenderer.on('menu', (ev, msg) => { $.trigger('menu', msg); });


window.addEventListener('blur', () => document.body.classList.add('window-inactive'));
window.addEventListener('focus', () => document.body.classList.remove('window-inactive'));
