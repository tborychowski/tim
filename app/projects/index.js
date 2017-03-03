const $ = require('../util');
const config = $.getConfig();
const EVENT = require('../db/events');
const github = require('../db/github');
const users = require('../db/users');


let isReady = false, el, listEl;
const baseUrl = `${config.get('baseUrl')}/${config.get('repoToSearch')}/projects/`;
const projectSort = (a, b) => a.name.localeCompare(b.name);


function refresh () {
	github.getProjects()
		.then(projects => {
			if (!projects || !projects.length) return Promise.resolve([]);
			projects.sort(projectSort);
			return Promise.all(projects.map(remapProjectFields));
		})
		.then(projects => listEl.html(projects.map(getProjectHtml).join('')));
}


function getProjectHtml (project) {
	return `<div class="project-box">
		<img class="avatar" src="${project.creator.avatar}" alt="${project.creator.name || project.creator.login}" />
		<a href="${project.url}" class="btn">${project.name}</a>
		<span>Updated: ${project.updated_at_str}</span>
	</div>`;
}

function remapProjectFields (project) {
	project = {
		_id: project.id,
		id: project.number,
		name: project.name,
		body: project.body,
		created_at: new Date(project.created_at),
		updated_at: new Date(project.updated_at),
		created_at_str: $.prettyDate(project.created_at),
		updated_at_str: $.prettyDate(project.updated_at),
		url: baseUrl + project.number,
		creator: {
			login: project.creator.login,
			avatar: project.creator.avatar_url
		}
	};
	return users.getById(project.login).then(usr => {
		if (usr) project.creator.name = usr.name;
		return project;
	});
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
