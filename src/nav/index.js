const Ractive = require('ractive');
const $ = require('../util');
const { config, EVENT } = require('../services');
const RadialProgress = require('./radial-progress');

const template = `
	{{#buttons}}
		<a href="#" class="nav-btn nav-{{id}}" class-active="activeSection === id" title="{{title}}" on-click="onClick">
			<i class="icon"></i>
			{{#if (badge > 0)}}<span class="badge">{{badge}}</span>{{/if}}
		</a>
	{{/buttons}}
	<div class="nav-bottom">
		<a href="#" on-click="onClick" class="nav-btn nav-update"
			class-hidden="update.show === false && update.progress === 0"
			class-progress="update.progress > 0"
			title="{{update.progress > 0 ? 'Updating...' : 'Update available. Click to see details.'}}">
				<i class="icon"></i>
				<RadialProgress progress="{{update.progress}}" />
		</a>
		<a href="#" on-click="onClick" class="nav-btn nav-settings" title="Open preferences"><i class="icon"></i></a>
	</div>
`;


const data = {
	activeSection: '',
	buttons: [
		{ id: 'notifications', title: 'Notifications', badge: 0 },
		{ id: 'bookmarks', title: 'Bookmarks', badge: 0 },
		{ id: 'myissues', title: 'My Issues', badge: 0 },
	],
	update: { show: false, progress: 0 },
};

function onUpdaterProgress (progress) {
	if (typeof progress !== 'number') progress = 0;
	this.set('update.progress', progress);
}

function setSectionBadge (id, count) {
	data.buttons.filter(b => b.id === id)[0].badge = count;
	this.set('buttons', data.buttons);
}

function showUpdate () {
	this.set('update.show', true);
}

function onSectionChange (id) {
	if (id === data.activeSection) return $.trigger(EVENT.section.refresh, id);
	this.set('activeSection', id);
	config.set('state.section', id);
}

function onClick (e) {
	if (e.node.matches('.nav-update') && this.get('update.show')) $.trigger(EVENT.updater.nav.clicked);
	else if (e.node.matches('.nav-settings')) $.trigger(EVENT.settings.show);
	else $.trigger(EVENT.section.change, e.get().id);
	return false;
}


function oninit () {
	$.on(EVENT.section.badge, setSectionBadge.bind(this));
	$.on(EVENT.updater.nav.show, showUpdate.bind(this));
	$.on(EVENT.section.change, onSectionChange.bind(this));
	$.on(EVENT.updater.nav.progress, onUpdaterProgress.bind(this));
	this.on({ onClick });
}

function oncomplete () {
	const lastSection = config.get('state.section') || 'notifications';
	$.trigger(EVENT.section.change, lastSection);
}

module.exports = new Ractive({
	el: '#nav',
	data,
	template,
	oninit,
	oncomplete,
	components: { RadialProgress },
});
