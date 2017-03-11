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
	return uobj;
}

function matchIdsWithNames (idList, userList) {
	const uobj = uato(userList);
	const newUsers = idList.map(id => {
		if (uobj[id]) return Promise.resolve(uobj[id]);
		return github.getUserById(id)
			.then(usr => {
				users.add(usr);
				return usr;
			});
	});
	return Promise.all(newUsers).then(uato);
}


function getAll (idList) {
	return users.get()
		.then(userList => matchIdsWithNames(idList, userList))
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
