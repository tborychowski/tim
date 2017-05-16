'use strict';

var _require = require('electron-spellchecker'),
    SpellCheckHandler = _require.SpellCheckHandler,
    ContextMenuListener = _require.ContextMenuListener,
    ContextMenuBuilder = _require.ContextMenuBuilder;

function init() {
	// window.spellCheckHandler = new SpellCheckHandler();
	// window.spellCheckHandler.attachToInput();

	// // Start off as US English, America #1 (lol)
	// window.spellCheckHandler.switchLanguage('en-US');

	// let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
	// let contextMenuListener = new ContextMenuListener((info) => {
	// 	contextMenuBuilder.showPopupMenu(info);
	// });

}

module.exports = {
	init: init
};