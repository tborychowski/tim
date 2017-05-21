const Ractive = require('ractive');
const { config, EVENT, bookmarks, github, helper } = require('../services');
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
				{{#if (projectOrPage) }}
					<span class="hdr">{{repoShortName}}</span>
				{{else}}
					<a href="{{repoUrl}}" class="hdr btn">{{repoShortName}}</a>
				{{/if}}
			</h2>
			<ul class="repo-box-issues">
				{{#items}}
					<li class="issue-box {{cls}} {{state}} type-{{type}} {{unread ? 'unread' : ''}}">
						<i class="issue-icon {{iconCls}}"></i>
						<a href="{{url}}" class="btn bookmark" title="{{id || name}}"
							on-click="@this.openIssue(event.original, this)">{{name}}</a>
						{{#with build}}
							<a href="{{url}}" class="build-status {{result}}" title="{{title}}"
								on-click="@this.openCI(event.original, url)">
								<i class="icon {{icon}}"></i>
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

const data = { bookmarks: {} };



let throttled = null;
const throttle = () => {
	if (throttled) clearTimeout(throttled);
	throttled = setTimeout(() => { throttled = null; }, 1000);
};

function openIssue (e, iss) {
	e.preventDefault();
	if (throttled) return throttle();	// if clicked during quiet time - throttle again
	throttle();
	iss.unread = false;
	$.trigger(EVENT.url.change.to, iss.url);
}

function openCI (e, url) {
	e.preventDefault();
	helper.openInBrowser(url);
}


function updateBuildStatus (pr, status) {
	if (!status) return;
	pr.build.result = status.result ? status.result : status.progress < 100 ? 'progress' : '';
	pr.build.progress = status.progress;
	pr.build.title = pr.build.result ? $.ucfirst(pr.build.result) : 'Open build job';
	pr.build.icon = statusIconCls[pr.build.result];
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

function getIssueCls (i){
	const repo = (i.repo || '').replace(/[\/\.]/g, '-').toLowerCase();
	return i.id ? `issue-${repo}-${i.id}` : '';
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
		iss.projectOrPage = true;
		if (helper.getPageActualTypeFromUrl(iss.url) === 'project') {
			iss.repo = DEFAULT_PROJECTS_REPO_NAME;
			iss.type = 'project';
		}
		else {
			iss.repo = DEFAULT_REPO_NAME;
			iss.type = 'page';
		}
	}
	iss.cls = getIssueCls(iss);
	iss.iconCls = issueTypeCls[iss.type];
	iss.build = iss.build || {};
	iss.build.title = iss.build.result ? $.ucfirst(iss.build.result) : 'Open build job';
	iss.build.icon = statusIconCls[iss.build.result];
	return iss;
}

function remapIssues (issues) {
	const remap = {};
	issues.forEach(iss => {
		remap[iss.repo] = remap[iss.repo] || {
			name: iss.repo,
			repoShortName: iss.repo.split('/').pop(),
			repoUrl: `${config.get('baseUrl')}${iss.repo.name}/issues`,
			items: []
		};
		if (iss.url) remap[iss.repo].items.push(iss);
	});
	return remap;
}

function render (issues) {
	issues = issues.map(copleteIssueModel);
	data.bookmarks = remapIssues(issues);
	return issues;
}


function oninit () {
	$.on(EVENT.bookmark.add, addBookmark);
	$.on(EVENT.bookmark.remove, removeBookmark);
	$.on(EVENT.bookmarks.refresh, refresh);
	$.on(EVENT.url.change.done, onUrlChanged);
	refresh();
}

const Module = new Ractive({
	el: '#subnav .subnav-bookmarks .subnav-section-list',
	magic: true,
	data,
	template,
	oninit,
	openCI,
	openIssue,
});


module.exports = Module;
