'use strict';

var config = require('./config');
var EVENT = require('./events');
var jenkins = require('./jenkins');
var helper = require('./helper');
var github = require('./github');
var dialog = require('./dialog');

var history = require('./db.history');
var bookmarks = require('./db.bookmarks');
var users = require('./db.users');

var isDev = require('./isDev');

module.exports = {
	config: config,
	EVENT: EVENT,
	github: github,
	jenkins: jenkins,
	dialog: dialog,

	history: history,
	bookmarks: bookmarks,
	users: users,
	helper: helper,
	isDev: isDev
};