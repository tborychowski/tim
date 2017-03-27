const $ = require('../util');
const config = require('./config');
const isDev = require('electron-is-dev');
const GH = require('./GH');

const hostname = isDev ? 'https://api.github.com' : config.get('baseUrl') + 'api/v3';
const github = new GH(config.get('ghToken'), hostname);



/*** HELPERS **************************************************************************************/
function getTotalFromNotificationsHeader (headers) {
	const lastPage = headers.link.split(',').pop();
	let total = 0;
	if (lastPage.indexOf('rel="last"') > -1) {
		const pages = lastPage.match(/^.*page=(\d+).*$/);
		if (pages && pages.length) total = pages[1];
		total = Math.min(total, 9999);
	}
	return total;
}

function getCIjobUrl (statuses) {
	if (!statuses || !statuses.length) return '';
	const ci_url = config.get('ciUrl');
	if (ci_url) statuses = statuses.filter(s => s.target_url.indexOf(ci_url) > -1);
	const url = statuses && statuses.length ? statuses[0].target_url : '';
	return url;
}
/*** HELPERS **************************************************************************************/



function getUserById (id) {
	return github.get(`/users/${id}`).then(res => res ? { id, name: res.name } : { id });
}


function getNotificationsCount (participating = true) {
	return github.get('/notifications', { participating, per_page: 1 }, true)
		.then(res => getTotalFromNotificationsHeader(res.headers));
}


function getProjects () {
	return github.get(`/repos/${config.get('repoToSearch')}/projects`);
}


function getPR (repo, id) {
	return github.get(`/repos/${repo}/pulls/${id}`);
}


function getBuildUrl (pr) {
	return getPR(pr.repo, pr.id).then(resp => resp && $.get(resp.statuses_url)).then(getCIjobUrl);
}


function checkForUnreadComments (issue) {
	let params = {};
	if (issue.updated_at) {
		params.since = new Date(issue.updated_at).toISOString();
	}
	return github.get(`/repos/${issue.repo}/issues/${issue.id}/comments`, params)
		.then(res => {
			if (res.length) issue.unread = true;
			return issue;
		});
}


function checkIssuesForUpdates (issues) {
	issues = issues
		.filter(i => i.type in { pr: 1, issue: 1 } && !i.unread) // ignore when already marked as unread
		.map(checkForUnreadComments);
	return Promise.all(issues).then(res => res.filter(i => i.unread));
}


module.exports = {
	getNotificationsCount,
	getBuildUrl,
	getPR,
	getProjects,
	getUserById,
	checkIssuesForUpdates,
};
