const Ractive = require('ractive');
const IssueBox = require('../bookmarks/issue-box');
const RepoTitle = require('../bookmarks/repo-title');
const $ = require('../util');
const { EVENT, github, helper } = require('../services');

const template = `
	{{#issues:repo}}
		<div class="repo-box">
			<RepoTitle url="{{repoUrl}}" title="{{repoShortName}}" />
			<ul class="repo-box-issues">
				{{#items}}<IssueBox issue="{{this}}" />{{/items}}
			</ul>
		</div>
	{{/issues}}
`;

const data = {
	issues: {}
};

async function getIssues () {
	const issues = await github.getMyIssues();
	$.trigger(EVENT.section.badge, 'myissues', issues && issues.length || 0);
	return issues;
}

async function refresh () {
	const issues = await getIssues();
	render.call(this, issues);
}

function copleteIssueModel (iss) {
	iss.repo = iss.repository.owner.login + '/' + iss.repository.name;
	iss.url = iss.html_url;
	iss.type = iss.pull_request ? 'pr' : 'issue';
	return iss;
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
	getIssues.call(this);
}

module.exports = new Ractive({
	el: '#subnav .subnav-myissues .subnav-section-list',
	data,
	template,
	oninit,
	components: { RepoTitle, IssueBox },
});
