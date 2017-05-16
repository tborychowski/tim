const DB = require('./class.db');
const db = new DB('stars', 'url');	// legacy name



function add (item) {
	if (!item) return Promise.resolve();
	item.updated_at = +new Date();
	return db.add(item);
}


function remove (item) {
	return db.del({ url: item.url });
}


function get () {
	return db.find({ repo: 1, id: 1 });
}


function getByUrl (url) {
	return db.findOne({ url });
}


function update (id, fields) {
	return db.update({ id }, fields);
}

function setState (id, state) {
	return db.update({ id }, { state });
}

function setUnread (id, unread) {
	return db.update({ id }, { unread });
}


function setUnreadByUrl (url, unread) {
	const updated_at = +new Date();
	return db.update({ url }, { unread, updated_at });
}



module.exports = {
	add,
	remove,
	get,
	update,
	getByUrl,
	setUnread,
	setState,
	setUnreadByUrl,
};
