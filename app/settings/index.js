const {shell, remote} = require('electron');
const app = remote.app;
const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const EVENT = require('../db/events');


let isReady = false, el, formEl, tokenLink, form, isVisible = false;

const clickHandlers = {
	// save: saveSettings,
	cancel: hideSettings,
	folder: () => shell.openExternal(`file://${app.getPath('userData')}`),
	link: target => shell.openExternal(target[0].href),
};


function validate (settings) {
	if (!formEl[0].checkValidity()) return false;
	if (settings.baseUrl.indexOf('http') < 0) settings.baseUrl = `https://${settings.baseUrl}`;
	settings.baseUrl = $.rtrim(settings.baseUrl, '/') + '/';
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
	$.trigger(EVENT.settings.changed);
	hideSettings();
}


function showSettings () {
	if (isVisible) return;
	isVisible = true;
	el[0].style.display = 'block';
	form.set(config.get());
	tokenLink.href = config.get('baseUrl') + 'settings/tokens';
	setTimeout(() => { document.body.classList.add('show-settings'); }, 50);
	document.addEventListener('keyup', onKeyUp);
	formEl.find('input')[0].focus();
}

function hideSettings () {
	if (!isVisible) return;
	document.body.classList.remove('show-settings');
	setTimeout(() => {
		el[0].style.display = 'none';
		isVisible = false;
		document.removeEventListener('keyup', onKeyUp);
	}, 400);
}


function onKeyUp (e) {
	if (e.key === 'Escape') return hideSettings();
}


function onClick (e) {
	let target = $(e.target), to;
	if (target.is('.btn')) to = target.data('go');
	if (to && clickHandlers[to]) {
		e.preventDefault();
		clickHandlers[to](target);
	}
}


function init () {
	if (isReady) return;
	// console.log('config file:', `${app.getPath('userData')}/config.json`);
	// console.log('config:', config.get());

	el = $('.settings');
	tokenLink = el.find('.token-link')[0];
	formEl = el.find('.settings-form');
	form = $.form(formEl[0]);

	el.on('click', onClick);
	formEl.on('submit', saveSettings);

	$.on(EVENT.settings.show, showSettings);

	isReady = true;
}


module.exports = {
	init
};


