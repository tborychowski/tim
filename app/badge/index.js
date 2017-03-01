const { remote, nativeImage } = require('electron');
const app = remote.app;
const win = remote.getCurrentWindow();

module.exports = (text = 0) => {
	text = '' + (text || '');

	if (process.platform === 'darwin') app.dock.setBadge(text);

	else if (process.platform === 'win32') {
		if (text === '') {
			win.setOverlayIcon(null, '');
			return;
		}

		let canvas = document.createElement('canvas');
		canvas.height = 140;
		canvas.width = 140;
		let ctx = canvas.getContext('2d');
		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.textAlign = 'center';
		ctx.fillStyle = 'white';

		if (text.length > 2) {
			ctx.font = '75px sans-serif';
			ctx.fillText(text, 70, 98);
		}
		else if (text.length > 1) {
			ctx.font = '100px sans-serif';
			ctx.fillText(text, 70, 105);
		}
		else {
			ctx.font = '125px sans-serif';
			ctx.fillText(text, 70, 112);
		}

		let img = nativeImage.createFromDataURL(canvas.toDataURL());
		win.setOverlayIcon(img, text);
	}
};
