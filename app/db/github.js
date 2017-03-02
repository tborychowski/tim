const GH = require('octonode');
const $ = require('../util');
const config = $.getConfig();

let hostname = config.get('baseUrl').replace('https://', '') + 'api/v3';
let client = null;


function init () {
	const token = config.get('ghToken');
	if (!token) return;
	client = GH.client(token, { hostname });
	client.requestDefaults['strictSSL'] = false;
}



function getCount (participating = true) {
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


// function getIssue (repo, id) {
// 	if (!client) init();
// 	return new Promise(resolve => {
// 		if (!client) return resolve();
// 		const iss = client.issue(repo, id);
// 		iss.info((err, resp) => {
// 			if (err) return resolve();
// 			resolve(resp);
// 		});
// 	});
// }

// function getIssueComments (repo, id) {
// 	if (!client) init();
// 	return new Promise(resolve => {
// 		if (!client) return resolve();
// 		const iss = client.issue(repo, id);
// 		iss.comments((err, resp) => {
// 			if (err) return resolve();
// 			resolve(resp);
// 		});
// 	});
// }

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




module.exports = {
	getCount,
	getBuildUrl,
	// getIssue,
	// getIssueComments
	getPR
};
