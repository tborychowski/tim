const DB = require('tingodb')().Db;
const db = new DB('storage/', {});
const collection = db.collection('users.json');


function add (item) {
	// { id: 'i123456', name: 'john john' }
	return new Promise ((resolve, reject) => {
		collection.insert(item, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}


function get () {
	return new Promise ((resolve, reject) => {
		collection.find({}, { _id: 0 }, (err, res) => {
			if (err) return reject(err);
			res.sort({ repo: 1, id: 1 }).toArray((err2, items) => {
				if (err2) return reject(err2);
				resolve(items);
			});
		});
	});
}


function getById (id) {
	return new Promise ((resolve, reject) => {
		collection.find({ id }, { _id: 0 }, (err, res) => {
			if (err) return reject(err);
			res.toArray((err2, items) => {
				if (err2) return reject(err2);
				resolve(items[0]);
			});
		});
	});
}



module.exports = {
	add,
	get,
	getById,
};
