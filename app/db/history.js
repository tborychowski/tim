const app = require('electron').remote.app;
const DB = require('tingodb')().Db;
const db = new DB(app.getPath('userData'), {});
const collection = db.collection('history.json');

collection.ensureIndex({ 'url': 1 }, { unique: true });


function add (item) {
	// issue: { url: 'https://...', name: 'Page 123', timestamp }
	if (item.url.indexOf('#') > -1) item.url = item.url.substr(0, item.url.indexOf('#'));
	return new Promise ((resolve, reject) => {
		collection.update({ url: item.url }, item, { upsert: true, w: 1 }, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}


function get () {
	return new Promise ((resolve, reject) => {
		collection
			.find({})
			.sort({ _id: -1 })
			.toArray((err, items) => {
				if (err) return reject(err);
				resolve(items);
			});
	});
}


function getById (_id) {
	return new Promise ((resolve, reject) => {
		collection.findOne({ _id }, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}


function find (txt) {
	txt = new RegExp('.*' + ('' + txt).split(' ').join('.*') + '.*', 'i');
	return new Promise ((resolve, reject) => {
		collection
			.find({ $or: [ {id: txt}, {name: txt} ]})
			.sort({ visited: -1 })
			.toArray((err, items) => {
				if (err) return reject(err);
				resolve(items);
			});
	});
}



module.exports = {
	add,
	get,
	getById,
	find,
};
