const Ractive = require('ractive');
const { EVENT, bookmarks, github, helper, config } = require('../services');
const $ = require('../util');
const IssueBox = require('./issue-box');
const RepoTitle = require('./repo-title');

let Module;
const DEFAULT_REPO_NAME = 'Pages';				// for ungrouped pages
const DEFAULT_PROJECTS_REPO_NAME = 'Projects';	// for ungrouped projects


const template = `
	{{#groupedBookmarks:repo}}
		<div class="repo-box">
			<RepoTitle url="{{repoUrl}}" title="{{repoShortName}}" />
			<ul class="repo-box-issues">
				{{#items}}<IssueBox issue="{{this}}" />{{/items}}
			</ul>
		</div>
	{{/groupedBookmarks}}
`;


const data = {
	bookmarks: [],
};

const computed = {
	groupedBookmarks: function () {
		const groups = helper.groupIssues(this.get('bookmarks'));
		if (!groups[DEFAULT_PROJECTS_REPO_NAME]) {
			const repo = `${config.get('repoToSearch')}/projects`;
			groups[DEFAULT_PROJECTS_REPO_NAME] = {
				name: DEFAULT_PROJECTS_REPO_NAME,
				repo,
				repoShortName: DEFAULT_PROJECTS_REPO_NAME,
				repoUrl: `${config.get('baseUrl')}${repo}`,
			};
		}
		return groups;
	}
};


async function addBookmark (issue) {
	if (!issue) issue = config.get('state.issue');
	issue = completeIssueModel(issue);
	bookmarks.add(issue);
	data.bookmarks.push(issue);
	render(data.bookmarks);

	await github.checkIssuesForUpdates([issue]);
	render(data.bookmarks);
}

function removeBookmark (issue) {
	if (!issue) issue = config.get('state.issue');
	const iss = data.bookmarks.filter(i => i.url === issue.url)[0];
	if (!iss) return;
	this.splice('bookmarks', data.bookmarks.indexOf(iss), 1);
	bookmarks.remove(issue);
}


async function toggleBookmark () {
	const exists = await checkIfBookmarked();
	if (exists) $.trigger(EVENT.bookmark.remove);
	else $.trigger(EVENT.bookmark.add);
}

async function onUrlChanged (issue) {
	if (!issue || !issue.url) return;
	const iss = data.bookmarks.filter(i => i.url === issue.url)[0];
	if (iss) {
		iss.unread = false;
		iss.name = issue.name;
	}
	this.set('bookmarks', data.bookmarks);
	bookmarks.setUnreadByUrl(issue.url, false);

	const book = await checkIfBookmarked(issue.url);
	$.trigger(EVENT.bookmark.exists, !!book);
	if (book && book.name !== issue.name) bookmarks.update(book.id, { name: issue.name });
}

function checkIfBookmarked (url) {
	if (!url) url = config.get('state.url');
	if (url.indexOf('#') > -1) url = url.substr(0, url.indexOf('#'));
	return bookmarks.getByUrl(url);
}


async function refresh (reset) {
	if (Module) {
		Module.transitionsEnabled = false;
		if (reset === true) {
			data.bookmarks = [];
			Module.reset(data);
		}
		Module.transitionsEnabled = true;
	}
	let issues = await bookmarks.get();
	render(issues);
	issues = await github.checkIssuesForUpdates(issues);
	render(issues);
}


function completeIssueModel (iss) {
	if (!iss.repo) {
		if (helper.getPageActualTypeFromUrl(iss.url) === 'project') {
			iss.repo = DEFAULT_PROJECTS_REPO_NAME;
			iss.type = 'project';
		}
		else {
			iss.repo = DEFAULT_REPO_NAME;
			iss.type = 'page';
		}
	}
	iss.build = iss.build || {};
	return iss;
}



function render (issues) {
	issues = issues.map(completeIssueModel);
	issues = helper.mergeArrays(issues, data.bookmarks);

	if (issues.length) {
		issues.forEach(is => {
			bookmarks.update(is.id, { name: is.name, state: is.state });
		});
	}
	Module.set('bookmarks', issues);
	return issues;
}


function oninit () {
	$.on(EVENT.bookmark.add, addBookmark);
	$.on(EVENT.bookmark.remove, removeBookmark.bind(this));
	$.on(EVENT.bookmark.toggle, toggleBookmark);

	$.on(EVENT.section.refresh, sectionRefresh);
	$.on(EVENT.section.change, sectionChanged);
	$.on(EVENT.url.change.done, (wv, i) => onUrlChanged.call(this, i));
	$.on(EVENT.frame.domchanged, onUrlChanged.bind(this));
}


function sectionRefresh (id) {
	if (id === 'bookmarks') refresh(true);
}

function sectionChanged (id) {
	if (id === 'bookmarks' && !data.bookmarks.length) refresh();
}

Module = new Ractive({
	el: '#subnav .subnav-bookmarks .subnav-section-list',
	data,
	template,
	oninit,
	components: { RepoTitle, IssueBox },
	computed,
	transitionsEnabled: false
});

module.exports = Module;
