const Ractive = require('ractive');
const { EVENT, config, history } = require('../services');
const $ = require('../util');
const Drops = require('./drops');

const baseUrl = $.rtrim(config.get('baseUrl'), '/');
const repoToSearch = config.get('repoToSearch');

const template = '<div class="addressbox" value="{{value}}"></div>';
const issueTypeCls = {
	pr: 'ion-ios-git-pull-request',
	issue: 'ion-ios-bug-outline',
	project: 'ion-ios-cube-outline',
	page: 'ion-ios-document-outline',
	default: 'ion-ios-document-outline',
};

function data () {
	return { value: '' };
}

function dataSrc (val) {
	return history.find(val, 20);
}


function itemRenderer (item) {
	const name = item.highlighted ? item.highlighted.name : item.name;
	const url = item.highlighted ? item.highlighted.url : item.url;
	const icon = issueTypeCls[item.type] || issueTypeCls.default;
	return `<i class="issue-icon ${icon}"></i>
		<div class="item-name">${name}</div>
		<span class="item-url">${url}</span>`;
}


// BaseURL/Group/RepoName/issues?q=is:open is:issue...
function getSearchUrl (q) {
	const query = 'issues?q=is:open is:issue ' + q;
	return [baseUrl, repoToSearch, query].join('/');
}

function onUrlChanged (webview, issue) {
	this.drops.value = webview.getURL();
	this.set('value', this.drops.value);
	if (issue) {
		issue.visited = new Date();
		history.add(issue);
	}
}


function onSelect (item) {
	onSearch.call(this, item.url);
}

function onSearch (url) {
	const validUrl = $.parseUrl(url);
	// not a URL - do search
	if (!validUrl) url = getSearchUrl(url);
	if (this.get('value') === url) return;
	this.drops.blur();	// make sure it won't steal the focus on value change
	this.set('value', url);
	this.fire('urlchange', {}, url);
}


function oninit () {
	$.on(EVENT.url.change.done, onUrlChanged.bind(this));
	$.on(EVENT.address.focus, () => this.drops.select());
}

function onrender () {
	this.drops = new Drops('.addressbox', {
		dataSrc,
		valueField: 'url',
		itemRenderer,
		searchInFields: ['name', 'url'],
		maxHeight: 10,
	});

	this.drops.on('select', onSelect.bind(this));
	this.drops.on('search', onSearch.bind(this));
}


module.exports = Ractive.extend({ template, data, oninit, onrender });
