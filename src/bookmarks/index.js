const Ractive = require('ractive');
const { EVENT, bookmarks, github, helper } = require('../services');
const $ = require('../util');

const DEFAULT_REPO_NAME = 'Pages';				// for ungrouped pages
const DEFAULT_PROJECTS_REPO_NAME = 'Projects';	// for ungrouped projects
const issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	project: 'ion-ios-cube-outline',
	page: 'ion-ios-document-outline',
	default: 'ion-ios-document-outline',
};

const statusIconCls = {
	failure: 'ion-md-alert',
	aborted: 'ion-md-alert',
	success: 'ion-md-checkmark-circle',
	progress: 'ion-md-time'
};


const template = `
	{{#bookmarks:repo}}
		<div class="repo-box">
			<h2>
				{{#if hasUrl }}
					<span class="hdr">{{repoShortName}}</span>
				{{else}}
					<a href="{{repoUrl}}" class="hdr" on-click="openRepo">{{repoShortName}}</a>
				{{/if}}
			</h2>
			<ul class="repo-box-issues">
				{{#items}}
					<li class="issue-box {{issueCls(this)}} {{state}} type-{{type}} {{unread ? 'unread' : ''}}">
						<i class="issue-icon {{issueIcon(this)}}"></i>
						<a href="{{url}}" class="btn bookmark" title="{{id || name}}" on-click="openIssue">{{name}}</a>
						{{#with build}}
							<a href="{{url}}" class="build-status {{result}}" title="{{buildTitle(result)}}" on-click="openCI">
								<i class="icon {{buildIcon(result)}}"></i>
								<div class="build-progress">
									<div class="build-progress-inner" style="width:{{progress || 0}}%"></div>
								</div>
							</a>
						{{/with}}
					</li>
				{{/items}}
			</ul>
		</div>
	{{/bookmarks}}
`;

const data = {
	bookmarks: {} ,
	issueCls: iss => {
		const repo = (iss.repo || '').replace(/[\/\.]/g, '-').toLowerCase();
		return iss.id ? `issue-${repo}-${iss.id}` : '';
	},
	issueIcon: iss => issueTypeCls[iss.type],
	buildIcon: result => statusIconCls[result],
	buildTitle: result => result ? $.ucfirst(result) : 'Open build job',
};



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

function openCI (e) {
	const url = e.get().url;
	if (url) helper.openInBrowser(url);
	return false;
}

function openRepo (e) {
	$.trigger(EVENT.url.change.to, e.get().repoUrl);
	return false;
}

function updateBuildStatus (pr, status) {
	if (!status) return;
	pr.build.result = status.result ? status.result : status.progress < 100 ? 'progress' : '';
	pr.build.progress = status.progress;
	pr.build.url = status.url;

	const idx = data.bookmarks[pr.repo].items.indexOf(pr);
	Module.update(`bookmarks.${pr.repo}.items[${idx}].build`);

	if (!status.result) setTimeout(() => monitorPr(pr), 15000);
}


function monitorPr (pr) {
	github.getBuildStatus(pr).then(status => updateBuildStatus(pr, status));
}

function checkBuilds (issues) {
	issues.filter(iss => iss.type === 'pr').forEach(monitorPr);
}


function addBookmark (issue) {
	bookmarks.add(issue).then(refresh);
}

function removeBookmark (issue) {
	bookmarks.remove(issue).then(refresh);
}


function onUrlChanged (wv, issue) {
	if (!issue || !issue.url) return;
	const repo = data.bookmarks[issue.repo];
	if (repo) {
		const iss = repo.items.filter(i => i.url === issue.url)[0];
		iss.unread = false;
	}
	bookmarks.setUnreadByUrl(issue.url, false);
}


function refresh () {
	bookmarks.get()
		.then(render)
		.then(github.checkIssuesForUpdates)
		.then(render)
		.then(checkBuilds);
}


function copleteIssueModel (iss) {
	if (!iss.repo) {
		if (helper.getPageActualTypeFromUrl(iss.url) === 'project') {
			iss.repo = DEFAULT_PROJECTS_REPO_NAME;
			iss.type = 'project';
		}
		else {
			iss.repo = DEFAULT_REPO_NAME;
			iss.type = 'page';
		}
	}
	iss.build = iss.build || {};
	return iss;
}


function render (issues) {
	issues = issues.map(copleteIssueModel);
	data.bookmarks = helper.groupIssues(issues);
	return issues;
}


function oninit () {
	$.on(EVENT.bookmark.add, addBookmark);
	$.on(EVENT.bookmark.remove, removeBookmark);
	$.on(EVENT.bookmarks.refresh, refresh);
	$.on(EVENT.url.change.done, onUrlChanged);
	this.on({ openRepo, openCI, openIssue });
	refresh();
}

const Module = new Ractive({
	el: '#subnav .subnav-bookmarks .subnav-section-list',
	magic: true,
	data,
	template,
	oninit,
});


module.exports = Module;
