const $ = require('../util');
const jenkinsApi = require('jenkins-api');
const isDev = require('./isDev');

let count = 0;

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function calcProgress (data) {
	if (data.result) return 100;
	const now = +new Date(), progress = (now - data.timestamp) * 100 / data.estimatedDuration;
	return Math.min(99, progress);
}


function parseBuildData (item, data) {
	return {
		name       : data.displayName,
		inProgress : data.building,
		duration   : data.duration,
		result     : data.result && ('' + data.result).toLowerCase(),
		timestamp  : data.timestamp,
		remaining  : Math.max(0, data.timestamp + data.estimatedDuration - (+new Date())),
		progress   : calcProgress(data)
	};
}



function buildInfo (jenkins, item) {
	return new Promise(resolve  => {
		jenkins.build_info(item.jobName, item.buildId, (err, data) => {
			if (isDev) console.log('No of Jenkins requests so far:', ++count);
			if (err) return resolve({});
			const info = parseBuildData(item, data);
			info.url = item.url;
			resolve(info);
		});
	});
}



function getStatus (url) {
	if (!url) return;
	const [host, parts] = $.trim(url, '/').split('/job/');
	const [jobName, buildId] = parts.split('/');
	const item = { jobName, buildId, url };
	const jenkins = jenkinsApi.init(host, { request: { strictSSL: false, rejectUnauthorized: false, proxy: null }});
	return buildInfo(jenkins, item);
}



module.exports = {
	getStatus
};
