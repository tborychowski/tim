const {clipboard, remote, nativeImage} = require('electron');
const {shell, app, getCurrentWindow} = remote;
const {exec} = require('child_process');
const config = require('./config');
const isDev = require('electron-is-dev');


const getUserDataFolder = () => app.getPath('userData');
function openInBrowser (url) {
	// shell.openExternal(config.get('state.url'));
	const browser = config.get('browser') || '/Applications/Google Chrome.app';
	const cmd = `open -a "${browser}" "${url}"`;
	exec(cmd, (err, stdout, stderr) => {
		if ((err || stderr) && isDev) console.log(err || stderr);
	});
}

const copyToClipboard = (txt) => clipboard.writeText(txt);
const openFolder = (path) => shell.openExternal(`file://${path}`);
const openSettingsFolder = () => openFolder(getUserDataFolder());

function openChangelog (ver) {
	ver = ver ? `tag/v${ver}` : 'latest';
	openInBrowser(`https://github.com/tborychowski/github-browser/releases/${ver}`);
}

function setBadge (text = 0) {
	text = parseInt(text, 10);
	if (process.platform !== 'win32') app.setBadgeCount(text);
	else {														// yep, this is for windows...
		const win = getCurrentWindow();
		if (text === 0) return win.setOverlayIcon(null, '');
		const canvas = document.createElement('canvas');
		canvas.height = 140;
		canvas.width = 140;
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'red';
		ctx.beginPath();
		ctx.ellipse(70, 70, 70, 70, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.textAlign = 'center';
		ctx.fillStyle = 'white';
		if (text > 99) {
			ctx.font = '75px sans-serif';
			ctx.fillText(text, 70, 98);
		}
		else if (text.length > 9) {
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
}


module.exports = {
	openInBrowser,
	copyToClipboard,
	openFolder,
	openSettingsFolder,
	getUserDataFolder,
	setBadge,
	openChangelog
};
