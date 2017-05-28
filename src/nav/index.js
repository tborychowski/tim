const Ractive = require('ractive');
const $ = require('../util');
const { config, EVENT } = require('../services');


const template = `
	{{#buttons}}
		<a href="#" class="nav-btn nav-{{id}}" class-active="{{activeSection === id}}" title="{{title}}" on-click="onClick">
			<i class="icon"></i>
			{{#if (badge > 0)}}<span class="badge">{{badge}}</span>{{/if}}
		</a>
	{{/buttons}}
	<div class="nav-bottom">
		{{#bottomButtons}}
			{{#if show !== false}}
				<a href="#" class="nav-btn nav-{{id}}" data-go="{{id}}" title="{{title}}" on-click="onClick"><i class="icon"></i></a>
			{{/if}}
		{{/bottomButtons}}
	</div>
`;

const data = {
	activeSection: 'notifications',
	buttons: [
		{ id: 'notifications', title: 'Notifications (1)', badge: 0 },
		{ id: 'bookmarks', title: 'Bookmarks (2)', badge: 0 },
		{ id: 'myissues', title: 'My Issues (3)', badge: 0 },
		// { id: 'projects', title: 'Projects (4)', badge: 0 },
	],
	bottomButtons: [
		{ id: 'update', title: 'Update available. Click to see details.', show: false },
		{ id: 'settings', title: 'Open preferences' },
	]
};

function setSectionBadge (id, count) {
	const btn = data.buttons.filter(b => b.id === id)[0];
	btn.badge = count;
}

function changeSection (id) {
	if (id === data.activeSection) return $.trigger(EVENT.section.refresh, id);
	data.activeSection = id;
	config.set('state.section', id);
	$.trigger(EVENT.section.change, id);
}

function onClick (e) {
	const id = e.get().id;
	if (id === 'update') $.trigger(EVENT.updater.nav.clicked);
	else if (id === 'settings') $.trigger(EVENT.settings.show);
	else changeSection(id);
	return false;
}


function onKeyUp (e) {
	const handledKeys = {
		r: () => $.trigger(EVENT.section.refresh, data.activeSection),
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

function oninit () {
	$.on(EVENT.section.badge, setSectionBadge);
	$.on(EVENT.document.keyup, onKeyUp);
	$.on(EVENT.updater.nav.show, () => data.bottomButtons.update.show = true);
	this.on({ onClick });
}

function oncomplete () {
	const lastSection = config.get('state.section');
	if (lastSection) changeSection(lastSection);
}

module.exports = new Ractive({ el: '#nav', magic: true, data, template, oninit, oncomplete });
