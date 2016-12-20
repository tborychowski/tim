const {shell, clipboard} = require('electron');
const $ = require('../util');
const Config = require('electron-config');
const config = new Config();


let isReady = false, el, starBox, notifToggle;

const clickHandlers = {
	prev: () => { $.trigger('frame/goto', 'prev'); },
	next: () => { $.trigger('frame/goto', 'next'); },
	browser: () => { shell.openExternal(config.get('state.url')); },
	copy: () => { clipboard.writeText(config.get('state.url')); },
	star: () => { $.trigger('issue/star', config.get('state.issue')); starBox.addClass('is-starred'); },
	unstar: () => { $.trigger('issue/unstar', config.get('state.issue')); starBox.removeClass('is-starred'); },
	hideNotifications: () => $.trigger('toggle-notifications', false),
	showNotifications: () => $.trigger('toggle-notifications', true)
};


function toggleNotifications (show) {
	config.set('state.notifications', !!show);
	notifToggle.toggleClass('is-visible', !!show);
}

function onClick (e) {
	let target = $(e.target);
	if (target.is('.header-btn')) {
		e.preventDefault();
		const to = target.data('go');
		if (to && clickHandlers[to]) clickHandlers[to]();
	}
}


function init () {
	if (isReady) return;

	el = $('#header');
	starBox = el.find('.star-box');
	notifToggle = el.find('.notification-toggle');

	el.on('click', onClick);
	$.on('toggle-notifications', toggleNotifications);

	toggleNotifications(config.get('state.notifications'));

	isReady = true;
}


module.exports = {
	init
};
