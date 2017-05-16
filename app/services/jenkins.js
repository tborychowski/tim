'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var $ = require('../util');
var jenkinsApi = require('jenkins-api');

function calcProgress(data) {
	if (data.result) return 100;
	var now = +new Date(),
	    progress = (now - data.timestamp) * 100 / data.estimatedDuration;
	return Math.min(99, progress);
}

function parseBuildData(item, data) {
	return {
		name: data.displayName,
		inProgress: data.building,
		duration: data.duration,
		result: data.result && ('' + data.result).toLowerCase(),
		timestamp: data.timestamp,
		remaining: Math.max(0, data.timestamp + data.estimatedDuration - +new Date()),
		progress: calcProgress(data)
	};
}

function buildInfo(jenkins, item) {
	return new Promise(function (resolve) {
		jenkins.build_info(item.jobName, item.buildId, function (err, data) {
			if (err) return resolve();
			item = parseBuildData(item, data);
			resolve(item);
		});
	});
}

function getStatus(url) {
	if (!url) return;

	var _$$trim$split = $.trim(url, '/').split('/job/'),
	    _$$trim$split2 = _slicedToArray(_$$trim$split, 2),
	    host = _$$trim$split2[0],
	    parts = _$$trim$split2[1];

	var _parts$split = parts.split('/'),
	    _parts$split2 = _slicedToArray(_parts$split, 2),
	    jobName = _parts$split2[0],
	    buildId = _parts$split2[1];

	var item = { jobName: jobName, buildId: buildId };
	var jenkins = jenkinsApi.init(host, { strictSSL: false, proxy: null });
	return buildInfo(jenkins, item);
}

module.exports = {
	getStatus: getStatus
};