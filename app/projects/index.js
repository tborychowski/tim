'use strict';

var $ = require('../util');

var _require = require('../services'),
    EVENT = _require.EVENT,
    users = _require.users,
    github = _require.github,
    config = _require.config;

var isReady = false,
    el = void 0,
    listEl = void 0;
var projectSort = function projectSort(a, b) {
	return a.name.localeCompare(b.name);
};

function refresh() {
	github.getProjects().then(function (projects) {
		if (!projects || !projects.length) return Promise.resolve([]);
		projects.sort(projectSort);
		return Promise.all(projects.map(remapProjectFields));
	}).then(function (projects) {
		return listEl.html(projects.map(getProjectHtml).join(''));
	});
}

function getProjectHtml(project) {
	return '<a href="' + project.html_url + '" class="btn project-box">\n\t\t<img class="avatar" src="' + project.creator.avatar_url + '"\n\t\t\talt="' + (project.creator.name || project.creator.login) + '" />\n\t\t<span class="name">' + project.name + '</span>\n\t\t<span class="time">Updated: ' + project.updated_at_str + '</span>\n\t</a>';
}

function remapProjectFields(project) {
	project.created_at_str = $.prettyDate(project.created_at);
	project.updated_at_str = $.prettyDate(project.updated_at);

	var repo = project.owner_url.split('/').splice(-2).join('/');
	project.html_url = '' + config.get('baseUrl') + repo + '/projects/' + project.number;

	return users.getById(project.login).then(function (usr) {
		if (usr) project.creator.name = usr.name;
		return project;
	});
}

var throttled = null;
var throttle = function throttle() {
	if (throttled) clearTimeout(throttled);
	throttled = setTimeout(function () {
		throttled = null;
	}, 1000);
};

function onClick(e) {
	e.preventDefault();

	if (throttled) return throttle(); // if clicked during quiet time - throttle again
	throttle();

	var target = $(e.target);
	if (target.is('.js-refresh')) return refresh();
	target = target.closest('.btn');
	if (target.length) return $.trigger(EVENT.url.change.to, target.attr('href'));
}

function init() {
	if (isReady) return;

	el = $('.subnav-projects');
	listEl = el.find('.subnav-section-list');

	el.on('click', onClick);
	$.on(EVENT.projects.refresh, refresh);

	refresh();

	isReady = true;
}

module.exports = {
	init: init
};