const REQ = require('request-promise-native');
const isDev = require('electron-is-dev');


module.exports = class GitHub {

	constructor (token, host = 'https://api.github.com') {
		this.host = host;
		this.token = token;
		this.user_agent = 'GithubBrowser';
	}

	getOptions (url, qs = {}, fullResp = false) {
		const uri = `${this.host}${url}`;
		const headers = { 'User-Agent': 'GithubBrowser' };
		if (this.token) qs.access_token = this.token;
		if (url.indexOf('projects') > -1) headers.Accept = 'application/vnd.github.inertia-preview+json';

		return { uri, qs, headers, json: true, resolveWithFullResponse: fullResp, strictSSL: false };
	}


	get (url, params, fullResp = false) {
		const options = this.getOptions(url, params, fullResp);
		return REQ(options)
			.then(res => {
				if (!fullResp) return res;
				return { headers: res.headers, body: res.body };
			})
			.catch(err => {
				if (isDev) console.error(url, err);
			});
	}
};
