const Ractive = require('ractive');
const $ = require('../util');
const { EVENT } = require('../services');

const template = `
	{{#sections:id}}
		<section class="subnav-section subnav-{{id}} {{activeSection === id ? 'active' : ''}}">
			{{#if showBackBtn}}
				<a href="#" class="nav-icon-btn nav-icon-btn-left header-btn js-prev ion-md-arrow-back" title="Back"
					on-click="@this.goBack(event.original)"></a>
			{{/if}}
			<h1>{{title}}</h1>
			<a href="#" class="nav-icon-btn header-btn js-refresh ion-md-refresh" title="Refresh (r)"
				on-click="@this.refresh(event.original)"></a>

			<div class="subnav-section-list"></div>
		</section>
	{{/sections}}
`;

const data = {
	activeSection: 'notifications',
	sections: {
		notifications: { title: 'Notifications', showBackBtn: false },
		bookmarks: { title: 'Bookmarks' },
		myissues: { title: 'My Issues' },
		projects: { title: 'Projects' },
	}
};


function refresh (e) {
	e.preventDefault();
	$.trigger(EVENT.section.refresh);
}

function goBack (e) {
	e.preventDefault();

}


function oninit () {
	$.on(EVENT.section.change, id => data.activeSection = id);
}


module.exports = new Ractive({ el: '#subnav', magic: true, data, template, refresh, goBack, oninit });
