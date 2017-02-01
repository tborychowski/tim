const $ = require('../util');
const starsDB = require('../db/stars');
const Config = require('electron-config');
const config = new Config();

let isReady = false, el, reposEl;
const issueTypes = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	default: 'ion-ios-star-outline',
};

const DEFAULT_REPO_NAME = 'Pages';



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
		<i class="${issueTypes[issue.type || 'default']}"></i>
		<a href="${issue.url}" class="btn" title="${issue.id}">${issue.name}</a>
		<em>${issue.id}</em>
	</li>`;
}


function getRepoHtml (repo) {
	const issuesHtml = repo.items.map(getIssueHtml).join('');
	let repoName = repo.name.split('/').pop();
	const url = `${config.get('baseUrl')}${repo.name}/issues`;

	if (repoName === DEFAULT_REPO_NAME) repoName = `<span class="hdr">${repoName}</span>`;
	else repoName = `<a href="${url}" class="hdr btn">${repoName}</a>`;

	return `<div class="repo-box ${repo.name}"><h2>${repoName}</h2>
		<ul class="repo-box-issues">${issuesHtml}</ul>
	</div>`;
}

function fillIssues (issues) {
	const remap = {};
	issues.forEach(iss => {
		const repo = iss.repo || DEFAULT_REPO_NAME;
		remap[repo] = remap[repo] || { name: repo, items: [] };
		if (iss.url) remap[repo].items.push(iss);
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
	$.on('add-bookmark', starIssue);
	$.on('remove-bookmark', unstarIssue);

	isReady = true;
}


module.exports = {
	init
};
