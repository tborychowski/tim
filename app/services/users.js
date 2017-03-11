const app = require('electron').remote.app;
const DB = require('tingodb')().Db;
const db = new DB(app.getPath('userData'), {});
const collection = db.collection('users.json');

collection.ensureIndex({ 'id': 1 }, { unique: true });


function add (item) {
	if (!item) return Promise.resolve();
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
		collection
			.find({}, { _id: 0 })
			.sort({ repo: 1, id: 1 })
			.toArray((err, items) => {
				if (err) return reject(err);
				resolve(items);
			});
	});
}


function getById (id) {
	if (!id) return Promise.resolve();
	return new Promise ((resolve, reject) => {
		collection.findOne({ id }, { _id: 0 }, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}



module.exports = {
	add,
	get,
	getById,
};
