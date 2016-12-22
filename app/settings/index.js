const {shell, remote} = require('electron');
const app = remote.app;
const $ = require('../util');
// const Config = require('electron-config');
// const config = new Config();

let isReady = false;



// here be settings dialog

function onMenuClick (target) {
	if (target === 'open-settings') {
		shell.openExternal(`file://${app.getPath('userData')}`);
	}
}



function init () {
	if (isReady) return;
	// console.log('config file:', `${app.getPath('userData')}/config.json`);
	// console.log('config:', config.get());

	$.on('menu', onMenuClick);

	isReady = true;
}


module.exports = {
	init
};


