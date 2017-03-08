const {clipboard, remote, shell} = require('electron');
const {Menu, getCurrentWindow} = remote;
const $ = require('../util');
const config = $.getConfig();
const preview = require('../preview');
const EVENT = require('../db/events');

let isReady = false, URL = '', TXT = '';


function getTemplate (type) {
	const templates = {};
	let txt = TXT;

	templates.link = [
		{ label: 'Preview', click () { preview.open(URL); }},
		{ type: 'separator' },
		{ label: 'Copy URL', click () { clipboard.writeText(URL); }},
		{ label: 'Open in browser', click () { shell.openExternal(URL); }},
	];

	templates.img = [
		...templates.link,
	];

	templates.bookmark = [
		...templates.link,
		{ type: 'separator' },
		{ label: 'Remove bookmark', click () { $.trigger(EVENT.bookmark.remove, { url: URL }); }},
	];


	if (txt && txt.length > 15) txt = txt.substr(0, 12) + '...';
	templates.selection = [
		{ label: `Look up "${txt}"`, click () { $.trigger(EVENT.frame.lookup, { txt: TXT }); }},
		{ type: 'separator' },
		{ role: 'copy' },
		{ role: 'cut' },
		{ role: 'paste' }
	];

	return templates[type];
}



function parseLink (link) {
	link = '' + link;
	if (link.indexOf('http') !== 0) link = config.get('baseUrl') + link;
	return link;
}



function onContextMenu (e) {
	const tar = e.target, url = tar.getAttribute('href');
	let type;

	if (tar.matches('webview')) return;

	if (tar.matches('a.bookmark')) type = 'bookmark';
	else if (tar.matches('a')) type = 'link';

	showMenu({ url, type });
}


function showMenu ({ type, url, txt }) {
	if (url) URL = parseLink(url);
	if (txt) TXT = txt.trim();
	const tpl = getTemplate(type);
	if (tpl) Menu.buildFromTemplate(tpl).popup(getCurrentWindow());
}


function showPreview (url) {
	preview.open(parseLink(url));
}


function onDocumentClick (e) {
	if (e.metaKey || e.ctrlKey) {
		const a = e.target.closest('a');
		if (a && a.matches('#subnav a')) {
			showPreview(a.getAttribute('href'));
			e.stopPropagation();
			e.preventDefault();
		}
	}
}


function init () {
	if (isReady) return;
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('click', onDocumentClick);
	$.on(EVENT.contextmenu.show, showMenu);
	$.on(EVENT.preview, showPreview);
	isReady = true;
}



module.exports = {
	init
};
