'use strict';

var $ = require('../util');

var _require = require('../services'),
    EVENT = _require.EVENT,
    config = _require.config,
    github = _require.github;

var isReady = false,
    el = void 0,
    listEl = void 0;
var issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	default: 'ion-ios-star-outline'
};

function refresh() {
	github.getMyIssues().then(render);
}

function render(issues) {
	if (!issues) return;
	var remap = {};
	issues.forEach(function (iss) {
		var repo = iss.repository.owner.login + '/' + iss.repository.name;
		remap[repo] = remap[repo] || { name: repo, items: [] };
		remap[repo].items.push(iss);
	});
	var html = [];
	for (var repo in remap) {
		html.push(getRepoHtml(remap[repo]));
	}listEl.html(html.join(''));

	$.trigger(EVENT.section.badge, 'myissues', issues.length);

	return issues;
}

function getIssueHtml(issue) {
	var updated = $.prettyDate(issue.updated_at);
	var state = issue.state || '';
	return '<li class="issue-box ' + state + '">\n\t\t<i class="issue-icon ' + issueTypeCls[issue.pull_request ? 'pr' : 'issue'] + '" title="' + state + '"></i>\n\t\t<a href="' + issue.html_url + '" class="btn bookmark" title="' + issue.number + '">' + issue.title + '</a>\n\t\t<div class="issue-date">updated: ' + updated + '</div>\n\t</li>';
}

function getRepoHtml(repo) {
	var issuesHtml = repo.items.map(getIssueHtml).join('');
	var repoName = repo.name.split('/').pop();
	var url = '' + config.get('baseUrl') + repo.name + '/issues';
	repoName = '<a href="' + url + '" class="hdr btn">' + repoName + '</a>';
	return '<div class="repo-box ' + repo.name + '"><h2>' + repoName + '</h2>\n\t\t<ul class="repo-box-issues">' + issuesHtml + '</ul>\n\t</div>';
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
	target = target.closest('.btn');
	if (target.length) return $.trigger(EVENT.url.change.to, target.attr('href'));
}

function init() {
	if (isReady) return;

	el = $('.subnav-myissues');
	listEl = el.find('.subnav-section-list');

	el.on('click', onClick);
	$.on(EVENT.projects.refresh, refresh);

	refresh();

	isReady = true;
}

module.exports = {
	init: init
};