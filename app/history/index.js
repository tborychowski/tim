const $ = require('../util');
const DB = require('../db/history');


let el, listEl, isVisible = false, isReady = false;


function hide () {
	isVisible = false;
	el.removeClass('visible');
	setTimeout(() => { el.hide(); }, 400);
}


function show () {
	isVisible = true;
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
	items = items.slice(0, 20);
	listEl.html(items.map(getItemHtml).join(''));
	el[0].style.height = `${items.length * 27 + 20}px`;
}

function onAddressInput (e) {
	DB.find(e.target.value).then(render);
}



function onKeyPress (e) {
	if (e.key === 'Enter' || (e.type === 'click' && e.target.tagName === 'OPTION')) {
		DB.getById(e.target.value).then(item => $.trigger('change-url', item.url));
	}
}

function onKeyDown (e) {
	if (e.key === 'ArrowUp' && listEl[0].selectedIndex === 0) {
		$.trigger('focus-addressbar');
	}
}


function focusResults () {
	if (!isVisible && listEl[0].options.length) show();
	listEl[0].focus();
}


function onDocumentClick (e) {
	if (e && e.target && $(e.target).closest('.history-list')) return;
	hide();
}


function init () {
	if (isReady) return;

	el = $('.history');
	listEl = el.find('.history-list');

	listEl.on('blur', hide);
	listEl.on('keypress', onKeyPress);
	listEl.on('keydown', onKeyDown);
	listEl.on('click', onKeyPress);

	$.on('url-changed', onUrlChanged);
	$.on('address-input', onAddressInput);
	$.on('address-input-end', hide);
	$.on('focus-address-results', focusResults);
	$.on('document-clicked', onDocumentClick);

	isReady = true;
}


module.exports = {
	init
};
