const {SpellCheckHandler, ContextMenuListener, ContextMenuBuilder} = require('electron-spellchecker');





function init () {
	console.log(12313);
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
	init
};
