const isDev = require('./isDev');
const $ = require('../util');


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

function init () {
	if (this.webview && this.webview.length) this.webview[0].remove();

	const html = `<webview preload="file://${this.cfg.js}" class="${this.cfg.cls || ''}" src="${this.cfg.url}" partition="persist:github"></webview>`;
	this.cfg.renderTo.html(html);
	this.webview = this.cfg.renderTo.find('webview');
	if (this.cfg.skeletonHtml) this.webview.skeleton = $(this.cfg.skeletonHtml).appendTo(this.cfg.renderTo);

	if (this.cfg.events) {
		for (let name in this.cfg.events) this.webview.on(name, this.cfg.events[name].bind(this.cfg.events[name]));
	}

	if (this.webview.length) {
		this.webview.on('ipc-message', this.onMsg.bind(this));
		this.webview.on('crashed', init.bind(this));

		if (isDev) this.webview.on('console-message', e => { console.log('WEBVIEW:', e.message); });
		this.webview.toggleDevTools = toggleDevTools.bind(this.webview[0]);
	}
	return this.webview;
}


function WebView (cfg) {
	if (!(this instanceof WebView)) return new WebView(cfg);
	this.cfg = cfg;
	this.msgHandlers = {
		docReady: () => injectCSS(this.webview[0], this.cfg.css)
	};
	Object.assign(this.msgHandlers, cfg.msgHandlers || {});
	return init.call(this);
}



WebView.prototype.onMsg = function (ev) {
	const fn = this.msgHandlers[ev.channel];
	if (typeof fn === 'function') fn.apply(this, ev.args);
};


module.exports = WebView;
