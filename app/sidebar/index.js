const $ = require('../util');
const starsDB = require('../db/stars');

let isReady = false, el, reposEl;
const issueTypes = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline'
};

function starIssue (issue) {
	starsDB.add(issue).then(getIssues);
}

function unstarIssue (issue) {
	starsDB.remove(issue).then(getIssues);
}

function getIssues () {
	starsDB.get().then(fillIssues);
}


function onClick (e) {
	let target = $(e.target);
	if (target.is('.btn')) {
		$.trigger('change-url', target[0].getAttribute('href'));
		e.preventDefault();
	}
}


function getIssueHtml (issue) {
	return `<li>
		<i class="${issueTypes[issue.type]}"></i>
		<a href="${issue.repo}/${issue.id}" class="btn">${issue.name}</a>
		<em>${issue.id}</em>
	</li>`;
}


function getRepoHtml (repo) {
	const issuesHtml = repo.items.map(getIssueHtml).join('');
	const repoName = repo.name.split('/').pop();
	return `<div class="repo-box ${repo.name}">
		<h2><a href="${repo.name}/issues" class="btn">${repoName}</a></h2>
		<ul class="repo-box-issues">${issuesHtml}</ul>
	</div>`;
}

function fillIssues (issues) {
	const remap = {};
	issues.forEach(iss => {
		remap[iss.repo] = remap[iss.repo] || { name: iss.repo, items: [] };
		if (iss.id) remap[iss.repo].items.push(iss);
	});

	const html = [];
	for (let repo in remap) html.push(getRepoHtml(remap[repo]));

	reposEl.html(html.join(''));
}



function init () {
	if (isReady) return;

	el = $('#sidebar');
	reposEl = el.find('.repo-list');

	getIssues();

	el.on('click', onClick);
	$.on('issue/star', starIssue);
	$.on('issue/unstar', unstarIssue);

	isReady = true;
}


module.exports = {
	init
};
