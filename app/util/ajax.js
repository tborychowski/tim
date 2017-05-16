'use strict';

var util = require('./util');

var baseUrl = '';

function ajax(options) {
	if (typeof options === 'string') options = { url: options };

	var resp = void 0;
	var data = options.data || '';
	var req = new XMLHttpRequest();

	options.url = baseUrl + options.url;
	options.method = options.method || 'GET';
	options.type = options.type || 'json';

	if (data) {
		if (options.method.toLowerCase() === 'get') options.url += util.serialize(data);else if (options.type === 'json') data = JSON.stringify(data);
	}
	return new Promise(function (resolve, reject) {
		req.open(options.method, options.url, true);
		req.onload = function () {
			if (req.status >= 200 && req.status < 400) {
				try {
					resp = JSON.parse(req.responseText);
				} catch (e) {
					resp = req.responseText;
				}
				resolve(resp);
			} else reject(req.statusText);
		};
		req.onerror = function () {
			return reject(req.statusText);
		};
		req.setRequestHeader('Content-Type', 'application/' + options.type + '; charset=UTF-8');
		req.send(data);
	});
}

module.exports = {
	ajax: ajax,
	get: function get(url, data) {
		return ajax({ url: url, data: data || {} });
	},
	post: function post(url, data) {
		return ajax({ url: url, data: data || {}, method: 'POST' });
	},
	put: function put(url, data) {
		return ajax({ url: url, data: data || {}, method: 'PUT' });
	},
	del: function del(url, data) {
		return ajax({ url: url, data: data || {}, method: 'DELETE' });
	}
};