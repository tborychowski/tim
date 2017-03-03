/* better typeof */
function type (obj) {
	return obj ? Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() : 'undefined';
}

function isNumber (v) {
	if (typeof v === 'number') return true;
	if (typeof v !== 'string') return false;
	return (/^[\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?$/).test(v);
}

function formatNumber (num) {
	num = Math.round(0 + num * 100) / 100;
	return num.toLocaleString('en-GB', { minimumFractionDigits: 2 });
}

function serialize (obj) {
	const keys = Object.keys(obj);
	if (!keys || !keys.length) return '';
	return '?' + keys.reduce((a, k) => {
		a.push(k + '=' + encodeURIComponent(obj[k]));
		return a;
	}, []).join('&');
}

function varToRealType (v) {
	if (isNumber(v)) {
		let originalv = v;
		v = parseFloat('' + v);
		if (('' + v) !== originalv) v = originalv;
	}
	else if (v === 'true') v = true;
	else if (v === 'false') v = false;
	if (v === '') v = undefined;
	if (type(v) === 'array') v = v.map(val => varToRealType(val));
	return v;
}

function isObjectEmpty (x) {
	if (!x || typeof x !== 'object') return true;
	return Object.keys(x).length === 0;
}

function rand (max, min = 0) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function each (arr, cb, scope) {
	if (!arr) return;
	if (type(arr) === 'object') {
		for (let key in arr) cb.call(scope || cb, arr[key], key);
	}
	else {
		for (let i = 0, item; item = arr[i]; i++) {
			cb.call(scope || cb, item, i);
		}
	}
	// return Array.prototype.forEach.call(collection, cb);
}

function sanitize (v) {
	const div = document.createElement('DIV');
	div.innerHTML = v || '';
	return div.textContent || div.innerText || '';
}

function merge (target, ...sources) {
	if (!target) throw new TypeError('Cannot convert first argument to object');
	const to = Object(target);
	for (let source of sources) {
		let keys = Object.keys(Object(source));
		for (let key of keys) {
			let desc = Object.getOwnPropertyDescriptor(source, key);
			if (desc !== undefined && desc.enumerable) to[key] = source[key];
		}
	}
	return to;
}


function isNodeList (nodes) {
	return (typeof nodes === 'object') &&
		/^(htmlcollection|nodelist|object)$/.test(type(nodes)) &&
		(nodes.length === 0 || (typeof nodes[0] === 'object' && nodes[0].nodeType > 0));
}


function trim (str, chars) {
	chars = chars || '\\s';
	return ('' + str).replace(new RegExp(`(^${chars}+)|(${chars}+$)`, 'g'), '');
}
function ltrim (str, chars) { return ('' + str).replace(new RegExp('^' + (chars ? chars : '\\s') + '+'), ''); }
function rtrim (str, chars) { return ('' + str).replace(new RegExp((chars ? chars : '\\s') + '+$'), ''); }


function fuzzy (hay, s) {
	s = ('' + s).toLowerCase();
	hay = ('' + hay).toLowerCase();
	let n = -1;
	for (let l of s) if (!~(n = hay.indexOf(l, n + 1))) return false;
	return true;
}


function parseUrl (url) {
	let urlt;
	try { urlt = new URL(url); }
	catch (e) { urlt = null; }
	return urlt;
}


function prettyDate (time) {
	const date = new Date((time || '').replace(/-/g, '/').replace(/[TZ]/g, ' '));
	const diff = (((new Date()).getTime() - date.getTime()) / 1000);
	const day_diff = Math.floor(diff / 86400);
	if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return date.toLocaleString();
	return day_diff === 0 && (
			diff < 60 && 'just now' ||
			diff < 120 && '1 minute ago' ||
			diff < 3600 && Math.floor(diff / 60) + ' minutes ago' ||
			diff < 7200 && '1 hour ago' ||
			diff < 86400 && Math.floor(diff / 3600) + ' hours ago'
		) ||
		day_diff === 1 && 'Yesterday' ||
		day_diff < 7 && day_diff + ' days ago' ||
		day_diff < 31 && Math.ceil(day_diff / 7) + ' weeks ago';
}

module.exports = {
	fuzzy,
	ltrim,
	rtrim,
	trim,
	type,
	rand,
	each,
	isNumber,
	formatNumber,
	varToRealType,
	isObjectEmpty,
	merge,
	sanitize,
	serialize,
	isNodeList,
	parseUrl,
	months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	prettyDate,
};
