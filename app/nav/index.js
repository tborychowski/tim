const $ = require('../util');
const { config, EVENT } = require('../services');

let isReady = false, el, subnav, buttons, sections, currentSection;
let notificationsBadge;


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


function onNotificationsCountUpdate (count) {
	notificationsBadge.toggle(count > 0).html(count);
}


function onClick (e) {
	let target = $(e.target).closest('.nav-btn');
	if (target) {
		e.preventDefault();
		changeSection(target.data('go'));
	}
}


function init () {
	if (isReady) return;

	el = $('#nav');
	buttons = el.find('.nav-btn');
	subnav = $('#subnav');
	sections = subnav.find('.subnav-section');
	notificationsBadge = el.find('.nav-notifications .badge');

	el.on('click', onClick);

	const sect = config.get('state.section');
	if (sect) changeSection(sect);

	$.on(EVENT.notifications.count, onNotificationsCountUpdate);
	$.on(EVENT.section.refresh, refreshSection);

	isReady = true;
}


module.exports = {
	init
};
