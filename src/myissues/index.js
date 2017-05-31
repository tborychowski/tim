const Ractive = require('ractive');
const $ = require('../util');
const { EVENT, github, helper } = require('../services');

const issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	default: 'ion-ios-star-outline',
};

const template = `
	{{#issues:repo}}
		<div class="repo-box">
			<h2><a href="{{repoUrl}}" class="hdr" on-click="openRepo">{{repoShortName}}</a></h2>
			<ul class="repo-box-issues">
				{{#items}}
					<li class="issue-box {{state}} type-{{type}}">
						<i class="issue-icon {{issueIcon(this)}}" title="{{state}}"></i>
						<a href="{{url}}" class="btn bookmark" title="{{number}}" on-click="openIssue">{{title}}</a>
					</li>
				{{/items}}
			</ul>
		</div>
	{{/issues}}
`;

const data = {
	issues: {} ,
	issueIcon: iss => issueTypeCls[iss.type]
};

function getIssues () {
	return github.getMyIssues()
		.then(issues => {
			$.trigger(EVENT.section.badge, 'myissues', issues.length);
			return issues;
		});
}

function refresh () {
	getIssues().then(render.bind(this));
}

function copleteIssueModel (iss) {
	iss.repo = iss.repository.owner.login + '/' + iss.repository.name;
	iss.url = iss.html_url;
	iss.type = iss.pull_request ? 'pr' : 'issue';
	return iss;
}


let throttled = null;
const throttle = () => {
	if (throttled) clearTimeout(throttled);
	throttled = setTimeout(() => { throttled = null; }, 1000);
};

function openIssue (e) {
	e.original.preventDefault();
	if (throttled) return throttle();	// if clicked during quiet time - throttle again
	throttle();
	const iss = e.get();
	iss.unread = false;
	$.trigger(EVENT.url.change.to, iss.url);
}

function openRepo (e) {
	$.trigger(EVENT.url.change.to, e.get().repoUrl);
	return false;
}

function render (issues) {
	if (!issues || !issues.length) return;
	issues = issues.map(copleteIssueModel);
	this.set('issues', helper.groupIssues(issues));
}


function sectionRefresh (id) {
	if (id === 'myissues') refresh.call(this, true);
}

function sectionChanged (id) {
	if (id === 'myissues' && !Object.keys(data.issues).length) refresh.call(this);
}


function oninit () {
	$.on(EVENT.section.refresh, sectionRefresh.bind(this));
	$.on(EVENT.section.change, sectionChanged.bind(this));
	this.on({ openIssue, openRepo });
	getIssues.call(this);
}

module.exports = new Ractive({
	el: '#subnav .subnav-myissues .subnav-section-list',
	data,
	template,
	oninit,
});
