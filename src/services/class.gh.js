const REQ = require('request-promise-native');
const isDev = require('./isDev');
const helper = require('./helper');


module.exports = class GitHub {

	constructor () {
		this.user_agent = helper.appName;
		this.reqCount = 0;
		this.fetchingUser = false;
	}

	async fetchUser () {
		if (this.user || this.fetchingUser) return;
		this.fetchingUser = true;
		const res = await this.get('/user');
		this.user = res;
		this.fetchingUser = false;
	}

	setOptions (token, host = 'https://api.github.com') {
		this.host = host;
		this.token = token;
		this.fetchUser();
	}

	getOptions (url, qs = {}, fullResp = false) {
		const uri = `${this.host}${url}`;
		const headers = { 'User-Agent': helper.appName };
		if (url.indexOf('projects') > -1) headers.Accept = 'application/vnd.github.inertia-preview+json';
		if (this.token) qs.access_token = this.token;
		return { uri, qs, headers, json: true, resolveWithFullResponse: fullResp, strictSSL: false };
	}

	async get (url, params, fullResp = false) {
		this.reqCount++;
		if (isDev) {
			// console.log(url, params);
			console.log('No of GH requests so far:', this.reqCount);
		}
		const options = this.getOptions(url, params, fullResp);

		try {
			const res = await REQ(options);
			if (!fullResp) return res;
			return { headers: res.headers, body: res.body };
		}
		catch (err) {
			// if (isDev) console.error(options.uri, err);
		}
	}
};
