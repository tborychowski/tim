const DB = require('./DB');
const db = new DB('history', [
	'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
	'name TEXT NOT NULL',
	'number INTEGER',
	'repo TEXT',
	'type TEXT',
	'url TEXT NOT NULL UNIQUE',
	'visited INTEGER NOT NULL',
]);


const add = item => db.add(item);

const getById = id => db.getById(id);

const get = () => db.select({ order: 'id DESC' });

function find (txt) {
	return db.select({
		where: `name LIKE "%${txt}%" OR id LIKE "%${txt}%"`,
		order: 'id DESC'
	});
}


module.exports = {
	add,
	getById,
	get,
	find,
};
