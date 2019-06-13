const { EVENT } = require('../services');
const $ = require('../util');
const menu = require('electron-context-menu');


function init () {
	menu({
		prepend: (defaultActions, params) => {
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


module.exports = {
	init
};
