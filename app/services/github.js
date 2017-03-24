const GH = require('octonode');
const $ = require('../util');
const config = require('./config');
const isDev = require('electron-is-dev');

const token = config.get('ghToken');
let apiUrl = config.get('baseUrl') + 'api/v3';
let hostname = isDev ? 'api.github.com' : apiUrl.replace('https://', '');
let client = null;

const DEBUG = false;


function callGH (api, {id, repo, participating }) {
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
	});
}

function getUserByIdFromPublicApi (id) {
	return new Promise (resolve => {
		$.get(`${apiUrl}/users/${id}`).then(resolve).catch(() => resolve());
	});
}

function getUserById (id) {
	const fn = token ? callGH('user', { id }) : getUserByIdFromPublicApi(id);
	return fn.then(res => res ? { id, name: res.name } : { id });
}

function getNotificationsCount (participating = true) {
	return callGH('notifications', { participating }).then(res => res.length || 0);
}

function getPR (repo, id) {
	return callGH('pr', { repo, id });

}

function getProjects () {
	return callGH('projects', { repo: config.get('repoToSearch') });
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



function init (isPreview) {
	if (!client) {
		if (!token) return;
		client = GH.client(token, { hostname });
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
	getUserById
};
