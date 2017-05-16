'use strict';

var DB = require('./class.db');
var db = new DB('users', 'id');

function add(item) {
	if (!item) return Promise.resolve();
	return db.add(item);
}

function get() {
	return db.find({ repo: 1, id: 1 });
}

function getById(id) {
	if (!id) return Promise.resolve();
	return db.findOne({ id: id });
}

module.exports = {
	add: add,
	get: get,
	getById: getById
};