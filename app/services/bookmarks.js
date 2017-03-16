const DB = require('./DB');
const db = new DB('bookmarks', [
	'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
	'name TEXT NOT NULL',
	'number INTEGER',
	'repo TEXT',
	'type TEXT',
	'url TEXT NOT NULL UNIQUE',
	'visited INTEGER NOT NULL',
]);


const add = item => {
	item.visited = +new Date();
	return db.add(item);
};

const remove = item => db.del(item, 'url');

const getByUrl = url => db.select({ fn: 'get', where: `url = "${url}"`});

const get = () => db.select({ order: 'repo ASC, id ASC' });


module.exports = {
	add,
	remove,
	get,
	getByUrl
};
