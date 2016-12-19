const github = require('octonode');
const config = require('../../config.json');

const reposList = config['repos'];
const REPO_LIMIT = 100;

const client = github.client(config.token, { hostname: config.api || null });
client.requestDefaults['strictSSL'] = false;
client.requestDefaults['proxy'] = config.proxy || '';



function getReposByOrg (org) {
	return new Promise((resolve, reject) => {
		client.org(org).repos({ page: 1, per_page: REPO_LIMIT }, (err, res) => {
			if (err) return reject(err);
			res = res.map(repo => repo.name).sort();
			resolve(res);
		});
	});
}


// https://developer.github.com/v3/activity/notifications/#list-your-notifications
function getRepos () {
	return Promise.all(reposList.map(getReposByOrg))
		.then(orgsRepos => orgsRepos.reduce((a, b) => a.concat(b), []));
}





module.exports = {
	getRepos,
};
