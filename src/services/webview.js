const isDev = require('./isDev');


function injectCSS (wv, path) {
	let css;
	try { css = require('fs').readFileSync(path, 'utf8'); }
	catch (e) { css = ''; }
	if (css) wv.send('injectCss', css);
}

function toggleDevTools () {
	if (!this) return;
	if (this.isDevToolsOpened()) this.closeDevTools();
	else this.openDevTools();
}



function WebView (cfg) {
	if (!(this instanceof WebView)) return new WebView(cfg);

	this.cfg = cfg;
	this.msgHandlers = {
		docReady: () => injectCSS(this.webview[0], this.cfg.css)
	};

	Object.assign(this.msgHandlers, cfg.msgHandlers || {});


	const html = `<webview preload="file://${cfg.js}" class="${cfg.cls}" src="${cfg.url}" partition="persist:github"></webview>`;
	cfg.renderTo.html(html);
	this.webview = cfg.renderTo.find('webview');

	if (this.webview.length) {
		this.webview.on('ipc-message', this.onMsg.bind(this));

		if (isDev) this.webview.on('console-message', e => { console.log('WEBVIEW:', e.message); });
	}

	this.webview.toggleDevTools = toggleDevTools.bind(this.webview[0]);
	return this.webview;
}



WebView.prototype.onMsg = function (ev) {
	const fn = this.msgHandlers[ev.channel];
	if (typeof fn === 'function') fn.apply(this, ev.args);
};


module.exports = WebView;
