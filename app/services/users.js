const DB = require('./DB');
const db = new DB('users', [
	'id TEXT NOT NULL UNIQUE',
	'name TEXT'
]);

const add = item => db.add(item);

const getById = id => db.getById(id);

const get = () => db.select();


module.exports = {
	add,
	getById,
	get,
};
