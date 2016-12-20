const $ = require('../util');
const starsDB = require('../db/stars');

let isReady = false, el, reposEl;


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
	return `<li><a href="${issue.repo}/${issue.id}" title="${issue.name}" class="btn">
			<em>${issue.id}</em> ${issue.name}</a></li>`;
}


function getRepoHtml (repo) {
	const issuesHtml = repo.items.map(getIssueHtml).join('');
	return `<div class="repo-box ${repo.name}">
		<h2><a href="${repo.name}/issues" class="btn">${repo.name}</a></h2>
		<ul class="repo-issues">${issuesHtml}</ul>
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
