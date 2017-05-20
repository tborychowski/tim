const Ractive = require('ractive');
const $ = require('../util');
const { config, EVENT } = require('../services');


const template = `
	{{#buttons:id}}
		<a href="#" class="nav-btn nav-{{id}} {{activeSection === id ? 'active' : ''}}" title="{{title}}"
			on-click="@this.onClick(event.original, id)"><i class="icon"></i>
			{{#if (badge > 0)}}<span class="badge">{{badge}}</span>{{/if}}
		</a>
	{{/buttons}}
	<div class="nav-bottom">
		{{#bottomButtons:id}}
			{{#if show !== false}}
				<a href="#" class="nav-btn nav-{{id}}" data-go="{{id}}" title="{{title}}"
					on-click="@this.onClick(event.original, id)"><i class="icon"></i>
				</a>
			{{/if}}
		{{/bottomButtons}}
	</div>
`;

const data = {
	activeSection: 'notifications',
	buttons: {
		notifications: { title: 'Notifications (1)', badge: 0 },
		bookmarks: { title: 'Bookmarks (2)', badge: 0 },
		myissues: { title: 'My Issues (3)', badge: 0 },
		projects: { title: 'Projects (4)', badge: 0 },
	},
	bottomButtons: {
		update: { title: 'Update available. Click to see details.', show: false },
		settings: { title: 'Open preferences' },
	}
};

function refreshSection (id = data.activeSection) {
	if (EVENT[id].refresh) $.trigger(EVENT[id].refresh);
}

function setSectionBadge (id, count) {
	data.buttons[id].badge = count;
}

function changeSection (id) {
	if (id === data.activeSection) return refreshSection(id);
	data.activeSection = id;
	config.set('state.section', id);
	$.trigger(EVENT.section.change, id);
}

function onClick (e, id) {
	e.preventDefault();
	if (id === 'update') return $.trigger(EVENT.updater.nav.clicked);
	if (id === 'settings') return $.trigger(EVENT.settings.show);
	changeSection(id);
}


function onKeyUp (e) {
	const handledKeys = {
		r: refreshSection,
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
	$.on(EVENT.section.refresh, refreshSection);
	$.on(EVENT.section.badge, setSectionBadge);
	$.on(EVENT.document.keyup, onKeyUp);
	$.on(EVENT.updater.nav.show, () => data.bottomButtons.update.show = true);
}

function oncomplete () {
	const lastSection = config.get('state.section');
	if (lastSection) changeSection(lastSection);
}

module.exports = new Ractive({ el: '#nav', magic: true, data, template, onClick, oninit, oncomplete });
