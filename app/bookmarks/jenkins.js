const $ = require('../util');
const jenkinsApi = require('jenkins-api');


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
			if (err) return resolve(item);
			item = parseBuildData(item, data);
			resolve(item);
		});
	});
}



function getStatus (url) {
	if (!url) return;
	const [host, parts] = $.trim(url, '/').split('/job/');
	const [jobName, buildId] = parts.split('/');
	const item = { jobName, buildId };
	const jenkins = jenkinsApi.init(host, { strictSSL: false, proxy: null });
	return buildInfo(jenkins, item);
}



module.exports = {
	getStatus
};
