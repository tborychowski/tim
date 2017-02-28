const $ = require('../util');
const config = $.getConfig();

let isReady = false, el, subnav, buttons, sections;

function changeSection (sectionName) {
	buttons.removeClass('active');
	sections.removeClass('active');

	el.find('.nav-' + sectionName).addClass('active');
	subnav.find('.subnav-' + sectionName).addClass('active');
	config.set('state.section', sectionName);
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

	el.on('click', onClick);

	const currentSection = config.get('state.section');
	if (currentSection) changeSection(currentSection);


	isReady = true;
}


module.exports = {
	init
};
