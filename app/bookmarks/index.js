const { config, EVENT, bookmarks, github, jenkins, helper } = require('../services');
const $ = require('../util');


let isReady = false, el, reposEl;
const issueTypes = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	default: 'ion-ios-star-outline',
};

const statusIconCls = {
	failure: 'ion-md-alert',
	success: 'ion-md-checkmark-circle',
	progress: 'ion-md-time'
};


const DEFAULT_REPO_NAME = 'Pages';	// for ungrouped pages



function starIssue (issue) {
	bookmarks.add(issue).then(refresh);
}

function unstarIssue (issue) {
	bookmarks.remove(issue).then(refresh);
}

function refresh () {
	bookmarks.get().then(fillIssues);
}


function onClick (e) {
	let target = $(e.target);

	if (target.is('.js-refresh')) {
		e.preventDefault();
		refresh();
	}
	else if (target.is('.btn')) {
		e.preventDefault();
		$.trigger(EVENT.url.change.to, target[0].getAttribute('href'));
	}
	else if (target.closest('.build-status')) {
		e.preventDefault();
		helper.openInBrowser(target.closest('.build-status')[0].getAttribute('href'));
	}
}


function updateBuildStatus (pr, status) {
	const prBox = $(`.pr-${pr.id}`);
	const statusBox = prBox.find('.build-status');
	const statusIcon = prBox.find('.build-status .icon');
	const progBoxIn = prBox.find('.build-progress-inner');

	if (!status) return;// statusBox.hide();
	statusBox.show();

	const result = status.result ? status.result : status.progress < 100 ? 'progress' : '';
	if (result) statusBox.addClass(result);
	if (statusIconCls[result]) statusIcon.addClass(statusIconCls[result]);
	if (statusBox.length) {
		statusBox[0].title = status.result || 'Open build job';
		statusBox[0].href = pr.buildUrl;
	}
	progBoxIn[0].style.width = status.progress + '%';
	if (!status.result) setTimeout(() => { monitorPr(pr); }, 10000);
}


function monitorPr (pr) {
	github
		.getBuildUrl(pr)
		.then(url => {
			if (!url) return;
			pr.buildUrl = url;
			return jenkins.getStatus(url);
		})
		.then(status => updateBuildStatus(pr, status));
}


function getIssueHtml (issue) {
	let statusBox = '';
	if (issue.type === 'pr') {
		monitorPr(issue);
		statusBox = '<a href="#" class="build-status"><i class="icon"></i>' +
			'<div class="build-progress"><div class="build-progress-inner"></div></div></a>';
	}
	const cls = issue.id ? `class="pr-${issue.id}"` : '';
	return `<li ${cls}>
		<i class="${issueTypes[issue.type || 'default']}"></i>
		<a href="${issue.url}" class="btn bookmark" title="${issue.id}">${issue.name}</a>
		${statusBox}
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

	refresh();

	el.on('click', onClick);
	$.on(EVENT.bookmark.add, starIssue);
	$.on(EVENT.bookmark.remove, unstarIssue);
	$.on(EVENT.bookmarks.refresh, refresh);

	isReady = true;
}


module.exports = {
	init
};
