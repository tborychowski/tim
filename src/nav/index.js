const $ = require('../util');
const { config, EVENT } = require('../services');

let isReady = false, el, subnav, buttons, sections, currentSection, btnUpdate;


function refreshSection (section = currentSection) {
	const handlers = {
		notifications: EVENT.notifications.refresh,
		bookmarks: EVENT.bookmarks.refresh,
		projects: EVENT.projects.refresh,
		myissues: EVENT.myissues.refresh
	};
	$.trigger(handlers[section]);
}

function changeSection (sectionName) {
	if (sectionName === currentSection) return refreshSection(sectionName);
	buttons.removeClass('active');
	sections.removeClass('active');
	currentSection = sectionName;

	el.find('.nav-' + sectionName).addClass('active');
	subnav.find('.subnav-' + sectionName).addClass('active');
	config.set('state.section', sectionName);
}

function setSectionBadge (section, count) {
	const badge = el.find(`.nav-${section} .badge`);
	badge.toggle(count > 0).html(count);
}

function onKeyUp (e) {
	const handledKeys = {
		r: refreshSection,
		1: () => changeSection('notifications'),
		2: () => changeSection('bookmarks'),
		3: () => changeSection('myissues'),
		4: () => changeSection('projects')
	};

	if (e.key in handledKeys && !e.metaKey && !e.ctrlKey) {
		// if real event and focused on these - ignore
		if ($.type(e) === 'keyboardevent' && document.activeElement.matches('input,select,textarea,webview')) return;

		// if not input or event passed from webview:
		handledKeys[e.key]();
	}
}

function onClick (e) {
	const target = $(e.target).closest('.nav-btn');
	const go = target.length && target.data('go');
	if (!target || !go) return;
	e.preventDefault();
	e.stopPropagation();
	if (go === 'update') return $.trigger(EVENT.updater.nav.clicked);
	if (go === 'settings') return $.trigger(EVENT.settings.show);
	changeSection(go);
}


function init () {
	if (isReady) return;

	el = $('#nav');
	buttons = el.find('.nav-btn');
	btnUpdate = el.find('.nav-update');
	subnav = $('#subnav');
	sections = subnav.find('.subnav-section');

	el.on('click', onClick);

	const sect = config.get('state.section');
	if (sect) changeSection(sect);

	$.on(EVENT.section.refresh, refreshSection);
	$.on(EVENT.updater.nav.show, () => btnUpdate.show());
	$.on(EVENT.section.badge, setSectionBadge);
	$.on(EVENT.document.keyup, onKeyUp);

	isReady = true;
}


module.exports = {
	init
};
