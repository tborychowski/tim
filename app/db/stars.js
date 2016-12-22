const app = require('electron').remote.app;
const DB = require('tingodb')().Db;
const db = new DB(app.getPath('userData'), {});
const collection = db.collection('stars.json');


function add (issue) {
	// { id: 3214, name: 'issue name', repo: 'angular/angular' }
	return new Promise ((resolve, reject) => {
		collection.insert(issue, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}

function remove (issue) {
	return new Promise ((resolve, reject) => {
		collection.remove({ id: issue.id }, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}

function get () {
	return new Promise ((resolve, reject) => {
		collection.find({}, (err, res) => {
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
		collection.find({ id }, (err, res) => {
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
	remove,
	get,
	getById,
};
