const $ = require('../util');
const Config = require('electron-config');
const config = new Config();


let isReady = false, el, btn, isVisible = false, itemCount = 0;


function getPlaceHtml (item) {
	return `<a href="${item.url || '#'}">${item.name || 'noname'}</a>`;
}

function initPlaces () {
	let places;
	try { places = JSON.parse(config.get('places')); }
	catch(e) { places = []; }

	itemCount = places.length;
	if (!itemCount) return;
	btn.show();
	const placesHtml = places.map(getPlaceHtml).join('');
	el.html(placesHtml);
}



function hide () {
	if (!isVisible) return;
	isVisible = false;
	el.animate({ opacity: 1 }, { opacity: 0 }).then(el.hide.bind(el));
}


function show () {
	if (isVisible || !itemCount) return hide();
	el.show().animate({ opacity: 0 }, { opacity: 1 }).then(() => { isVisible = true; });
}



function onDocumentClick (e) {
	const target = e && e.target && $(e.target);
	if (target) {
		if (target.closest('.js-places')) return;
		if (target.closest('.places-popup')) return;
	}
	hide();
}


function onClick (e) {
	let target = $(e.target);
	if (target.is('a')) {
		$.trigger('change-url', target[0].getAttribute('href'));
		e.preventDefault();
		hide();
	}
}



function init () {
	if (isReady) return;

	btn = $('.js-places');
	el = $('.places-popup');

	el.on('click', onClick);


	$.on('settings-changed', initPlaces);
	$.on('show-places', show);
	$.on('document-clicked', onDocumentClick);
	$.on('frame-focused', hide);

	initPlaces();

	isReady = true;
}


module.exports = {
	init
};
