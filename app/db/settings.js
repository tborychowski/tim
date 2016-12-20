const DB = require('tingodb')().Db;
const db = new DB('storage/', {});
const collection = db.collection('settings.json');


function set (cfg) {
	return new Promise ((resolve, reject) => {
		collection.update({ name: 'settings' }, cfg, { upsert: true }, (err, res) => {
			if (err) return reject(err);
			resolve(res);
		});
	});
}

function get () {
	return new Promise ((resolve, reject) => {
		collection.find({ name: 'settings' }, (err, res) => {
			if (err) return reject(err);
			res.toArray((err2, items) => {
				if (err2) return reject(err2);
				resolve(items[0]);
			});
		});
	});
}



module.exports = {
	set,
	get,
};
