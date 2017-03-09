const app = require('electron').remote.app;
const DB = require('tingodb')().Db;
const db = new DB(app.getPath('userData'), {});
const collection = db.collection('stars.json');

collection.ensureIndex({ 'url': 1 }, { unique: true });

function add (issue) {
	// { id: 3214, name: 'issue name', repo: 'angular/angular' }
	issue.updated_at = +new Date();
	return new Promise ((resolve, reject) => {
		collection.insert(issue, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}

function remove (issue) {
	return new Promise ((resolve, reject) => {
		collection.remove({ url: issue.url }, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}

function get () {
	return new Promise ((resolve, reject) => {
		collection
			.find({})
			.sort({ repo: 1, id: 1 })
			.toArray((err, items) => {
				if (err) return reject(err);
				resolve(items);
			});
	});
}


function getByUrl (url) {
	return new Promise ((resolve, reject) => {
		collection.findOne({ url }, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}


function setUnread (id, unread) {
	return new Promise ((resolve, reject) => {
		collection.update({ id }, {$set: { unread }}, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}



module.exports = {
	add,
	remove,
	get,
	getByUrl,
	setUnread,
};
