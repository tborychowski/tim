const {clipboard, remote, shell} = require('electron');
const {Menu, getCurrentWindow} = remote;
const $ = require('../util');

let isReady = false, URL = '';


const urlTpl = [
	{ label: 'Open in browser', click () { shell.openExternal(URL); }},
	// { type: 'separator' },
	{ label: 'Copy URL', click () { clipboard.writeText(URL); }},
];





function showLinkMenu (link) {
	URL = link;
	Menu.buildFromTemplate(urlTpl).popup(getCurrentWindow());
}


function onContextMenu (e) {
	if (e.target.matches('a')) showLinkMenu(e.target.getAttribute('href'));
}



function init () {
	if (isReady) return;
	document.addEventListener('contextmenu', onContextMenu);
	$.on('show-link-menu', showLinkMenu);
	$.on('show-img-menu', showLinkMenu);	// the same for now
	isReady = true;
}



module.exports = {
	init
};
