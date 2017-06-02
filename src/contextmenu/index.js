// const {SpellCheckHandler, ContextMenuListener, ContextMenuBuilder} = require('electron-spellchecker');
const { EVENT } = require('../services');
const $ = require('../util');
const menu = require('electron-context-menu');


// function initSpellchecker () {
// 	window.spellCheckHandler = new SpellCheckHandler();
// 	window.spellCheckHandler.attachToInput();
// 	window.spellCheckHandler.switchLanguage('en-US');

// 	let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
// 	new ContextMenuListener(info => {
// 		info.openLinkCb = helper.openInBrowser;
// 		contextMenuBuilder.showPopupMenu(info);
// 	});
// }

function initMenu () {
	menu({
		prepend: (params) => {
			const node = document.elementFromPoint(params.x, params.y);
			const isBookmark = node.matches('.bookmark');
			return [
				{
					label: 'Remove Bookmark',
					visible: isBookmark,
					click: () => $.trigger(EVENT.bookmark.remove, { url: params.linkURL })
				}
			];
		}
	});
}


function init () {
	// initSpellchecker();
	initMenu();
}





module.exports = {
	init
};
