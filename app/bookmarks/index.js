'use strict';

var _require = require('../services'),
    config = _require.config,
    EVENT = _require.EVENT,
    bookmarks = _require.bookmarks,
    github = _require.github,
    helper = _require.helper;

var $ = require('../util');

var isReady = false,
    el = void 0,
    reposEl = void 0;

var DEFAULT_REPO_NAME = 'Pages'; // for ungrouped pages
var DEFAULT_PROJECTS_REPO_NAME = 'Projects'; // for ungrouped projects

var issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	project: 'ion-ios-cube-outline',
	page: 'ion-ios-document-outline',
	default: 'ion-ios-document-outline'
};

var statusIconCls = {
	failure: 'ion-md-alert',
	aborted: 'ion-md-alert',
	success: 'ion-md-checkmark-circle',
	progress: 'ion-md-time'
};

function getIssueCls(i) {
	var repo = (i.repo || '').replace(/[\/\.]/g, '-').toLowerCase();
	return i.id ? 'issue-' + repo + '-' + i.id : '';
}

function addBookmark(issue) {
	bookmarks.add(issue).then(refresh);
}

function removeBookmark(issue) {
	bookmarks.remove(issue).then(refresh);
}

function refresh(drawOnly) {
	var promise = bookmarks.get().then(findRepoNames).then(fillIssues);

	if (!drawOnly) {
		// = full refresh
		promise.then(github.checkIssuesForUpdates).then(updateUnread);
	}
}

var throttled = null;
var throttle = function throttle() {
	if (throttled) clearTimeout(throttled);
	throttled = setTimeout(function () {
		throttled = null;
	}, 1000);
};

function onClick(e) {
	e.preventDefault();

	if (throttled) return throttle(); // if clicked during quiet time - throttle again
	throttle();

	var target = $(e.target);

	if (target.is('.js-refresh')) return refresh();
	if (target.is('.btn')) return openIssue(target);

	target = target.closest('.build-status');
	if (target.length) return helper.openInBrowser(target.attr('href'));
}

function updateBuildStatus(pr, status) {
	if (!status) return; // statusBox.hide();

	var prBox = $('.' + getIssueCls(pr));
	var statusBox = prBox.find('.build-status');
	var statusIcon = prBox.find('.build-status .icon');
	var progBoxIn = prBox.find('.build-progress-inner');

	// statusBox.show();

	var result = status.result ? status.result : status.progress < 100 ? 'progress' : '';
	if (result) statusBox[0].className = 'build-status ' + result;
	if (statusIconCls[result]) statusIcon[0].className = 'icon ' + statusIconCls[result];
	if (statusBox.length) {
		statusBox[0].title = $.ucfirst(status.result) || 'Open build job';
		statusBox[0].href = pr.buildUrl;
	}
	if (progBoxIn.length) {
		progBoxIn[0].style.width = status.progress + '%';
	}
	if (!status.result) setTimeout(function () {
		return monitorPr(pr);
	}, 10000);
}

function monitorPr(pr) {
	github.getBuildStatus(pr).then(function (status) {
		return updateBuildStatus(pr, status);
	});
}

function getIssueHtml(issue) {
	var statusBox = '';
	if (issue.type === 'pr') {
		monitorPr(issue);
		statusBox = '<a href="#" class="build-status"><i class="icon"></i>' + '<div class="build-progress"><div class="build-progress-inner"></div></div></a>';
	}
	var cls = ['issue-box', getIssueCls(issue), issue.state, 'type-' + issue.type];
	if (issue.unread) cls.push('unread');
	return '<li class="' + cls.join(' ') + '">\n\t\t<i class="issue-icon ' + issueTypeCls[issue.type || 'default'] + '"></i>\n\t\t<a href="' + issue.url + '" class="btn bookmark" title="' + issue.id + '">' + issue.name + '</a>\n\t\t' + statusBox + '\n\t</li>';
}

function getRepoHtml(repo) {
	var issuesHtml = repo.items.map(getIssueHtml).join('');
	var repoName = repo.name.split('/').pop();
	var url = '' + config.get('baseUrl') + repo.name + '/issues';

	if (repoName === DEFAULT_REPO_NAME || repoName === DEFAULT_PROJECTS_REPO_NAME) {
		repoName = '<span class="hdr">' + repoName + '</span>';
	} else repoName = '<a href="' + url + '" class="hdr btn">' + repoName + '</a>';

	return '<div class="repo-box ' + repo.name + '"><h2>' + repoName + '</h2>\n\t\t<ul class="repo-box-issues">' + issuesHtml + '</ul>\n\t</div>';
}

function findRepoNames(issues) {
	return issues.map(function (iss) {
		if (!iss.repo) {
			if (helper.getPageActualTypeFromUrl(iss.url) === 'project') {
				iss.repo = DEFAULT_PROJECTS_REPO_NAME;
				iss.type = 'project';
			} else {
				iss.repo = DEFAULT_REPO_NAME;
				iss.type = 'page';
			}
		}
		return iss;
	});
}

function fillIssues(issues) {
	var remap = {};
	issues.forEach(function (iss) {
		remap[iss.repo] = remap[iss.repo] || { name: iss.repo, items: [] };
		if (iss.url) remap[iss.repo].items.push(iss);
	});

	var html = [];
	for (var repo in remap) {
		html.push(getRepoHtml(remap[repo]));
	}reposEl.html(html.join(''));
	return issues;
}

function updateUnread(issues) {
	var unread = issues.filter(function (i) {
		return i.unread;
	});

	unread.forEach(function (issue) {
		bookmarks.setUnread(issue.id, true);
		$('.' + getIssueCls(issue)).addClass('unread');
	});

	issues.forEach(function (issue) {
		bookmarks.update(issue.id, { name: issue.name, state: issue.state });
		$('.' + getIssueCls(issue)).addClass(issue.state).find('.bookmark').html(issue.name);
	});
	$.trigger(EVENT.section.badge, 'bookmarks', unread.length);
}

function openIssue(iel) {
	var url = iel.attr('href');
	var iBox = iel.closest('.unread');
	if (iBox && iBox.length) iBox.removeClass('unread');
	$.trigger(EVENT.url.change.to, url);
}

function onUrlChanged(wv, issue) {
	if (!issue || !issue.url) return;
	bookmarks.setUnreadByUrl(issue.url, false).then(function (res) {
		if (res) refresh(true);
	});
}

function init() {
	if (isReady) return;

	el = $('.subnav-bookmarks');
	reposEl = el.find('.subnav-section-list');

	refresh();

	el.on('click', onClick);
	$.on(EVENT.bookmark.add, addBookmark);
	$.on(EVENT.bookmark.remove, removeBookmark);
	$.on(EVENT.bookmarks.refresh, refresh);

	$.on(EVENT.url.change.done, onUrlChanged);

	isReady = true;
}

module.exports = {
	init: init
};