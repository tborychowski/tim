const app = require('electron').remote.app;
const DB = require('tingodb')().Db;
const db = new DB(app.getPath('userData'), {});
const collection = db.collection('history.json');
const $ = require('../util');

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
		collection.find({}, (err, res) => {
			if (err) return reject(err);
			res.sort({ _id: -1 }).toArray((err2, items) => {
				if (err2) return reject(err2);
				resolve(items);
			});
		});
	});
}


function getById (_id) {
	return new Promise ((resolve, reject) => {
		collection.find({ _id }, (err, res) => {
			if (err) return reject(err);
			res.toArray((err2, items) => {
				if (err2) return reject(err2);
				resolve(items[0]);
			});
		});
	});
}


function find (txt) {
	let ltxt = txt.toLowerCase();
	return get().then(items => {
		return items
			.filter(item => ('' + item.id).indexOf(txt) > -1 || $.fuzzy(item.name, txt))
			.sort((a, b) => {
				const bv = b.name.toLowerCase().indexOf(ltxt);
				const av = a.name.toLowerCase().indexOf(ltxt);
				return bv - av;
			});
	});
}



module.exports = {
	add,
	get,
	getById,
	find,
};
