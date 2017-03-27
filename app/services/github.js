const octonode = require('octonode');
const $ = require('../util');
const config = require('./config');
const isDev = require('electron-is-dev');

const token = config.get('ghToken');
let apiUrl = config.get('baseUrl') + 'api/v3';
let hostname = isDev ? 'api.github.com' : apiUrl.replace('https://', '');
let client = null;

const DEBUG = false;


function showError (api, err) {
	if (err && DEBUG) console.error(api, err);
}

function getUserByIdFromPublicApi (id) {
	return new Promise (resolve => {
		$.get(`${apiUrl}/users/${id}`).then(resolve).catch(() => resolve());
	});
}

function getUserByIdFromApi (id) {
	init();
	return new Promise(resolve => {
		if (!client) return resolve(null);
		client.user(id).info((err, res) => {
			showError('USER', err);
			if (err) resolve();
			resolve(res);
		});
	});
}

function getUserById (id) {
	const fn = token ? getUserByIdFromApi : getUserByIdFromPublicApi;
	return fn(id).then(res => res ? { id, name: res.name } : { id });
}



function getNotificationsCount (participating = true) {
	init();
	return new Promise(resolve => {
		if (!client) return resolve();
		client.me().notifications({ participating, per_page: 1 }, (err, res, headers) => {
			showError('NOTIFICATIONS', err);
			if (err || !headers.link) return resolve();
			const lastPage = headers.link.split(',').pop();
			let total = 0;
			if (lastPage.indexOf('rel="last"') > -1) {
				const pages = lastPage.match(/^.*page=(\d+).*$/);
				if (pages && pages.length) total = pages[1];
				total = Math.min(total, 9999);
			}
			resolve(total);
		});
	});
}


function getProjects () {
	init(true);
	return new Promise(resolve => {
		if (!client) return resolve();
		client.repo(config.get('repoToSearch')).projects((err, res) => {
			showError('PROJECTS', err);
			if (err) resolve();
			resolve(res);
		});
	});
}


function getCIjobUrl (statuses) {
	if (!statuses || !statuses.length) return '';
	const ci_url = config.get('ciUrl');
	if (ci_url) statuses = statuses.filter(s => s.target_url.indexOf(ci_url) > -1);
	const url = statuses && statuses.length ? statuses[0].target_url : '';
	return url;

}


function getPR (repo, id) {
	init();
	return new Promise(resolve => {
		if (!client) return resolve();
		client.pr(repo, id).info((err, res) => {
			showError('PR', err);
			if (err) resolve();
			resolve(res);
		});
	});
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
	init();
	return new Promise(resolve => {
		if (!client) return resolve(issue);
		client.issue(issue.repo, issue.id).comments((err, res) => {
			showError('USER', err);
			if (err) resolve(issue);
			resolve(checkIfLastCommentIsUnread(issue, res));
		});
	});
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
