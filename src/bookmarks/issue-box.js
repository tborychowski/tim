const Ractive = require('ractive');
const BuildStatus = require('./build-status');
const fade = require('ractive-transitions-fade');
const { EVENT, bookmarks } = require('../services');
const $ = require('../util');
const issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug',
	project: 'ion-ios-cube',
	page: 'ion-ios-document',
	default: 'ion-ios-document',
};



const template = `
	{{#with issue}}
	<li class="issue-box {{issueCls(this)}} {{state}} type-{{type}} {{unread ? 'unread' : ''}}" fade-in-out>
		<i class="issue-icon {{issueIcon(this)}}"></i>
		<a href="{{url}}" class="btn bookmark" title="{{id || name || title}}" on-click="openIssue">{{name || title}}</a>
		{{#if type === 'pr'}}<BuildStatus issue="{{this}}" />{{/if}}
	</li>
	{{/with}}
`;


function data () {
	return {
		issue: {},
		issueIcon: iss => issueTypeCls[iss.type],
		issueCls: iss => {
			const repo = (iss.repo || '').replace(/[/.]/g, '-').toLowerCase();
			const id = iss.id ? iss.id : iss.url.split('/').pop();
			return `issue-${repo}-${id}`;
		}
	};
}


function openIssue (e) {
	e.original.preventDefault();
	if (e.original.metaKey || e.original.ctrlKey) return;
	const iss = e.get();
	if (iss) {
		iss.unread = false;
		bookmarks.setUnreadByUrl(iss.url, false);
		$.trigger(EVENT.url.change.to, iss.url);
	}
}



function oninit () {
	this.on({ openIssue });
}


module.exports = Ractive.extend({
	template,
	data,
	oninit,
	components: { BuildStatus },
	transitions: { fade },
});
