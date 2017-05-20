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
				{{#if (name === DEFAULT_REPO_NAME || repoName === DEFAULT_PROJECTS_REPO_NAME) }}
					<span class="hdr">{{repoShortName}}</span>
				{{else}}
					<a href="{{repoUrl}}" class="hdr btn">{{repoShortName}}</a>
				{{/if}}
			</h2>
			<ul class="repo-box-issues">
				{{#items}}
					<li class="issue-box {{cls}} {{state}} type-{{type}} {{unread ? 'unread' : ''}}">
						<i class="issue-icon {{iconCls}}"></i>
						<a href="{{url}}" class="btn bookmark" title="{{id || name}}">{{name}}</a>
						<a href="{{buildUrl}}" class="build-status {{result}}" title="{{buildTitle}}">
							<i class="icon {{resultIcon}}"></i>
							<div class="build-progress">
								<div class="build-progress-inner" style="width:{{progress || 0}}%"></div>
							</div>
						</a>
					</li>
				{{/items}}
			</ul>
		</div>
	{{/bookmarks}}
`;

const data = { bookmarks: {} };






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

function refresh () {
	bookmarks.get()
		.then(issues => issues.map(copleteModel))
		.then(fillIssues)
		// .then(github.checkIssuesForUpdates)
		// .then(issues => issues.map(copleteModel))
		// .then(fillIssues);
}


function copleteModel (iss) {
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
	iss.cls = getIssueCls(iss);
	iss.iconCls = issueTypeCls[iss.type];
	iss.buildTitle = iss.result ? $.ucfirst(iss.result) : 'Open build job';
	iss.resultIcon = statusIconCls[iss.result];
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

function fillIssues (issues) {
	data.bookmarks = remapIssues(issues);
	console.log(data.bookmarks);
	return issues;
}


function oninit () {
	$.on(EVENT.bookmark.add, addBookmark);
	$.on(EVENT.bookmark.remove, removeBookmark);
	$.on(EVENT.bookmarks.refresh, refresh);
	// $.on(EVENT.url.change.done, onUrlChanged);
	refresh();
}

module.exports = new Ractive({ el: '#subnav .subnav-bookmarks .subnav-section-list', magic: true, data, template, oninit });














// let throttled = null;
// const throttle = () => {
// 	if (throttled) clearTimeout(throttled);
// 	throttled = setTimeout(() => { throttled = null; }, 1000);
// };

// function onClick (e) {
// 	e.preventDefault();

// 	if (throttled) return throttle();	// if clicked during quiet time - throttle again
// 	throttle();

// 	let target = $(e.target);

// 	if (target.is('.js-refresh')) return refresh();
// 	if (target.is('.btn')) return openIssue(target);

// 	target = target.closest('.build-status');
// 	if (target.length) return helper.openInBrowser(target.attr('href'));
// }


function updateBuildStatus (pr, status) {
	if (!status) return;// statusBox.hide();

	const prBox = $(`.${getIssueCls(pr)}`);
	const statusBox = prBox.find('.build-status');
	const statusIcon = prBox.find('.build-status .icon');
	const progBoxIn = prBox.find('.build-progress-inner');

	const result = status.result ? status.result : status.progress < 100 ? 'progress' : '';
	if (result) statusBox[0].className = `build-status ${result}`;
	if (statusIconCls[result]) statusIcon[0].className = `icon ${statusIconCls[result]}`;
	if (statusBox.length) {
		statusBox[0].title = $.ucfirst(status.result) || 'Open build job';
		statusBox[0].href = pr.buildUrl;
	}
	if (progBoxIn.length) {
		progBoxIn[0].style.width = status.progress + '%';
	}
	if (!status.result) setTimeout(() => monitorPr(pr), 15000);
}


function monitorPr (pr) {
	github
		.getBuildStatus(pr)
		.then(status => updateBuildStatus(pr, status));
}





// function onUrlChanged (wv, issue) {
// 	if (!issue || !issue.url) return;
// 	bookmarks.setUnreadByUrl(issue.url, false).then(res => {
// 		if (res) refresh(true);
// 	});
// }
