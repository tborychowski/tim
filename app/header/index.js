const {shell, clipboard} = require('electron');
const $ = require('../util');
const appState = require('../appstate');
const starsDB = require('../db/stars');
const config = require('../../config.json');
const baseUrl = config.url.replace(/\/$/, '') + '/';

let isReady = false, el, addressbar, starBox;

const clickHandlers = {
	prev: () => { $.trigger('frame/goto', 'prev'); },
	next: () => { $.trigger('frame/goto', 'next'); },
	browser: () => { shell.openExternal(appState.url); },
	copy: () => { clipboard.writeText(appState.url); },
	star: () => { $.trigger('issue/star', appState.issue); starBox.addClass('is-starred'); },
	unstar: () => { $.trigger('issue/unstar', appState.issue); starBox.removeClass('is-starred'); },
	go: () => {
		const parts = parseAnyAddress(addressbar[0].value);
		let url;
		if (parts.repo) url = parts.repo;
		if (parts.id) url += `/issues/${parts.id}`;
		if (url) $.trigger('frame/goto', url);
	}
};


function parseAnyAddress (url) {
	url = getCustomAddress (url.trim());
	if (url === 'notifications') return { repo: url };
	const parts = url.split('/');
	let id;
	if (parts.length > 2) id = parts.pop();
	const repo = parts.join('/');
	return { repo, id };
}


function getCustomAddress (url) {
	return url.replace(baseUrl, '').replace('pull/', '').replace('issues/', '');
}


function onIssueChange (issue) {
	addressbar[0].value = getCustomAddress(appState.url);
	issue = issue || { id: '' };
	starBox.toggleClass('is-issue', !!issue.id);
	if (issue.id) {
		starsDB.getById(issue.id).then(res => {
			starBox.toggleClass('is-starred', !!res);
		});
	}
}


function onClick (e) {
	let target = $(e.target);
	if (target.is('.btn')) {
		e.preventDefault();
		const to = target.data('go');
		if (to && clickHandlers[to]) clickHandlers[to]();
	}
}


function init () {
	if (isReady) return;

	el = $('#header');
	addressbar = el.find('.addressbar');
	starBox = el.find('.star-box');

	addressbar.on('focus', e => { e.target.select(); });
	addressbar.on('keypress', e => { if (e.key === 'Enter') clickHandlers.go(); });

	el.on('click', onClick);

	$.on('issue/changed', onIssueChange);

	isReady = true;
}


module.exports = {
	init
};
