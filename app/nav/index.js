const $ = require('../util');
const config = $.getConfig();
const EVENT = require('../db/events');

let isReady = false, el, subnav, buttons, sections;
let notificationsBadge;

function changeSection (sectionName) {
	buttons.removeClass('active');
	sections.removeClass('active');

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

	const currentSection = config.get('state.section');
	if (currentSection) changeSection(currentSection);

	$.on(EVENT.notifications.count, onNotificationsCountUpdate);

	isReady = true;
}


module.exports = {
	init
};
