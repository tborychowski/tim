const {clipboard, remote, shell} = require('electron');
const {Menu, getCurrentWindow} = remote;
const Config = require('electron-config');
const config = new Config();
const $ = require('../util');

let isReady = false, URL = '';


const urlTpl = [
	{ label: 'Open in browser', click () { shell.openExternal(URL); }},
	// { type: 'separator' },
	{ label: 'Copy URL', click () { clipboard.writeText(URL); }},
];

const bookmarkTpl = [
	{ label: 'Open in browser', click () { shell.openExternal(URL); }},
	{ label: 'Copy URL', click () { clipboard.writeText(URL); }},
	{ type: 'separator' },
	{ label: 'Remove bookmark', click () { $.trigger('remove-bookmark', { url: URL }); }},
];


function parseLink (link) {
	link = '' + link;
	if (link.indexOf('http') !== 0) link = config.get('baseUrl') + link;
	return link;
}



function showBookmarkMenu (link) {
	URL = parseLink(link);
	Menu.buildFromTemplate(bookmarkTpl).popup(getCurrentWindow());
}


function showLinkMenu (link) {
	URL = parseLink(link);
	Menu.buildFromTemplate(urlTpl).popup(getCurrentWindow());
}


function onContextMenu (e) {
	if (e.target.matches('a.bookmark')) showBookmarkMenu(e.target.getAttribute('href'));
	else if (e.target.matches('a')) showLinkMenu(e.target.getAttribute('href'));
}



function init () {
	if (isReady) return;
	document.addEventListener('contextmenu', onContextMenu);
	$.on('show-bookmark-menu', showBookmarkMenu);
	$.on('show-link-menu', showLinkMenu);
	$.on('show-img-menu', showLinkMenu);	// the same for now
	isReady = true;
}



module.exports = {
	init
};
