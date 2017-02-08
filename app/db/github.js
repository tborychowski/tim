const GH = require('octonode');
const Config = require('electron-config');
const config = new Config();

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
	return new Promise((resolve, reject) => {
		client.me().notifications({ participating: true }, (err, resp) => {
			if (err) return reject(err);
			resolve(resp.length);
		});
	});
}




module.exports = {
	getCount
};
