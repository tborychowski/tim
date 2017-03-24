const { dialog } = require('electron').remote;


function error (message = '') {
	dialog.showErrorBox('Error', message);
}


function info (message = '', detail = '') {
	dialog.showMessageBox({
		type: 'info',
		title: 'Update',
		message,
		detail,
		buttons: [ 'OK' ],
		defaultId: 0,
	});
}


function question ({ message, detail, buttons}) {
	return new Promise((resolve, reject) => {
		dialog.showMessageBox({
			type: 'question',
			title: 'Update',
			message,
			detail,
			buttons,
			defaultId: 1,
		}, res => { if (res > 0) resolve(res); else reject(); });
	});
}



module.exports = {
	info,
	error,
	question
};
