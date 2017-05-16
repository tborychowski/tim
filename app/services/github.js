'use strict';

var GitHub = require('./class.gh');
var jenkins = require('./jenkins');
var config = require('./config');
var ci_url = config.get('ciUrl');
var gh = new GitHub();

function github() {
	var baseUrl = config.get('baseUrl');
	var hostname = baseUrl && baseUrl.indexOf('https://github.com') > -1 ? 'https://api.github.com' : baseUrl + 'api/v3';
	gh.setOptions(config.get('ghToken'), hostname);
	return gh.get.apply(gh, arguments);
}

/*** TRANSFORMERS *********************************************************************************/
function getTotalFromNotificationsHeader(headers) {
	var lastPage = '',
	    total = 0;
	if (headers && headers.link) lastPage = headers.link.split(',').pop();
	if (lastPage.indexOf('rel="last"') > -1) {
		var pages = lastPage.match(/^.*page=(\d+).*$/);
		if (pages && pages.length) total = pages[1];
		total = Math.min(total, 9999);
	}
	return total;
}

function getCItargetUrlFromStatuses(statuses) {
	if (!statuses || !statuses.length || !ci_url) return;
	var status = statuses.filter(function (s) {
		return s.target_url;
	}).filter(function (s) {
		return s.target_url.indexOf(ci_url) > -1;
	})[0];
	return status && status.target_url || '';
}

function getJenkinsStatus(pr, stat) {
	if (!stat) return;
	var url = getCItargetUrlFromStatuses(stat && stat.statuses);
	if (!url) return { result: stat && stat.state };
	pr.buildUrl = url;
	return jenkins.getStatus(url);
}
/**************************************************************************************************/

function getUserById(id) {
	return github('/users/' + id).then(function (res) {
		return res ? { id: id, name: res.name } : { id: id };
	});
}

function getNotificationsCount() {
	var participating = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

	return github('/notifications', { participating: participating, per_page: 1 }, true).then(function (res) {
		return res && getTotalFromNotificationsHeader(res.headers);
	});
}

function getProjects() {
	if (!config.get('repoToSearch')) return Promise.resolve([]);
	return github('/repos/' + config.get('repoToSearch') + '/projects');
}

function getMyIssues() {
	return github('/issues', { per_page: 100 });
}

function getIssue(repo, id) {
	return github('/repos/' + repo + '/issues/' + id);
}

function getIssueComments(repo, id, params) {
	return github('/repos/' + repo + '/issues/' + id + '/comments', params);
}

function getCommitStatuses(repo, sha) {
	if (!sha) return Promise.resolve();
	return github('/repos/' + repo + '/commits/' + sha + '/status');
}

function getBuildStatus(pr) {
	return github('/repos/' + pr.repo + '/pulls/' + pr.id).then(function (res) {
		return getCommitStatuses(pr.repo, res && res.head && res.head.sha);
	}).then(function (res) {
		return getJenkinsStatus(pr, res);
	});
}

function checkForUnreadComments(issue) {
	if (issue.unread) return issue;
	var params = {};
	if (issue.updated_at) params.since = new Date(issue.updated_at).toISOString();
	return getIssueComments(issue.repo, issue.id, params).then(function (res) {
		var comments = res && res.length ? res : [];
		if (comments && res) {
			var myId = github.user && github.user.id || null;
			comments = res.filter(function (i) {
				return i.user.id !== myId;
			});
		}

		//FIXME: github api suddenly ignores since and returns all comments
		var since = new Date(params.since);
		comments = comments.filter(function (c) {
			return new Date(c.updated_at) > since;
		});

		if (comments.length) issue.unread = true;
		return issue;
	});
}

function checkIssueState(issue) {
	return getIssue(issue.repo, issue.id).then(function (res) {
		if (res) {
			issue.state = res.state;
			issue.name = res.title;
		}
		return issue;
	});
}

function checkIssuesForUpdates(issues) {
	var issuesToProcess = issues.filter(function (i) {
		return i.type in { pr: 1, issue: 1 };
	}).map(function (issue) {
		return checkIssueState(issue).then(checkForUnreadComments);
	});
	return Promise.all(issuesToProcess);
}

module.exports = {
	getNotificationsCount: getNotificationsCount,
	getBuildStatus: getBuildStatus,
	getProjects: getProjects,
	getUserById: getUserById,
	checkIssuesForUpdates: checkIssuesForUpdates,
	getMyIssues: getMyIssues
};