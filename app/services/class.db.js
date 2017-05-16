'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tingodb = require('tingodb')().Db;
var helper = require('./helper');

function getCollection(name) {
	name = name.replace(/\.json$/, '') + '.json';
	var db = new tingodb(helper.getUserDataFolder(), {});
	return db.collection(name);
}

module.exports = function () {
	function DB(colName, index) {
		_classCallCheck(this, DB);

		this.collection = getCollection(colName);
		if (index) {
			var idx = {};
			idx[index] = 1;
			this.collection.ensureIndex(idx, { unique: true });
		}
	}

	_createClass(DB, [{
		key: 'add',
		value: function add(item) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				_this.collection.insert(item, function (err, res) {
					if (err) return reject(err);
					resolve(res);
				});
			});
		}
	}, {
		key: 'addOrUpdate',
		value: function addOrUpdate(where, item) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {
				_this2.collection.update(where, item, { upsert: true, w: 1 }, function (err, res) {
					if (err) return reject(err);
					resolve(res);
				});
			});
		}
	}, {
		key: 'find',
		value: function find() {
			var _this3 = this;

			var sort = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { id: 1 };
			var where = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			return new Promise(function (resolve, reject) {
				_this3.collection.find(where, {}).sort(sort).toArray(function (err, items) {
					if (err) return reject(err);
					resolve(items || []);
				});
			});
		}
	}, {
		key: 'findOne',
		value: function findOne(item) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {
				_this4.collection.findOne(item, {}, function (err, res) {
					if (err) return reject(err);
					resolve(res);
				});
			});
		}
	}, {
		key: 'update',
		value: function update(where, item) {
			var _this5 = this;

			return new Promise(function (resolve, reject) {
				_this5.collection.update(where, { $set: item }, function (err, res) {
					if (err) return reject(err);
					resolve(res);
				});
			});
		}
	}, {
		key: 'del',
		value: function del(item) {
			var _this6 = this;

			return new Promise(function (resolve, reject) {
				_this6.collection.remove(item, function (err, res) {
					if (err) return reject(err);
					resolve(res);
				});
			});
		}
	}]);

	return DB;
}();