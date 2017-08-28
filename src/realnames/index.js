const { users, github } = require('../services');

let webview, READY = false;

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

async function getNewUser (id) {
	const usr = await github.getUserById(id);
	if (usr.name) users.add(usr);
	return usr;
}

async function matchIdsWithNames (inPageIds, allUsers) {
	allUsers = uato(allUsers);
	const newUsersPromises = inPageIds.map(id => {
		if (allUsers[id]) return Promise.resolve(allUsers[id]);
		return getNewUser(id);
	});

	let newUsers = await Promise.all(newUsersPromises);
	newUsers = uato(newUsers);
	return Object.assign(allUsers, newUsers);
}


async function getAllUsers (inPageIds) {
	const allUsers = await users.get();
	const res = await matchIdsWithNames(inPageIds, allUsers);
	webview.send('userIdsAndNames', res);
}

async function onMessage (ev) {
	if (ev.channel === 'userIdsGathered') {
		const ids = ev.args[0];
		if (Array.isArray(ids)) await getAllUsers(ids);
	}
}

function replace (wv) {
	if (!READY) {
		webview = wv;
		webview.addEventListener('ipc-message', onMessage);
		READY = true;
	}
	webview.send('gatherUserIds');
}

module.exports = replace;
