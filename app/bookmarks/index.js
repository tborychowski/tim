'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var $ = require('../util');

var _require = require('preact'),
    h = _require.h,
    render = _require.render,
    Component = _require.Component;

var Subsection = function (_Component) {
	_inherits(Subsection, _Component);

	function Subsection() {
		_classCallCheck(this, Subsection);

		return _possibleConstructorReturn(this, (Subsection.__proto__ || Object.getPrototypeOf(Subsection)).apply(this, arguments));
	}

	_createClass(Subsection, [{
		key: 'render',
		value: function render(props, state) {
			return h(
				'section',
				{ 'class': 'subnav-section subnav-' + props.type },
				h(
					'h1',
					null,
					$.ucfirst(props.type)
				),
				h('a', { href: '#', 'class': 'nav-icon-btn header-btn js-refresh ion-md-refresh', title: 'Refresh (r)', 'data-go': 'refresh' }),
				h('div', { 'class': 'subnav-section-list' })
			);
		}
	}]);

	return Subsection;
}(Component);

var Subnav = function (_Component2) {
	_inherits(Subnav, _Component2);

	function Subnav() {
		_classCallCheck(this, Subnav);

		return _possibleConstructorReturn(this, (Subnav.__proto__ || Object.getPrototypeOf(Subnav)).apply(this, arguments));
	}

	_createClass(Subnav, [{
		key: 'render',
		value: function render(props, state) {
			return h(
				'aside',
				{ id: 'subnav' },
				h(Subsection, { type: 'notifications' }),
				h(Subsection, { type: 'bookmarks' }),
				h(Subsection, { type: 'myissues' }),
				h(Subsection, { type: 'projects' })
			);
		}
	}]);

	return Subnav;
}(Component);

render(h(Subnav, null), document.body);

// const { config, EVENT, bookmarks, github, helper } = require('../services');
// const $ = require('../util');


// let isReady = false, el, reposEl;

// const DEFAULT_REPO_NAME = 'Pages';		// for ungrouped pages
// const DEFAULT_PROJECTS_REPO_NAME = 'Projects';	// for ungrouped projects

// const issueTypeCls = {
// 	pr: 'ion-ios-git-pull-request',
// 	issue: 'ion-ios-bug-outline',
// 	project: 'ion-ios-cube-outline',
// 	page: 'ion-ios-document-outline',
// 	default: 'ion-ios-document-outline',
// };

// const statusIconCls = {
// 	failure: 'ion-md-alert',
// 	aborted: 'ion-md-alert',
// 	success: 'ion-md-checkmark-circle',
// 	progress: 'ion-md-time'
// };


// function getIssueCls (i){
// 	const repo = (i.repo || '').replace(/[\/\.]/g, '-').toLowerCase();
// 	return i.id ? `issue-${repo}-${i.id}` : '';
// }

// function addBookmark (issue) {
// 	bookmarks.add(issue).then(refresh);
// }

// function removeBookmark (issue) {
// 	bookmarks.remove(issue).then(refresh);
// }

// function refresh (drawOnly) {
// 	const promise = bookmarks
// 		.get()
// 		.then(findRepoNames)
// 		.then(fillIssues);

// 	if (!drawOnly) {	// = full refresh
// 		promise
// 			.then(github.checkIssuesForUpdates)
// 			.then(updateUnread);
// 	}
// }

// let throttled = null;
// const throttle = () => {
// 	if (throttled) clearTimeout(throttled);
// 	throttled = setTimeout(() => { throttled = null; }, 1000);
// };

// function onClick (e) {
// 	e.preventDefault();

// 	if (throttled) return throttle();	// if clicked during quiet time - throttle again
// 	throttle();

// 	let target = $(e.target);

// 	if (target.is('.js-refresh')) return refresh();
// 	if (target.is('.btn')) return openIssue(target);

// 	target = target.closest('.build-status');
// 	if (target.length) return helper.openInBrowser(target.attr('href'));
// }


// function updateBuildStatus (pr, status) {
// 	if (!status) return;// statusBox.hide();

// 	const prBox = $(`.${getIssueCls(pr)}`);
// 	const statusBox = prBox.find('.build-status');
// 	const statusIcon = prBox.find('.build-status .icon');
// 	const progBoxIn = prBox.find('.build-progress-inner');

// 	// statusBox.show();

