const GH = require('octonode');
const $ = require('../util');
const config = $.getConfig();

let hostname = config.get('baseUrl').replace('https://', '') + 'api/v3';
let client = null;


/* TODO: use api if token given? */
function getUserById (id) {
	return $.get(`${config.get('baseUrl')}api/v3/users/${id}`)
		.then(res => ({ id, name: res.name }))
		.catch(err => console.log(err));
}


function getNotificationsCount (participating = true) {
	if (!client) init();
	return new Promise(resolve => {
		if (!client) return resolve(0);
		client.me().notifications({ participating }, (err, resp) => {
			if (err) return resolve(0);
			resolve(resp.length);
		});
	});
}


function getBuildUrl (pr) {
	const CI_URL = config.get('ciUrl');
	return getPR(pr.repo, pr.id)
		.then(resp => resp && $.get(resp.statuses_url))
		.then(statuses => {
			if (!statuses || !statuses.length) return '';
			if (CI_URL) statuses = statuses.filter(s => s.target_url.indexOf(CI_URL) > -1);
			const url = statuses && statuses.length ? statuses[0].target_url : '';
			return url;
		});
}


function getPR (repo, id) {
	if (!client) init();
	return new Promise(resolve => {
		if (!client) return resolve();
		const pr = client.pr(repo, id);
		pr.info((err, resp) => {
			if (err) return resolve();
			resolve(resp);
		});
	});
}


function getProjects () {
	if (!client) init();
	return new Promise(resolve => {
		if (!client) return resolve();
		const repo = client.repo(config.get('repoToSearch'));
		repo.projects((err, resp) => {
			if (err) return resolve();
			resolve(resp);
		});
	});
}


function init () {
	const token = config.get('ghToken');
	if (!token) return;
	client = GH.client(token, { hostname });
	client.requestDefaults.strictSSL = false;
	client.requestDefaults.headers = {
		Accept: 'application/vnd.github.inertia-preview+json'
	};
}



module.exports = {
	getNotificationsCount,
	getBuildUrl,
	getPR,
	getProjects,
	getUserById
};
