const GH = require('octonode');
const $ = require('../util');
const config = $.getConfig();

let client = null;


function init () {
	const token = config.get('ghToken');
	if (!token) return;
	const ghHostname = config.get('baseUrl').replace('https://', '') + 'api/v3';
	client = GH.client(token, { hostname: ghHostname });
	client.requestDefaults['strictSSL'] = false;
}



function getCount () {
	if (!client) init();
	return new Promise(resolve => {
		if (!client) return resolve(0);
		client.me().notifications({ participating: true }, (err, resp) => {
			if (err) return resolve(0);
			resolve(resp.length);
		});
	});
}




module.exports = {
	getCount
};
