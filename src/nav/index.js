const Ractive = require('ractive');
const $ = require('../util');
const { config, EVENT } = require('../services');


const template = `
	{{#buttons}}
		<a href="#" class="nav-btn nav-{{id}}" class-active="activeSection === id" title="{{title}}" on-click="onClick">
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
	],
	bottomButtons: [
		{ id: 'update', title: 'Update available. Click to see details.', show: false },
		{ id: 'settings', title: 'Open preferences' },
	]
};

function setSectionBadge (id, count) {
	data.buttons.filter(b => b.id === id)[0].badge = count;
	this.set('buttons', data.buttons);
}

function showUpdate () {
	this.set('bottomButtons.update.show', true);
}

function onSectionChange (id) {
	if (id === data.activeSection) return $.trigger(EVENT.section.refresh, id);
	this.set('activeSection', id);
	config.set('state.section', id);
}

function onClick (e) {
	const id = e.get().id;
	if (id === 'update') $.trigger(EVENT.updater.nav.clicked);
	else if (id === 'settings') $.trigger(EVENT.settings.show);
	else $.trigger(EVENT.section.change, id);
	return false;
}


function oninit () {
	$.on(EVENT.section.badge, setSectionBadge.bind(this));
	$.on(EVENT.updater.nav.show, showUpdate.bind(this));
	$.on(EVENT.section.change, onSectionChange.bind(this));
	this.on({ onClick });

	const lastSection = config.get('state.section');
	this.set('activeSection', lastSection);
}

function oncomplete () {
	$.trigger(EVENT.section.change, data.activeSection);
}

module.exports = new Ractive({ el: '#nav', data, template, oninit, oncomplete });
