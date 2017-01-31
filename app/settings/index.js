const {shell, remote} = require('electron');
const app = remote.app;
const $ = require('../util');
const Config = require('electron-config');
const config = new Config();

let isReady = false, el, formEl, form, isVisible = false;

const clickHandlers = {
	// save: saveSettings,
	cancel: hideSettings,
	folder () { shell.openExternal(`file://${app.getPath('userData')}`); },
};


function onFormChange (v, ov, field) {
	if (field.name === 'places') field.setCustomValidity('');
}


function validate (settings) {
	if (!formEl[0].checkValidity()) return false;
	if (settings.baseUrl.indexOf('http') < 0) settings.baseUrl = `https://${settings.baseUrl}`;
	settings.baseUrl = $.rtrim(settings.baseUrl, '/') + '/';

	if (settings.places) {
		try { JSON.parse(settings.places); }
		catch (e) {
			formEl[0].elements.places.setCustomValidity('Invalid JSON format!');
			return false;
		}
	}
	return settings;
}


function saveSettings (e) {
	const old = config.get();
	const nw = form.get();
	let merged = Object.assign({}, old, nw);
	merged = validate(merged);
	if (e && e.preventDefault) e.preventDefault();
	if (merged === false) return;
	config.set(merged);
	$.trigger('settings-changed');
	hideSettings();
}


function showSettings () {
	if (isVisible) return;
	isVisible = true;
	el[0].style.display = 'block';
	form.set(config.get());
	setTimeout(() => { document.body.classList.add('show-settings'); }, 50);
	document.addEventListener('keyup', onKeyUp);
	form.observe(onFormChange);
	formEl.find('input')[0].focus();
}

function hideSettings () {
	if (!isVisible) return;
	document.body.classList.remove('show-settings');
	form.observeStop();
	setTimeout(() => {
		el[0].style.display = 'none';
		isVisible = false;
		document.removeEventListener('keyup', onKeyUp);
	}, 400);
}


function onMenuClick (target) {
	if (target === 'open-settings') {
		showSettings();
	}
}


function onKeyUp (e) {
	if (e.key === 'Escape') return hideSettings();
}


function onClick (e) {
	let target = $(e.target), to;
	if (target.is('.btn')) to = target.data('go');
	if (to && clickHandlers[to]) {
		e.preventDefault();
		clickHandlers[to]();
	}
}


function init () {
	if (isReady) return;
	// console.log('config file:', `${app.getPath('userData')}/config.json`);
	// console.log('config:', config.get());

	el = $('.settings');
	formEl = el.find('.settings-form');
	form = $.form(formEl[0]);

	el.on('click', onClick);
	formEl.on('submit', saveSettings);

	$.on('menu', onMenuClick);
	$.on('show-settings', showSettings);

	isReady = true;
}


module.exports = {
	init
};


