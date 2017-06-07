const { dialog } = require('electron').remote;


function error (message = '') {
	dialog.showErrorBox('Error', message);
}


function info ({ title = '', message = '', detail = '' }) {
	dialog.showMessageBox({
		type: 'info',
		title,
		message,
		detail,
		buttons: [ 'OK' ],
		defaultId: 0,
	});
}


function question ({ title, message, detail, buttons}) {
	return new Promise(resolve => {
		dialog.showMessageBox({
			type: 'question',
			title,
			message,
			detail,
			buttons,
			defaultId: 1,
		}, res => { resolve(res); });
	});
}



module.exports = {
	info,
	error,
	question
};
