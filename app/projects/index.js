const $ = require('../util');
const config = $.getConfig();
const EVENT = require('../db/events');
const github = require('../db/github');
const users = require('../db/users');


let isReady = false, el, listEl;
const baseUrl = `${config.get('baseUrl')}/${config.get('repoToSearch')}/projects/`;

function refresh () {
	github.getProjects()
		.then(projects => Promise.all(projects.map(remapProjectFields).map(updateUserName)))
		.then(printProjects);
}


function getProjectHtml (project) {
	return `<div class="project-box">
		<a href="${project.url}" class="btn">${project.name}</a>
		<span>${project.authorName || project.authorId}</span>
	</div>`;
}

function remapProjectFields (project) {
	return {
		_id: project.id,
		id: project.number,
		name: project.name,
		body: project.body,
		created_at: project.created_at,
		updated_at: project.updated_at,
		url: baseUrl + project.number,
		authorId: project.creator.login
	};
}

function updateUserName (project) {
	return users.getById(project.authorId).then(usr => {
		if (usr) project.authorName = usr.name;
		return project;
	});
}


function printProjects (projects) {
	listEl.html(projects.map(getProjectHtml).join(''));
}


function onClick (e) {
	let target = $(e.target);

	if (target.is('.js-refresh')) {
		e.preventDefault();
		refresh();
	}
	else if (target.is('.btn')) {
		e.preventDefault();
		$.trigger(EVENT.url.change.to, target[0].getAttribute('href'));
	}
}



function init () {
	if (isReady) return;

	el = $('.subnav-projects');
	listEl = el.find('.subnav-section-list');

	el.on('click', onClick);

	refresh();

	isReady = true;
}


module.exports = {
	init
};
