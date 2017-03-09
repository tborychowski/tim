const $ = require('../util');
const DB = require('../db/history');
const EVENT = require('../db/events');


let el, listEl, isVisible = false, isReady = false;


function hide () {
	if (!isVisible) return;
	isVisible = false;
	el.animate({ opacity: 1 }, { opacity: 0 }).then(el.hide.bind(el));
}


function show () {
	if (isVisible) return;
	isVisible = true;
	el.show().animate({ opacity: 0 }, { opacity: 1 });
}



function onUrlChanged (webview, issue) {
	if (!issue) return;
	issue.visited = new Date();
	DB.add(issue);
}


function getItemHtml (item, i) {
	const repo = (item.repo ? item.repo.split('/').pop() : null);
	const mod = (repo ? ` | ${repo}` : '');
	const selected = (i === 0 ? 'selected="selected"' : '');
	const id = item.id ? `#${item.id} | ` : '';
	return `<option ${selected} value="${item._id}">${id}${item.name}${mod}</option>`;
}


function render (items) {
	if (items.length) show();
	else hide();
	items = items.slice(0, 20);
	listEl.html(items.map(getItemHtml).join(''));
	el[0].style.height = `${items.length * 27 + 20}px`;
}

function onAddressInput (e) {
	const txt = $.trim(e.target.value, '#');
	DB.find(txt).then(render);
}



function onKeyPress (e) {
	if (e.key === 'Enter' || (e.type === 'click' && e.target.tagName === 'OPTION')) {
		DB.getById(e.target.value).then(item => $.trigger(EVENT.url.change.to, item.url));
	}
}

function onKeyDown (e) {
	if (e.key === 'ArrowUp' && listEl[0].selectedIndex === 0) {
		$.trigger(EVENT.address.focus);
	}
	else if (e.key === 'Escape') {
		hide();
		$.trigger(EVENT.address.focus);
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


	$.on(EVENT.url.change.done, onUrlChanged);
	$.on(EVENT.address.input.key, onAddressInput);
	$.on(EVENT.address.input.end, hide);
	$.on(EVENT.history.focus, focusResults);
	$.on(EVENT.document.clicked, onDocumentClick);
	$.on(EVENT.frame.focused, hide);

	isReady = true;
}


module.exports = {
	init
};