// 	const result = status.result ? status.result : status.progress < 100 ? 'progress' : '';
// 	if (result) statusBox[0].className = `build-status ${result}`;
// 	if (statusIconCls[result]) statusIcon[0].className = `icon ${statusIconCls[result]}`;
// 	if (statusBox.length) {
// 		statusBox[0].title = $.ucfirst(status.result) || 'Open build job';
// 		statusBox[0].href = pr.buildUrl;
// 	}
// 	if (progBoxIn.length) {
// 		progBoxIn[0].style.width = status.progress + '%';
// 	}
// 	if (!status.result) setTimeout(() => monitorPr(pr), 10000);
// }


// function monitorPr (pr) {
// 	github
// 		.getBuildStatus(pr)
// 		.then(status => updateBuildStatus(pr, status));
// }


// function getIssueHtml (issue) {
// 	let statusBox = '';
// 	if (issue.type === 'pr') {
// 		monitorPr(issue);
// 		statusBox = '<a href="#" class="build-status"><i class="icon"></i>' +
// 			'<div class="build-progress"><div class="build-progress-inner"></div></div></a>';
// 	}
// 	const cls = ['issue-box', getIssueCls(issue), issue.state, `type-${issue.type}`];
// 	if (issue.unread) cls.push('unread');
// 	return `<li class="${cls.join(' ')}">
// 		<i class="issue-icon ${issueTypeCls[issue.type || 'default']}"></i>
// 		<a href="${issue.url}" class="btn bookmark" title="${issue.id}">${issue.name}</a>
// 		${statusBox}
// 	</li>`;
// }


// function getRepoHtml (repo) {
// 	const issuesHtml = repo.items.map(getIssueHtml).join('');
// 	let repoName = repo.name.split('/').pop();
// 	const url = `${config.get('baseUrl')}${repo.name}/issues`;

// 	if (repoName === DEFAULT_REPO_NAME || repoName === DEFAULT_PROJECTS_REPO_NAME) {
// 		repoName = `<span class="hdr">${repoName}</span>`;
// 	}
// 	else repoName = `<a href="${url}" class="hdr btn">${repoName}</a>`;

// 	return `<div class="repo-box ${repo.name}"><h2>${repoName}</h2>
// 		<ul class="repo-box-issues">${issuesHtml}</ul>
// 	</div>`;
// }


// function findRepoNames (issues) {
// 	return issues.map(iss => {
// 		if (!iss.repo) {
// 			if (helper.getPageActualTypeFromUrl(iss.url) === 'project') {
// 				iss.repo = DEFAULT_PROJECTS_REPO_NAME;
// 				iss.type = 'project';
// 			}
// 			else {
// 				iss.repo = DEFAULT_REPO_NAME;
// 				iss.type = 'page';
// 			}
// 		}
// 		return iss;
// 	});
// }


// function fillIssues (issues) {
// 	const remap = {};
// 	issues.forEach(iss => {
// 		remap[iss.repo] = remap[iss.repo] || { name: iss.repo, items: [] };
// 		if (iss.url) remap[iss.repo].items.push(iss);
// 	});

// 	const html = [];
// 	for (let repo in remap) html.push(getRepoHtml(remap[repo]));
// 	reposEl.html(html.join(''));
// 	return issues;
// }


// function updateUnread (issues) {
// 	const unread = issues.filter(i => i.unread);

// 	unread.forEach(issue => {
// 		bookmarks.setUnread(issue.id, true);
// 		$(`.${getIssueCls(issue)}`).addClass('unread');
// 	});

// 	issues.forEach(issue => {
// 		bookmarks.update(issue.id, { name: issue.name, state: issue.state });
// 		$(`.${getIssueCls(issue)}`)
// 			.addClass(issue.state)
// 			.find('.bookmark')
// 			.html(issue.name);
// 	});
// 	$.trigger(EVENT.section.badge, 'bookmarks', unread.length);
// }


// function openIssue (iel) {
// 	const url = iel.attr('href');
// 	const iBox = iel.closest('.unread');
// 	if (iBox && iBox.length) iBox.removeClass('unread');
// 	$.trigger(EVENT.url.change.to, url);
// }


// function onUrlChanged (wv, issue) {
// 	if (!issue || !issue.url) return;
// 	bookmarks.setUnreadByUrl(issue.url, false).then(res => {
// 		if (res) refresh(true);
// 	});
// }

// function init () {
// 	if (isReady) return;

// 	el = $('.subnav-bookmarks');
// 	reposEl = el.find('.subnav-section-list');

// 	refresh();

// 	el.on('click', onClick);
// 	$.on(EVENT.bookmark.add, addBookmark);
// 	$.on(EVENT.bookmark.remove, removeBookmark);
// 	$.on(EVENT.bookmarks.refresh, refresh);

// 	$.on(EVENT.url.change.done, onUrlChanged);


// 	isReady = true;
// }


// module.exports = {
// 	init
// };