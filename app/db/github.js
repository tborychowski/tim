const GH = require('octonode');
const $ = require('../util');
const config = $.getConfig();
const isDev = require('electron-is-dev');

let hostname = config.get('baseUrl').replace('https://', '') + 'api/v3';
let client = null;



/* TODO: use api if token given? */
function getUserById (id) {
	return $.get(`${config.get('baseUrl')}api/v3/users/${id}`)
		.then(res => ({ id, name: res.name }))
		.catch(err => console.log(err));
}


function getNotificationsCount (participating = true) {
	init();
	if (!client) return Promise.resolve(0);
	return new Promise(resolve => {
		client.me().notifications({ participating }, (err, resp) => {
			if (err && isDev) console.log(err);
			if (err) return resolve(0);
			resolve(resp.length);
		});
	});
}


function getPR (repo, id) {
	init();
	if (!client) return Promise.resolve(0);
	return new Promise(resolve => {
		client.pr(repo, id).info((err, resp) => {
			if (err) return resolve();
			resolve(resp);
		});
	});
}


function getBuildUrl (pr) {
	return getPR(pr.repo, pr.id)
		.then(resp => resp && $.get(resp.statuses_url))
		.then(statuses => {
			if (!statuses || !statuses.length) return '';
			const ci_url = config.get('ciUrl');
			if (ci_url) statuses = statuses.filter(s => s.target_url.indexOf(ci_url) > -1);
			const url = statuses && statuses.length ? statuses[0].target_url : '';
			return url;
		});
}


function getProjects () {
	init(true);
	if (!client) return Promise.resolve(0);
	return new Promise(resolve => {
		client.repo(config.get('repoToSearch')).projects((err, resp) => {
			if (err) return resolve();
			resolve(resp);
		});
	});
}


function init (isPreview) {
	if (!client) {
		const token = config.get('ghToken');
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
