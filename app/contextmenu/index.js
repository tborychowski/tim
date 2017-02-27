const {clipboard, remote, shell} = require('electron');
const {Menu, getCurrentWindow} = remote;
const Config = require('electron-config');
const config = new Config();
const $ = require('../util');
const EVENT = require('../db/events');

let isReady = false, URL = '';

const templates = {};

templates.link = [
	{ label: 'Open in browser', click () { shell.openExternal(URL); }},
	// { type: 'separator' },
	{ label: 'Copy URL', click () { clipboard.writeText(URL); }},
];

templates.bookmark = [
	...templates.link,
	{ type: 'separator' },
	{ label: 'Remove bookmark', click () { $.trigger(EVENT.bookmark.remove, { url: URL }); }},
];


function parseLink (link) {
	link = '' + link;
	if (link.indexOf('http') !== 0) link = config.get('baseUrl') + link;
	return link;
}



function onContextMenu (e) {
	const tar = e.target, url = tar.getAttribute('href');
	let type;

	if (tar.matches('a.bookmark')) type = 'bookmark';
	else if (tar.matches('a')) type = 'link';

	showMenu({ url, type });
}


function showMenu ({ url, type }) {
	if (url) URL = parseLink(url);
	const tpl = templates[type];
	if (tpl) Menu.buildFromTemplate(tpl).popup(getCurrentWindow());
}


function init () {
	if (isReady) return;
	document.addEventListener('contextmenu', onContextMenu);
	$.on(EVENT.contextmenu.show, showMenu);
	isReady = true;
}



module.exports = {
	init
};
