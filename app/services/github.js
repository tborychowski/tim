const GH = require('octonode');
const isDev = require('electron-is-dev');
const $ = require('../util');
const config = require('./config');


const token = config.get('ghToken');
let apiUrl = config.get('baseUrl') + 'api/v3';
let hostname = isDev ? 'api.github.com' : apiUrl.replace('https://', '');
let client = null;



function getUserById (id) {
	if (token) {
		init();
		if (!client) return Promise.resolve(0);
		return new Promise(resolve => {
			client.user(id).info((err, resp) => {
				if (err && isDev) console.error('USER', err);
				if (err) return resolve({ id });
				resolve({ id, name: resp.name });
			});
		});

	}
	return new Promise (resolve => {
		$.get(`${apiUrl}/users/${id}`)
			.then(res => resolve({ id, name: res.name }))
			.catch(() => resolve({ id }));
	});
}


function getNotificationsCount (participating = true) {
	if (isDev) participating = false;
	init();
	if (!client) return Promise.resolve(0);
	return new Promise(resolve => {
		client.me().notifications({ participating }, (err, resp) => {
			if (err && isDev) console.error('NOTIFICATIONS', err);
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
			if (err && isDev) console.error('PR', err);
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
	// return Promise.resolve(mockedProjects);
	init(true);
	if (!client) return Promise.resolve(0);
	return new Promise(resolve => {
		client.repo(config.get('repoToSearch')).projects((err, resp) => {
			if (err && isDev) console.error('PROJECTS', err, resp);
			if (err) return resolve();
			resolve(resp);
		});
	});
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
