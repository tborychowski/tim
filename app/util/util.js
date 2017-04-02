const type = obj => obj ? Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() : 'undefined';

const trim = (str, chars = '\\s') => ('' + str).replace(new RegExp(`(^${chars}+)|(${chars}+$)`, 'g'), '');
const ltrim = (str, chars = '\\s') => ('' + str).replace(new RegExp(`^${chars}+`), '');
const rtrim = (str, chars = '\\s') => ('' + str).replace(new RegExp(`${chars}+$`), '');

const rand = (max, min = 0) => Math.floor(Math.random() * (max - min + 1) + min);


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

function sanitize (v) {
	const div = document.createElement('DIV');
	div.innerHTML = v || '';
	return div.textContent || div.innerText || '';
}


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


function injectCSS (webview, path) {
	const readFile = require('fs').readFileSync;
	let css;
	try { css = readFile(path, 'utf8'); }
	catch (e) { css = ''; }
	webview[0].send('injectCss', css);
}


module.exports = {
	fuzzy,
	ltrim,
	rtrim,
	trim,
	type,
	rand,
	isNumber,
	formatNumber,
	varToRealType,
	isObjectEmpty,
	sanitize,
	serialize,
	parseUrl,
	months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	prettyDate,
	injectCSS,
};
