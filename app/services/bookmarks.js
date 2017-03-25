const DB = require('./DB');
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


function setUnread (id, unread) {
	return db.update({ id }, { unread });
}



module.exports = {
	add,
	remove,
	get,
	getByUrl,
	setUnread,
};
