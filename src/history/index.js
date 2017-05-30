const Ractive = require('ractive');
const $ = require('../util');
const { EVENT, history } = require('../services');


const template = `
	<div class="history" class-visible="visible" style-height="{{items.length * 27 + 20}}px">
		<select class="history-list" size="2" tabindex="2"
				on-blur="hide"
				on-keypress="onKeyPress"
				on-keydown="onKeyDown"
				on-click="onKeyPress">
			{{#items:i}}
				<option {{i === 0 ? 'selected="selected"' : ''}} value="{{_id}}">{{text(this)}}</option>
			{{/items}}
		</select>
	</div>
`;


const data = {
	visible: false,
	items: [],
	text: item => {
		const repo = (item.repo ? item.repo.split('/').pop() : null);
		const mod = (repo ? ` | ${repo}` : '');
		const id = item.id ? `#${item.id} | ` : '';
		return `${id}${item.name}${mod}`;
	}
};



function onUrlChanged (webview, issue) {
	if (!issue) return;
	issue.visited = new Date();
	history.add(issue);
}


function hide () {
	if (!data.visible) return;
	$(this.el).animate({ opacity: 1 }, { opacity: 0 }).then(() => {
		this.set('visible', false);
	});
}


function show () {
	if (data.visible) return;
	this.set('visible', true);
	$(this.el).show().animate({ opacity: 0 }, { opacity: 1 });
}

function onAddressInput (e) {
	const txt = $.trim(e.node.value, '#');
	history.find(txt).then(items => {
		items = items.slice(0, 20);
		if (items.length) show.call(this);
		else hide.call(this);
		this.set('items', items);
	});
}


function focusResults () {
	if (!data.visible && data.items.length) show.call(this);
	this.listEl.focus();
}

function onDocumentClick (e) {
	if (e && e.target && $(e.target).closest('.history-list')) return;
	hide.call(this);
}



function onKeyPress (ev) {
	const e = ev.original;
	if (e.key === 'Enter' || (e.type === 'click' && e.target.tagName === 'OPTION')) {
		history.getById(e.target.value).then(item => $.trigger(EVENT.url.change.to, item.url));
	}
}

function onKeyDown (e) {
	const key = e.original.key;
	if (key === 'ArrowUp' && this.listEl.selectedIndex === 0) {
		$.trigger(EVENT.address.focus);
	}
	else if (key === 'Escape') {
		hide.call(this);
		$.trigger(EVENT.address.focus);
	}
}


function onrender () {
	this.listEl = this.el.querySelector('.history-list');
}

function oninit () {
	this.on({ hide, onKeyPress, onKeyDown });
	$.on(EVENT.url.change.done, onUrlChanged);
	$.on(EVENT.address.input.end, hide.bind(this));
	$.on(EVENT.frame.focused, hide.bind(this));
	$.on(EVENT.address.input.key, onAddressInput.bind(this));
	$.on(EVENT.history.focus, focusResults.bind(this));
	$.on(EVENT.document.clicked, onDocumentClick.bind(this));
}


module.exports = new Ractive({
	el: '#history',
	data,
	template,
	oninit,
	onrender,
});
