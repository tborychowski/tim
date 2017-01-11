const $ = require('../util');
const DB = require('../db/history');


let el, listEl, isReady = false;


function hide () {
	el.removeClass('visible');
	setTimeout(() => { el.hide(); }, 400);
}


function show () {
	el.show();
	setTimeout(() => { el.addClass('visible'); }, 10);
}



function onUrlChanged (webview, issue) {
	if (!issue) return;
	issue.visited = new Date();
	DB.add(issue);
}


function getItemHtml (item, i) {
	let selected = '';
	if (i === 0) selected = 'selected="selected"';
	return `<option ${selected} value="${item._id}">${item.name}</option>`;
}


function render (items) {
	if (items.length) show();
	else hide();
	listEl.html(items.map(getItemHtml).join(''));
}

function onAddressInput (e) {
	DB.find(e.target.value).then(render);
}



function onKeyPress (e) {
	if (e.key === 'Enter' || e.type === 'click') {
		DB.getById(e.target.value).then(item => $.trigger('change-url', item.url));
	}
}


function init () {
	if (isReady) return;

	el = $('.addressbar-results');
	listEl = el.find('.addressbar-results-list');

	listEl.on('blur', hide);
	listEl.on('keypress', onKeyPress);
	listEl.on('click', onKeyPress);

	$.on('url-changed', onUrlChanged);
	$.on('address-input', onAddressInput);
	$.on('address-input-end', hide);
	$.on('focus-address-results', () => { listEl[0].focus(); });

	isReady = true;
}


module.exports = {
	init
};
