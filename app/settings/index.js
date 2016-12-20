const {app} = require('electron').remote;
const Config = require('electron-config');
const config = new Config();

let isReady = false;



// here be settings dialog





function init () {
	if (isReady) return;

	console.log('config file:', `${app.getPath('userData')}/config.json`);
	console.log('config:', config.get());

	isReady = true;
}


module.exports = {
	init
};


