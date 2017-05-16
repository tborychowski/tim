'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var type = function type(obj) {
	return obj ? Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() : 'undefined';
};

var trim = function trim(str) {
	var chars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\\s';
	return ('' + str).replace(new RegExp('(^' + chars + '+)|(' + chars + '+$)', 'g'), '');
};
var ltrim = function ltrim(str) {
	var chars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\\s';
	return ('' + str).replace(new RegExp('^' + chars + '+'), '');
};
var rtrim = function rtrim(str) {
	var chars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\\s';
	return ('' + str).replace(new RegExp(chars + '+$'), '');
};

var rand = function rand(max) {
	var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	return Math.floor(Math.random() * (max - min + 1) + min);
};

var ucfirst = function ucfirst(s) {
	return ('' + s).toLowerCase().replace(/\b([a-z])/gi, function (c) {
		return c.toUpperCase();
	});
};

function isNumber(v) {
	if (typeof v === 'number') return true;
	if (typeof v !== 'string') return false;
	return (/^[\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?$/.test(v)
	);
}

function formatNumber(num) {
	num = Math.round(0 + num * 100) / 100;
	return num.toLocaleString('en-GB', { minimumFractionDigits: 2 });
}

function serialize(obj) {
	var keys = Object.keys(obj);
	if (!keys || !keys.length) return '';
	return '?' + keys.reduce(function (a, k) {
		a.push(k + '=' + encodeURIComponent(obj[k]));
		return a;
	}, []).join('&');
}

function varToRealType(v) {
	if (isNumber(v)) {
		var originalv = v;
		v = parseFloat('' + v);
		if ('' + v !== originalv) v = originalv;
	} else if (v === 'true') v = true;else if (v === 'false') v = false;
	if (v === '') v = undefined;
	if (type(v) === 'array') v = v.map(function (val) {
		return varToRealType(val);
	});
	return v;
}

function isObjectEmpty(x) {
	if (!x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object') return true;
	return Object.keys(x).length === 0;
}

function sanitize(v) {
	var div = document.createElement('DIV');
	div.innerHTML = v || '';
	return div.textContent || div.innerText || '';
}

function fuzzy(hay, s) {
	s = ('' + s).toLowerCase();
	hay = ('' + hay).toLowerCase();
	var n = -1;
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = s[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var l = _step.value;
			if (!~(n = hay.indexOf(l, n + 1))) return false;
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return true;
}

function parseUrl(url) {
	var urlt = void 0;
	try {
		urlt = new URL(url);
	} catch (e) {
		urlt = null;
	}
	return urlt;
}

function prettyDate(time) {
	var date = new Date((time || '').replace(/-/g, '/').replace(/[TZ]/g, ' '));
	var diff = (new Date().getTime() - date.getTime()) / 1000;
	var day_diff = Math.floor(diff / 86400);
	if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return date.toLocaleString();
	return day_diff === 0 && (diff < 60 && 'just now' || diff < 120 && '1 minute ago' || diff < 3600 && Math.floor(diff / 60) + ' minutes ago' || diff < 7200 && '1 hour ago' || diff < 86400 && Math.floor(diff / 3600) + ' hours ago') || day_diff === 1 && 'Yesterday' || day_diff < 7 && day_diff + ' days ago' || day_diff < 31 && Math.ceil(day_diff / 7) + ' weeks ago';
}

function injectCSS(webview, path) {
	var readFile = require('fs').readFileSync;
	var css = void 0;
	try {
		css = readFile(path, 'utf8');
	} catch (e) {
		css = '';
	}
	webview[0].send('injectCss', css);
}

module.exports = {
	fuzzy: fuzzy,
	ltrim: ltrim,
	rtrim: rtrim,
	trim: trim,
	ucfirst: ucfirst,
	type: type,
	rand: rand,
	isNumber: isNumber,
	formatNumber: formatNumber,
	varToRealType: varToRealType,
	isObjectEmpty: isObjectEmpty,
	sanitize: sanitize,
	serialize: serialize,
	parseUrl: parseUrl,
	months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	prettyDate: prettyDate,
	injectCSS: injectCSS
};