

function getConfig () {
	const Config = require('electron-config');
	return new Config();
}


function injectCSS (webview, path) {
	const readFile = require('fs').readFileSync;
	let css;
	try { css = readFile(path, 'utf8'); }
	catch (e) { css = ''; }
	webview[0].send('injectCss', css);
}



module.exports = {
	injectCSS,
	getConfig
};
