const $ = require('../util');
const Config = require('electron-config');
const config = new Config();
const usersDB = require('../db/users');

let webview;

function fetchUserById (id) {
	return $.get(`${config.get('baseUrl')}api/v3/users/${id}`)
		.then(res => ({ id, name: res.name }))
		.then(usr => (usersDB.add(usr), usr))
		.catch(() => usersDB.add({ id, name: id }));
}

/**
 * Convert an array of users to object, e.g.
 * from [{id: '1', name: 'a'}, {id: '2', name: 'b'}]
 * to { 1: {id: '1', name: 'a'}, 2: {id: '2', name: 'b'} }
 */
function uato (users) {
	const uobj = {};
	for (let user of users) uobj[user.id] = user;
	return uobj;
}

function matchIdsWithNames (idList, users) {
	const uobj = uato(users);
	const newUsers = idList.map(id => {
		if (uobj[id]) return Promise.resolve(uobj[id]);
		return fetchUserById(id);
	});
	return Promise.all(newUsers).then(uato);
}


function getAll (idList) {
	return usersDB.get()
		.then(users => matchIdsWithNames(idList, users))
		.then(res => webview.send('userIdsAndNames', res));
}

function onMessage (ev) {
	if (ev.channel === 'userIdsGathered') {
		const ids = ev.args[0];
		if (Array.isArray(ids)) getAll(ids);
		webview.removeEventListener('ipc-message', onMessage);
	}
}

function replace (wv) {
	webview = wv;
	webview.addEventListener('ipc-message', onMessage);
	webview.send('gatherUserIds');
}


module.exports = {
	replace
};
