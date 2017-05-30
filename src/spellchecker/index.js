const {SpellCheckHandler, ContextMenuListener, ContextMenuBuilder} = require('electron-spellchecker');
const { helper } = require('../services');


function init () {
	window.spellCheckHandler = new SpellCheckHandler();
	window.spellCheckHandler.attachToInput();
	window.spellCheckHandler.switchLanguage('en-US');

	let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
	new ContextMenuListener(info => {
		info.openLinkCb = helper.openInBrowser;
		contextMenuBuilder.showPopupMenu(info);
	});
}


module.exports = {
	init
};
