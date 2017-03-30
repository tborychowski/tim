const $ = require('../util');
const { EVENT, config, github } = require('../services');

let isReady = false, el, listEl;
const issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	default: 'ion-ios-star-outline',
};


function refresh () {
	github.getMyIssues().then(render);
}


function render (issues) {
	if (!issues) return;
	const remap = {};
	issues.forEach(iss => {
		const repo = iss.repository.owner.login + '/' + iss.repository.name;
		remap[repo] = remap[repo] || { name: repo, items: [] };
		remap[repo].items.push(iss);
	});
	const html = [];
	for (let repo in remap) html.push(getRepoHtml(remap[repo]));
	listEl.html(html.join(''));

	$.trigger(EVENT.section.badge, 'myissues', issues.length);

	return issues;
}

function getIssueHtml (issue) {
	const updated = $.prettyDate(issue.updated_at);
	return `<li class="issue-box">
		<i class="${issueTypeCls[issue.pull_request ? 'pr' : 'issue']}"></i>
		<a href="${issue.html_url}" class="btn bookmark" title="${issue.number}">${issue.title}</a>
		<div class="issue-date">updated: ${updated}</div>
	</li>`;

}

function getRepoHtml (repo) {
	const issuesHtml = repo.items.map(getIssueHtml).join('');
	let repoName = repo.name.split('/').pop();
	const url = `${config.get('baseUrl')}${repo.name}/issues`;
	repoName = `<a href="${url}" class="hdr btn">${repoName}</a>`;
	return `<div class="repo-box ${repo.name}"><h2>${repoName}</h2>
		<ul class="repo-box-issues">${issuesHtml}</ul>
	</div>`;
}

function onClick (e) {
	e.preventDefault();

	let target = $(e.target);
	if (target.is('.js-refresh')) return refresh();
	target = target.closest('.btn');
	if (target) return $.trigger(EVENT.url.change.to, target.attr('href'));
}



function init () {
	if (isReady) return;

	el = $('.subnav-myissues');
	listEl = el.find('.subnav-section-list');

	el.on('click', onClick);
	$.on(EVENT.projects.refresh, refresh);

	refresh();

	isReady = true;
}


module.exports = {
	init
};
