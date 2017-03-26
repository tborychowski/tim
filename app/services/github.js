const octonode = require('octonode');
const $ = require('../util');
const config = require('./config');
const isDev = require('electron-is-dev');

const token = config.get('ghToken');
let apiUrl = config.get('baseUrl') + 'api/v3';
let hostname = isDev ? 'api.github.com' : apiUrl.replace('https://', '');
let client = null;

const DEBUG = false;


function github (api, { id, repo, participating }) {
	const isPreviewApi = (api === 'projects');

	init(isPreviewApi);
	return new Promise(resolve => {
		if (!client) return resolve(null);
		const cb = (err, resp) => {
			if (err && DEBUG) console.error(api.toUpperCase(), err);
			resolve(err ? null : resp);
		};

		if (api === 'notifications') return client.me().notifications({ participating }, cb);
		if (api === 'user') return client.user(id).info(cb);
		if (api === 'pr') return client.pr(repo, id).info(cb);
		if (api === 'projects') return client.repo(repo).projects(cb);
		if (api === 'issue-comments') return client.issue(repo, id).comments(cb);
	});
}

function getUserByIdFromPublicApi (id) {
	return new Promise (resolve => {
		$.get(`${apiUrl}/users/${id}`).then(resolve).catch(() => resolve());
	});
}

function getUserById (id) {
	const fn = token ? github('user', { id }) : getUserByIdFromPublicApi(id);
	return fn.then(res => res ? { id, name: res.name } : { id });
}

function getNotificationsCount (participating = true) {
	return github('notifications', { participating }).then(res => res.length || 0);
}

function getPR (repo, id) {
	return github('pr', { repo, id });
}



function getProjects () {
	return github('projects', { repo: config.get('repoToSearch') });
}


function getCIjobUrl (statuses) {
	if (!statuses || !statuses.length) return '';
	const ci_url = config.get('ciUrl');
	if (ci_url) statuses = statuses.filter(s => s.target_url.indexOf(ci_url) > -1);
	const url = statuses && statuses.length ? statuses[0].target_url : '';
	return url;

}


function getBuildUrl (pr) {
	return getPR(pr.repo, pr.id).then(resp => resp && $.get(resp.statuses_url)).then(getCIjobUrl);
}


function checkIfLastCommentIsUnread (issue, comments) {
	if (!comments || !comments.length) return issue;
	const lastComment = comments.pop();
	issue.lastCommentDate = +new Date(lastComment.updated_at);

	if (issue.updated_at && issue.lastCommentDate > issue.updated_at) issue.unread = true;
	return issue;
}


function checkForUnreadComments (issue) {
	return github('issue-comments', { repo: issue.repo, id: issue.id })
		.then(comments => checkIfLastCommentIsUnread(issue, comments));
}


function checkIssuesForUpdates (issues) {
	issues = issues
		.filter(i => i.type in { pr: 1, issue: 1 })
		.filter(i => !i.unread)								// ignore when already marked as unread
		.map(checkForUnreadComments);

	return Promise.all(issues).then(res => res.filter(i => i.unread));
}


function init (isPreview) {
	if (!client) {
		if (!token) return;
		client = octonode.client(token, { hostname });
	}
	client.requestDefaults.strictSSL = false;

	if (isPreview) client.requestDefaults.headers.Accept = 'application/vnd.github.inertia-preview+json';
	else delete client.requestDefaults.headers.Accept;
}



module.exports = {
	getNotificationsCount,
	getBuildUrl,
	getPR,
	getProjects,
	getUserById,
	checkIssuesForUpdates,
};
