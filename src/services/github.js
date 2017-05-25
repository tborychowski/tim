const GitHub = require('./class.gh');
const jenkins = require('./jenkins');
const config = require('./config');
const ci_url = config.get('ciUrl');
const gh = new GitHub();



function github () {
	const baseUrl = config.get('baseUrl');
	const hostname = baseUrl && baseUrl.indexOf('https://github.com') > -1 ? 'https://api.github.com' : baseUrl + 'api/v3';
	gh.setOptions(config.get('ghToken'), hostname);
	return gh.get.apply(gh, arguments);
}


/*** TRANSFORMERS *********************************************************************************/
function getTotalFromNotificationsHeader (headers) {
	let lastPage = '',  total = 0;
	if (headers && headers.link) lastPage = headers.link.split(',').pop();
	if (lastPage.indexOf('rel="last"') > -1) {
		const pages = lastPage.match(/^.*page=(\d+).*$/);
		if (pages && pages.length) total = pages[1];
		total = Math.min(total, 9999);
	}
	return total;
}

function getCItargetUrlFromStatuses (statuses) {
	if (!statuses || !statuses.length || !ci_url) return;
	const status = statuses
		.filter(s => s.target_url)
		.filter(s => s.target_url.indexOf(ci_url) > -1)[0];
	return status && status.target_url || '';
}


function getJenkinsStatus (pr, stat) {
	if (!stat) return;
	const url = getCItargetUrlFromStatuses(stat && stat.statuses);
	if (!url) return { result: stat && stat.state };
	return jenkins.getStatus(url);
}
/**************************************************************************************************/




function getUserById (id) {
	return github(`/users/${id}`).then(res => res ? { id, name: res.name } : { id });
}


function getNotificationsCount (participating = true) {
	return github('/notifications', { participating, per_page: 1 }, true)
		.then(res => res && getTotalFromNotificationsHeader(res.headers));
}


function getProjects () {
	if (!config.get('repoToSearch')) return Promise.resolve([]);
	return github(`/repos/${config.get('repoToSearch')}/projects`);
}

function getMyIssues () {
	return github('/issues', { per_page: 100 });
}

function getIssue (repo, id) {
	return github(`/repos/${repo}/issues/${id}`);
}

function getIssueComments (repo, id, params) {
	return github(`/repos/${repo}/issues/${id}/comments`, params);
}

function getCommitStatuses (repo, sha) {
	if (!sha) return Promise.resolve();
	return github(`/repos/${repo}/commits/${sha}/status`);

}


function getBuildStatus (pr) {
	return github(`/repos/${pr.repo}/pulls/${pr.id}`)
		.then(res => getCommitStatuses(pr.repo, res && res.head && res.head.sha))
		.then(res => getJenkinsStatus(pr, res));
}


function checkForUnreadComments (issue) {
	if (issue.unread) return issue;
	let params = {};
	if (issue.updated_at) params.since = new Date(issue.updated_at).toISOString();
	return getIssueComments(issue.repo, issue.id, params)
		.then(res => {
			let comments = res && res.length ? res : [];
			if (comments.length) {
				const myId = github.user && github.user.id || null;
				if (myId) comments = res.filter(i => i.user.id !== myId);
			}

			if (comments.length) issue.unread = true;
			return issue;
		});
}

function checkIssueState (issue) {
	if (!(issue.type in { pr: 1, issue: 1 })) return Promise.resolve(issue);
	return getIssue(issue.repo, issue.id)
		.then(res => {
			if (res) {
				console.log(res);
				issue.state = res.state;
				issue.name = res.title;
			}
			return issue;
		})
		.then(checkForUnreadComments);
}


function checkIssuesForUpdates (issues) {
	return Promise.all(issues.map(checkIssueState));
}


module.exports = {
	getNotificationsCount,
	getBuildStatus,
	getProjects,
	getUserById,
	checkIssuesForUpdates,
	getMyIssues,
};
