const Ractive = require('ractive');
const fade = require('ractive-transitions-fade');
const { EVENT, bookmarks, github, helper, config } = require('../services');
const $ = require('../util');
const BuildStatus = require('./build-status');

let Module;
const DEFAULT_REPO_NAME = 'Pages';				// for ungrouped pages
const DEFAULT_PROJECTS_REPO_NAME = 'Projects';	// for ungrouped projects
const issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	project: 'ion-ios-cube-outline',
	page: 'ion-ios-document-outline',
	default: 'ion-ios-document-outline',
};


const template = `
	{{#groupedBookmarks:repo}}
		<div class="repo-box">
			<h2>
				{{#if hasUrl }}
					<a href="{{repoUrl}}" class="hdr" on-click="openRepo">{{repoShortName}}</a>
				{{else}}
					<span class="hdr">{{repoShortName}}</span>
				{{/if}}
			</h2>
			<ul class="repo-box-issues">
				{{#items}}
					<li class="issue-box {{issueCls(this)}} {{state}} type-{{type}} {{unread ? 'unread' : ''}}" fade-in-out>
						<i class="issue-icon {{issueIcon(this)}}"></i>
						<a href="{{url}}" class="btn bookmark" title="{{id || name}}" on-click="openIssue">{{name}}</a>
						{{#if type === 'pr'}}<BuildStatus issue="{{this}}" />{{/if}}
					</li>
				{{/items}}
			</ul>
		</div>
	{{/groupedBookmarks}}
`;


const data = {
	bookmarks: [],
	issueIcon: iss => issueTypeCls[iss.type],
	issueCls: iss => {
		const repo = (iss.repo || '').replace(/[/.]/g, '-').toLowerCase();
		const id = iss.id ? iss.id : iss.url.split('/').pop();
		return `issue-${repo}-${id}`;
	},
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
				hasUrl: true,
			};
		}
		return groups;
	}
};


let throttled = null;
const throttle = () => {
	if (throttled) clearTimeout(throttled);
	throttled = setTimeout(() => { throttled = null; }, 500);
};

function openIssue (e) {
	e.original.preventDefault();
	if (throttled) return throttle();	// clicked during quiet time
	if (e.original.metaKey || e.original.ctrlKey) return;
	throttle();
	const iss = e.get();
	if (iss) {
		iss.unread = false;
		bookmarks.setUnreadByUrl(iss.url, false);
		$.trigger(EVENT.url.change.to, iss.url);
	}
}


function openRepo (e) {
	if (e.original.metaKey || e.original.ctrlKey) return;
	$.trigger(EVENT.url.change.to, e.get().repoUrl);
	return false;
}


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

	this.on({ openRepo, openIssue });
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
	components: { BuildStatus },
	computed,
	transitions: { fade },
	transitionsEnabled: false
});

module.exports = Module;
