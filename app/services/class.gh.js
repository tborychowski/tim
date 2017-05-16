'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var REQ = require('request-promise-native');
var isDev = require('./isDev');

module.exports = function () {
	function GitHub() {
		_classCallCheck(this, GitHub);

		this.user_agent = 'GithubBrowser';
		this.reqCount = 0;
		this.fetchingUser = false;
	}

	_createClass(GitHub, [{
		key: 'fetchUser',
		value: function fetchUser() {
			var _this = this;

			if (this.user || this.fetchingUser) return;
			this.fetchingUser = true;
			this.get('/user').then(function (res) {
				_this.user = res;
				_this.fetchingUser = false;
			});
		}
	}, {
		key: 'setOptions',
		value: function setOptions(token) {
			var host = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'https://api.github.com';

			this.host = host;
			this.token = token;
			this.fetchUser();
		}
	}, {
		key: 'getOptions',
		value: function getOptions(url) {
			var qs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var fullResp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			var uri = '' + this.host + url;
			var headers = { 'User-Agent': 'GithubBrowser' };
			if (url.indexOf('projects') > -1) headers.Accept = 'application/vnd.github.inertia-preview+json';
			if (this.token) qs.access_token = this.token;

			return { uri: uri, qs: qs, headers: headers, json: true, resolveWithFullResponse: fullResp, strictSSL: false };
		}
	}, {
		key: 'get',
		value: function get(url, params) {
			var fullResp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

			this.reqCount++;
			if (isDev) {
				// console.log(url, params);
				console.log('No of GH requests so far:', this.reqCount);
			}
			var options = this.getOptions(url, params, fullResp);
			return REQ(options).then(function (res) {
				if (!fullResp) return res;
				return { headers: res.headers, body: res.body };
			}).catch(function (err) {
				if (isDev) console.error(options.uri, err);
			});
		}
	}]);

	return GitHub;
}();