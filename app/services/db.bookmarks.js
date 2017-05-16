'use strict';

var DB = require('./class.db');
var db = new DB('stars', 'url'); // legacy name


function add(item) {
	if (!item) return Promise.resolve();
	item.updated_at = +new Date();
	return db.add(item);
}

function remove(item) {
	return db.del({ url: item.url });
}

function get() {
	return db.find({ repo: 1, id: 1 });
}

function getByUrl(url) {
	return db.findOne({ url: url });
}

function update(id, fields) {
	return db.update({ id: id }, fields);
}

function setState(id, state) {
	return db.update({ id: id }, { state: state });
}

function setUnread(id, unread) {
	return db.update({ id: id }, { unread: unread });
}

function setUnreadByUrl(url, unread) {
	var updated_at = +new Date();
	return db.update({ url: url }, { unread: unread, updated_at: updated_at });
}

module.exports = {
	add: add,
	remove: remove,
	get: get,
	update: update,
	getByUrl: getByUrl,
	setUnread: setUnread,
	setState: setState,
	setUnreadByUrl: setUnreadByUrl
};