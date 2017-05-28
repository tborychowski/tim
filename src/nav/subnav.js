const Ractive = require('ractive');
const $ = require('../util');
const { EVENT } = require('../services');

const template = `
	{{#sections:id}}
		<section class="subnav-section subnav-{{id}} {{activeSection === id ? 'active' : ''}}">
			<header class="subnav-header">
				{{#if showBackBtn}}
					<button class="btn-back ion-md-arrow-back" title="Back" on-click="goback"></button>
				{{/if}}
				<h1>{{title}}</h1>
				<button class="btn-refresh ion-md-refresh" title="Refresh (r)" on-click="refresh"></button>
			</header>
			<div class="subnav-section-list"></div>
		</section>
	{{/sections}}
`;

const data = {
	activeSection: 'notifications',
	showBackBtn: false,
	sections: {
		notifications: { title: 'Notifications' },
		bookmarks: { title: 'Bookmarks' },
		myissues: { title: 'My Issues' },
		projects: { title: 'Projects' },
	}
};


function refresh () {
	$.trigger(EVENT.section.refresh, data.activeSection);
}

function goback () {
	$.trigger(EVENT.subsection.backbtn.click);
}

function onSectionChange (id) {
	data.activeSection = id;
	this.set('showBackBtn', false);
}

function oninit () {
	$.on(EVENT.section.change, onSectionChange);
	$.on(EVENT.subsection.backbtn.toggle, show => this.set('showBackBtn', show));
	this.on({ refresh, goback });
}


module.exports = new Ractive({ el: '#subnav', magic: true, data, template, oninit });
