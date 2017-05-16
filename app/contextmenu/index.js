'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require$remote = require('electron').remote,
    Menu = _require$remote.Menu,
    getCurrentWindow = _require$remote.getCurrentWindow;

var _require = require('../services'),
    config = _require.config,
    EVENT = _require.EVENT,
    helper = _require.helper;

var $ = require('../util');
var preview = require('../preview');

var isReady = false,
    URL = '',
    TXT = '';

function getTemplate(type) {
	var templates = {};
	var txt = TXT;

	templates.link = [{ label: 'Preview', click: function click() {
			preview.open(URL);
		}
	}, { type: 'separator' }, { label: 'Copy URL', click: function click() {
			helper.copyToClipboard(URL);
		}
	}, { label: 'Open in browser', click: function click() {
			helper.openInBrowser(URL);
		}
	}];

	templates.img = [].concat(_toConsumableArray(templates.link));

	templates.bookmark = [].concat(_toConsumableArray(templates.link), [{ type: 'separator' }, { label: 'Remove bookmark', click: function click() {
			$.trigger(EVENT.bookmark.remove, { url: URL });
		}
	}]);

	if (txt && txt.length > 15) txt = txt.substr(0, 12) + '...';
	templates.selection = [{ label: 'Look up "' + txt + '"', click: function click() {
			$.trigger(EVENT.frame.lookup, { txt: TXT });
		}
	}, { type: 'separator' }, { role: 'copy' }, { role: 'cut' }, { role: 'paste' }];

	return templates[type];
}

function parseLink(link) {
	link = '' + link;
	if (link.indexOf('http') !== 0) link = config.get('baseUrl') + link;
	return link;
}

function onContextMenu(e) {
	var tar = e.target,
	    url = tar.getAttribute('href');
	var type = void 0;

	if (tar.matches('webview')) return;

	if (tar.matches('a.bookmark')) type = 'bookmark';else if (tar.matches('a')) type = 'link';

	showMenu({ url: url, type: type });
}

function showMenu(_ref) {
	var type = _ref.type,
	    url = _ref.url,
	    txt = _ref.txt;

	if (url) URL = parseLink(url);
	if (txt) TXT = txt.trim();
	var tpl = getTemplate(type);
	if (tpl) Menu.buildFromTemplate(tpl).popup(getCurrentWindow());
}

function showPreview(url) {
	preview.open(parseLink(url));
}

function onDocumentClick(e) {
	if (e.metaKey || e.ctrlKey) {
		var a = e.target.closest('a');
		if (a && a.matches('#subnav a')) {
			showPreview(a.getAttribute('href'));
			e.stopPropagation();
			e.preventDefault();
		}
	}
}

function init() {
	if (isReady) return;
	document.addEventListener('contextmenu', onContextMenu);
	document.addEventListener('click', onDocumentClick);
	$.on(EVENT.contextmenu.show, showMenu);
	$.on(EVENT.preview, showPreview);
	isReady = true;
}

module.exports = {
	init: init
};