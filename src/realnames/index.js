const { users, github } = require('../services');

let webview;

/**
 * Convert an array of users to object, e.g.
 * from [{id: '1', name: 'a'}, {id: '2', name: 'b'}]
 * to { 1: {id: '1', name: 'a'}, 2: {id: '2', name: 'b'} }
 */
function uato (userList) {
	const uobj = {};
	for (let user of userList) if (user) uobj[user.id] = user;
	return uobj || [];
}

function getNewUser (id) {
	return github.getUserById(id)
		.then(usr => {
			if (usr.name) users.add(usr);
			return usr;
		});
}

function matchIdsWithNames (inPageIds, allUsers) {
	allUsers = uato(allUsers);
	const newUsersPromises = inPageIds.map(id => {
		if (allUsers[id]) return Promise.resolve(allUsers[id]);
		return getNewUser(id);
	});
	return Promise.all(newUsersPromises)
		.then(newUsers => {
			newUsers = uato(newUsers);
			return Object.assign(allUsers, newUsers);
		});
}


function getAllUsers (inPageIds) {
	return users.get()
		.then(allUsers => matchIdsWithNames(inPageIds, allUsers))
		.then(res => webview.send('userIdsAndNames', res));
}

function onMessage (ev) {
	if (ev.channel === 'userIdsGathered') {
		const ids = ev.args[0];
		if (Array.isArray(ids)) getAllUsers(ids);
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
