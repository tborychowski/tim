'use strict';

var dialog = require('electron').remote.dialog;

function error() {
	var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	dialog.showErrorBox('Error', message);
}

function info(_ref) {
	var _ref$title = _ref.title,
	    title = _ref$title === undefined ? '' : _ref$title,
	    _ref$message = _ref.message,
	    message = _ref$message === undefined ? '' : _ref$message,
	    _ref$detail = _ref.detail,
	    detail = _ref$detail === undefined ? '' : _ref$detail;

	dialog.showMessageBox({
		type: 'info',
		title: title,
		message: message,
		detail: detail,
		buttons: ['OK'],
		defaultId: 0
	});
}

function question(_ref2) {
	var title = _ref2.title,
	    message = _ref2.message,
	    detail = _ref2.detail,
	    buttons = _ref2.buttons;

	return new Promise(function (resolve, reject) {
		dialog.showMessageBox({
			type: 'question',
			title: title,
			message: message,
			detail: detail,
			buttons: buttons,
			defaultId: 1
		}, function (res) {
			if (res > 0) resolve(res);else reject();
		});
	});
}

module.exports = {
	info: info,
	error: error,
	question: question
};