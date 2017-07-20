const DB = require('./class.db');
const db = new DB('history', 'url');


function add (item) {
	if (!item) return Promise.resolve();
	if (item.url.indexOf('#') > -1) item.url = item.url.substr(0, item.url.indexOf('#'));
	return db.addOrUpdate({ url: item.url }, item);
}


function get () {
	return db.find({ visited: -1 });
}


function getById (_id) {
	if (!_id) return Promise.resolve();
	return db.findOne({ _id });
}


function find (txt) {
	txt = '.*' + ('' + txt).split(' ').join('.*') + '.*';
	const where = { $or: [
		{id: { $regex: txt, $options: 'i' }},
		{name: { $regex: txt, $options: 'i' }},
	]};
	return db.find({ visited: -1 }, where);
}



module.exports = {
	add,
	get,
	getById,
	find,
};
