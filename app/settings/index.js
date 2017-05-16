'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var dialog = require('electron').remote.dialog;

var _require = require('../services'),
    config = _require.config,
    EVENT = _require.EVENT,
    helper = _require.helper;

var $ = require('../util');

var isReady = false,
    el = void 0,
    formEl = void 0,
    tokenLink = void 0,
    form = void 0,
    isVisible = false;

var clickHandlers = {
	cancel: hideSettings,
	folder: function folder() {
		return helper.openSettingsFolder();
	},
	link: function link(target) {
		return helper.openInBrowser(target[0].href);
	},
	findBrowser: findBrowser
};

function findBrowser() {
	var defaultPath = helper.applicationsPath();
	var opts = { title: 'Select browser', buttonLabel: 'Select', defaultPath: defaultPath, properties: ['openFile'] };
	var cb = function cb(_ref) {
		var _ref2 = _slicedToArray(_ref, 1),
		    browser = _ref2[0];

		return form.set({ browser: browser });
	};
	dialog.showOpenDialog(opts, cb);
}

function validate(settings) {
	if (!formEl[0].checkValidity()) return false;
	if (settings.baseUrl.indexOf('http') < 0) settings.baseUrl = 'https://' + settings.baseUrl;
	settings.baseUrl = $.rtrim(settings.baseUrl, '/') + '/';
	return settings;
}

function saveSettings(e) {
	var old = config.get();
	var nw = form.get();
	var merged = Object.assign({}, old, nw);
	merged = validate(merged);
	if (e && e.preventDefault) e.preventDefault();
	if (merged === false) return;
	config.set(merged);
	$.trigger(EVENT.settings.changed);
	hideSettings();
}

function showSettings() {
	if (isVisible) return;
	isVisible = true;
	el[0].style.display = 'block';
	form.set(config.get());
	tokenLink.href = config.get('baseUrl') + 'settings/tokens';
	setTimeout(function () {
		document.body.classList.add('show-settings');
	}, 50);
	document.addEventListener('keyup', onKeyUp);
	formEl.find('input')[0].focus();
}

function hideSettings() {
	if (!isVisible) return;
	document.body.classList.remove('show-settings');
	setTimeout(function () {
		el[0].style.display = 'none';
		isVisible = false;
		document.removeEventListener('keyup', onKeyUp);
	}, 400);
}

function onKeyUp(e) {
	if (e.key === 'Escape') return hideSettings();
}

function onClick(e) {
	var target = $(e.target),
	    to = void 0;
	if (target.is('.token-link') && !config.get('baseUrl')) {
		var baseUrl = form.get().baseUrl;
		if (!baseUrl) return e.preventDefault();
		tokenLink.href = $.trim(baseUrl, '/') + '/settings/tokens';
	}
	if (target.is('.btn')) to = target.data('go');
	if (to && clickHandlers[to]) {
		e.preventDefault();
		clickHandlers[to](target);
	}
}

function documentClicked(e) {
	if (e && e.target && e.target.closest('.settings')) return;
	hideSettings();
}

function init() {
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
	init: init
};