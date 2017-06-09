const Ractive = require('ractive');
const $ = require('../util');
const { config, EVENT } = require('../services');

const radiusSize = 11;

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
				<svg width="100%" height="100%"><path stroke-width="${radiusSize * 2}" d="{{arc(update.progress)}}" fill="none" stroke="rgba(150,255,70,0.2)" /></svg>
		</a>
		<a href="#" on-click="onClick" class="nav-btn nav-settings" title="Open preferences"><i class="icon"></i></a>
	</div>
`;


const data = {
	activeSection: '',
	buttons: [
		{ id: 'notifications', title: 'Notifications (1)', badge: 0 },
		{ id: 'bookmarks', title: 'Bookmarks (2)', badge: 0 },
		{ id: 'myissues', title: 'My Issues (3)', badge: 0 },
	],
	update: { show: false, progress: 0 },
	arc: perc => describeArc(radiusSize, (perc || 0) * 3.6)
};



function polarToCartesian (x, y, r, deg) {
	const rad = (deg - 90) * Math.PI / 180.0;
	return { x: x + (r * Math.cos(rad)), y: y + (r * Math.sin(rad)) };
}

function describeArc (r, endAngle = 0, startAngle = 0) {
	const x = r * 2;
	const start = polarToCartesian(x, x, r, endAngle);
	const end = polarToCartesian(x, x, r, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
	return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');

}

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

module.exports = new Ractive({ el: '#nav', data, template, oninit, oncomplete });
