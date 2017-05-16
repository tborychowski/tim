'use strict';

var _require = require('electron'),
    clipboard = _require.clipboard,
    remote = _require.remote,
    nativeImage = _require.nativeImage;

var shell = remote.shell,
    app = remote.app,
    getCurrentWindow = remote.getCurrentWindow;

var _require2 = require('child_process'),
    exec = _require2.exec;

var config = require('./config');
var isDev = require('./isDev');

var applicationsPath = function applicationsPath() {
	return {
		darwin: '/Applications/',
		win32: 'C:\\Program Files\\',
		linux: '/usr/bin/'
	}[process.platform];
};

var getOpenBrowserCmd = function getOpenBrowserCmd(browser, url) {
	return {
		darwin: 'open -a "' + browser + '" "' + url + '"',
		win32: '"' + browser + '" "' + url + '"',
		linux: '"' + browser + '" "' + url + '"'
	}[process.platform];
};

function openInBrowser(url) {
	var browser = config.get('browser');
	if (!browser) return shell.openExternal(url);
	exec(getOpenBrowserCmd(browser, url), function (err, stdout, stderr) {
		if ((err || stderr) && isDev) console.log(err || stderr);
	});
}

var getUserDataFolder = function getUserDataFolder() {
	return app.getPath('userData');
};
var copyToClipboard = function copyToClipboard(txt) {
	return clipboard.writeText(txt);
};
var openFolder = function openFolder(path) {
	return shell.openExternal('file://' + path);
};
var openSettingsFolder = function openSettingsFolder() {
	return openFolder(getUserDataFolder());
};
var openChangelog = function openChangelog(ver) {
	return openInBrowser('https://github.com/tborychowski/github-browser/releases/' + (ver ? 'tag/v' + ver : 'latest'));
};

function setBadge() {
	var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

	text = parseInt(text, 10);
	if (process.platform !== 'win32') app.setBadgeCount(text);else {
		// yep, this is for windows...
		var win = getCurrentWindow();
		if (text === 0) return win.setOverlayIcon(null, '');
		var canvas = document.createElement('canvas');
		canvas.height = 140;
		canvas.width = 140;
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.textAlign = 'center';
		ctx.fillStyle = 'white';
		if (text > 99) {
			ctx.font = '75px sans-serif';
			ctx.fillText(text, 70, 98);
		} else if (text.length > 9) {
			ctx.font = '100px sans-serif';
			ctx.fillText(text, 70, 105);
		} else {
			ctx.font = '125px sans-serif';
			ctx.fillText(text, 70, 112);
		}
		var img = nativeImage.createFromDataURL(canvas.toDataURL());
		win.setOverlayIcon(img, text);
	}
}

var pageTypes = [{ reg: /\/issues\/\d+/, type: 'timeline', actualType: 'issue', desc: 'issue' }, { reg: /\/pull\/\d+\/files/, type: 'list', actualType: 'pr-files', desc: 'pr file diff' }, { reg: /\/pull\/\d+\/commits/, type: 'list', actualType: 'pr-commits', desc: 'pr commit list' }, { reg: /\/pull\/\d+/, type: 'timeline', actualType: 'pr', desc: 'pr' }, { reg: /\/issues\/?/, type: 'list', actualType: 'issues', desc: 'issue list' }, { reg: /\/pulls/, type: 'list', actualType: 'pr-list', desc: 'pr list' }, { reg: /\/blob\//, type: 'list', actualType: 'file', desc: 'single file view' }, { reg: /\/projects\/\d+/, type: 'list', actualType: 'project', desc: 'project board' }];

function getPageTypeFromUrl() {
	var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	url = url.split(/[?#]/)[0];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = pageTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _step$value = _step.value,
			    reg = _step$value.reg,
			    type = _step$value.type;
			if (reg.test(url)) return type;
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return 'timeline';
}

function getPageActualTypeFromUrl() {
	var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	url = url.split(/[?#]/)[0];
	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = pageTypes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var _step2$value = _step2.value,
			    reg = _step2$value.reg,
			    actualType = _step2$value.actualType;
			if (reg.test(url)) return actualType;
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2.return) {
				_iterator2.return();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}
}

module.exports = {
	openInBrowser: openInBrowser,
	copyToClipboard: copyToClipboard,
	openFolder: openFolder,
	openSettingsFolder: openSettingsFolder,
	getUserDataFolder: getUserDataFolder,
	setBadge: setBadge,
	openChangelog: openChangelog,
	getPageTypeFromUrl: getPageTypeFromUrl,
	getPageActualTypeFromUrl: getPageActualTypeFromUrl,
	applicationsPath: applicationsPath
};