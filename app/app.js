const header = require('./app/header');
header.init();

const frame = require('./app/frame');
frame.init();

const sidebar = require('./app/sidebar');
sidebar.init();



require('electron').ipcRenderer.on('open-settings', () => {
	console.log('settings!!!!');
});


// window.addEventListener('blur', () => document.body.classList.add('window-inactive'));
// window.addEventListener('focus', () => document.body.classList.remove('window-inactive'));
