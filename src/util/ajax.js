const util = require('./util');

const baseUrl = '';

function ajax (options) {
	if (typeof options === 'string') options = { url: options };

	let resp;
	let data = options.data || '';
	const req = new XMLHttpRequest();

	options.url = baseUrl + options.url;
	options.method = options.method || 'GET';
	options.type = options.type || 'json';

	if (data) {
		if (options.method.toLowerCase() === 'get') options.url += util.serialize(data);
		else if (options.type === 'json') data = JSON.stringify(data);
	}
	return new Promise((resolve, reject) => {
		req.open(options.method, options.url, true);
		req.onload = () => {
			if (req.status >= 200 && req.status < 400) {
				try { resp = JSON.parse(req.responseText); }
				catch (e) { resp = req.responseText; }
				resolve(resp);
			}
			else reject(req.statusText);
		};
		req.onerror = () => reject(req.statusText);
		req.setRequestHeader('Content-Type', `application/${options.type}; charset=UTF-8`);
		req.send(data);
	});
}



module.exports = {
	ajax,
	get: (url, data) => ajax({ url, data: data || {} }),
	post: (url, data) => ajax({ url, data: data || {}, method: 'POST' }),
	put: (url, data) => ajax({ url, data: data || {}, method: 'PUT' }),
	del: (url, data) => ajax({ url, data: data || {}, method: 'DELETE' })
};
