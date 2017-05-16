'use strict';

var $ = require('../util');

var _require = require('../services'),
    config = _require.config,
    EVENT = _require.EVENT;

var isReady = false,
    el = void 0,
    subnav = void 0,
    buttons = void 0,
    sections = void 0,
    currentSection = void 0,
    btnUpdate = void 0;

function refreshSection() {
	var section = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : currentSection;

	var handlers = {
		notifications: EVENT.notifications.refresh,
		bookmarks: EVENT.bookmarks.refresh,
		projects: EVENT.projects.refresh,
		myissues: EVENT.myissues.refresh
	};
	$.trigger(handlers[section]);
}

function changeSection(sectionName) {
	if (sectionName === currentSection) return refreshSection(sectionName);
	buttons.removeClass('active');
	sections.removeClass('active');
	currentSection = sectionName;

	el.find('.nav-' + sectionName).addClass('active');
	subnav.find('.subnav-' + sectionName).addClass('active');
	config.set('state.section', sectionName);
}

function setSectionBadge(section, count) {
	var badge = el.find('.nav-' + section + ' .badge');
	badge.toggle(count > 0).html(count);
}

function onKeyUp(e) {
	var handledKeys = {
		r: refreshSection,
		1: function _() {
			return changeSection('notifications');
		},
		2: function _() {
			return changeSection('bookmarks');
		},
		3: function _() {
			return changeSection('myissues');
		},
		4: function _() {
			return changeSection('projects');
		}
	};

	if (e.key in handledKeys && !e.metaKey && !e.ctrlKey) {
		// if real event and focused on these - ignore
		if ($.type(e) === 'keyboardevent' && document.activeElement.matches('input,select,textarea,webview')) return;

		// if not input or event passed from webview:
		handledKeys[e.key]();
	}
}

function onClick(e) {
	var target = $(e.target).closest('.nav-btn');
	var go = target.length && target.data('go');
	if (!target || !go) return;
	e.preventDefault();
	e.stopPropagation();
	if (go === 'update') return $.trigger(EVENT.updater.nav.clicked);
	if (go === 'settings') return $.trigger(EVENT.settings.show);
	changeSection(go);
}

function init() {
	if (isReady) return;

	el = $('#nav');
	buttons = el.find('.nav-btn');
	btnUpdate = el.find('.nav-update');
	subnav = $('#subnav');
	sections = subnav.find('.subnav-section');

	el.on('click', onClick);

	var sect = config.get('state.section');
	if (sect) changeSection(sect);

	$.on(EVENT.section.refresh, refreshSection);
	$.on(EVENT.updater.nav.show, function () {
		return btnUpdate.show();
	});
	$.on(EVENT.section.badge, setSectionBadge);
	$.on(EVENT.document.keyup, onKeyUp);

	isReady = true;
}

module.exports = {
	init: init
};