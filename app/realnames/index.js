'use strict';

var _require = require('../services'),
    users = _require.users,
    github = _require.github;

var webview = void 0;

/**
 * Convert an array of users to object, e.g.
 * from [{id: '1', name: 'a'}, {id: '2', name: 'b'}]
 * to { 1: {id: '1', name: 'a'}, 2: {id: '2', name: 'b'} }
 */
function uato(userList) {
	var uobj = {};
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = userList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var user = _step.value;
			if (user) uobj[user.id] = user;
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return uobj || [];
}

function matchIdsWithNames(idList, userList) {
	var uobj = uato(userList);
	var newUsers = idList.map(function (id) {
		if (uobj[id]) return Promise.resolve(uobj[id]);
		return github.getUserById(id).then(function (usr) {
			if (usr.name) users.add(usr);
			return usr;
		});
	});
	return Promise.all(newUsers).then(uato);
}

function getAll(idList) {
	return users.get().then(function (userList) {
		return matchIdsWithNames(idList, userList);
	}).then(function (res) {
		return webview.send('userIdsAndNames', res);
	});
}

function onMessage(ev) {
	if (ev.channel === 'userIdsGathered') {
		var ids = ev.args[0];
		if (Array.isArray(ids)) getAll(ids);
		webview.removeEventListener('ipc-message', onMessage);
	}
}

function replace(wv) {
	webview = wv;
	webview.addEventListener('ipc-message', onMessage);
	webview.send('gatherUserIds');
}

module.exports = {
	replace: replace
};