const { shell } = require('electron').remote;
const $ = require('../util');
const config = $.getConfig();
const starsDB = require('../db/stars');
const EVENT = require('../db/events');
const jenkins = require('./jenkins');


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
		e.preventDefault();
		$.trigger(EVENT.url.change.to, target[0].getAttribute('href'));
	}
	else if (target.is('.build-status')) {
		e.preventDefault();
		shell.openExternal(target[0].getAttribute('href'));
	}
}


function updateStatus (pr, status) {
	const ionCls = {
		failure: 'ion-md-alert',
		success: 'ion-md-checkmark-circle',
		progress: ''
	};
	const prBox = $(`.pr-${pr.id}`);
	const statusBox = prBox.find('.build-status');
	const progBox = prBox.find('.build-progress');
	const progBoxIn = prBox.find('.build-progress-inner');

	const result = status.result ? status.result : 'progress';
	if (result) statusBox.addClass(result);
	if (ionCls[result]) statusBox.addClass(ionCls[result]);
	statusBox[0].title = status.result;
	statusBox[0].href = pr.buildUrl;

	progBox.toggle(status.progress && status.progress < 100);
	progBoxIn[0].style.width = status.progress + '%';
	if (!status.result) setTimeout(() => { monitorPr(pr); }, 10000);
}


function monitorPr (pr) {
	jenkins.getStatus(pr.buildUrl).then(status => updateStatus(pr, status));
}


function getIssueHtml (issue) {
	if (issue.buildUrl) monitorPr(issue);

	return `<li class="pr-${issue.id}">
		<i class="${issueTypes[issue.type || 'default']}"></i>
		<a href="${issue.url}" class="btn bookmark" title="${issue.id}">${issue.name}</a>
		${issue.buildUrl ? '<a href="#" class="build-status"></a>' : ''}
		${issue.buildUrl ? '<div class="build-progress"><div class="build-progress-inner"></div></div>' : ''}
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

	el = $('.subnav-bookmarks');
	reposEl = el.find('.subnav-section-list');

	getIssues();

	el.on('click', onClick);
	$.on(EVENT.bookmark.add, starIssue);
	$.on(EVENT.bookmark.remove, unstarIssue);

	isReady = true;
}


module.exports = {
	init
};
