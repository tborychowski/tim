const {app, dialog} = require('electron').remote;
const { config, EVENT, helper } = require('../services');
const $ = require('../util');


let isReady = false, el, formEl, tokenLink, form, isVisible = false;

const clickHandlers = {
	cancel: hideSettings,
	folder: () => helper.openSettingsFolder(),
	link: target => helper.openInBrowser(target[0].href),
	findBrowser
};


function findBrowser () {
	let defaultPath = ({
		darwin: '/Applications',
		win32: 'C:\\Program Files\\',
		linux: app.getPath('home')
	})[process.platform];

	const opts = {title: 'Select browser', buttonLabel: 'Select', defaultPath, properties: ['openFile']};
	const cb = ([browser]) => form.set({ browser });
	dialog.showOpenDialog(opts, cb);
}

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
	if (target.is('.token-link') && !config.get('baseUrl')) {
		const baseUrl = form.get().baseUrl;
		if (!baseUrl) return e.preventDefault();
		tokenLink.href = $.trim(baseUrl, '/') + '/settings/tokens';
	}
	if (target.is('.btn')) to = target.data('go');
	if (to && clickHandlers[to]) {
		e.preventDefault();
		clickHandlers[to](target);
	}
}

function documentClicked (e) {
	if (e && e.target && e.target.closest('.settings')) return;
	hideSettings();
}

function init () {
	if (isReady) return;
	el = $('.settings');
	tokenLink = el.find('.token-link')[0];
	formEl = el.find('.settings-form');
	form = $.form(formEl[0]);

	el.on('click', onClick);
	formEl.on('submit', saveSettings);

	$.on(EVENT.settings.show, showSettings);
	$.on(EVENT.document.clicked, documentClicked);

	isReady = true;
}


module.exports = {
	init
};
