const Ractive = require('ractive');
const { EVENT, config } = require('../services');
const $ = require('../util');

let lastFullUrl = '', searchTerm = null;
const baseUrl = $.rtrim(config.get('baseUrl'), '/');
const repoToSearch = config.get('repoToSearch');

const template = `
	<input class="addressbox"
		tabindex="1"
		on-focus="onfocus"
		on-input="oninput"
		on-keydown="onkeydown"
		on-keypress="onkeypress"
		value="{{value}}"
	/>
`;


function data () {
	return {
		value: ''
	};
}

function getFocusedText () {
	if (searchTerm) return searchTerm;
	return lastFullUrl;
}

// BaseURL/Group/RepoName/issues?q=is:open is:issue...
function getSearchUrl (q) {
	const query = 'issues?q=is:open is:issue ' + q;
	return [baseUrl, repoToSearch, query].join('/');
}


function onfocus () {
	setTimeout(() => { this.inputbox.select(); }, 10);
}

function onkeypress (e) {
	if (e.original.key === 'Enter') {
		let url = e.node.value;
		searchTerm = null;
		const validUrl = $.parseUrl(url);

		if (!validUrl) {	// not a URL - do search
			searchTerm = url;
			url = getSearchUrl(url);
		}
		lastFullUrl = url;
		this.fire('urlchange', { url });
	}
}

function onkeydown (e) {
	const key = e.original.key;
	if (key === 'ArrowDown') return $.trigger(EVENT.history.focus);
	if (key === 'Escape') {
		e.node.value = getFocusedText();
		e.node.select();
		$.trigger(EVENT.address.input.end);
	}
}

function oninput (e) {
	searchTerm = null;
	$.trigger(EVENT.address.input.key, e);
}


function oninit () {
	this.on({ onfocus, oninput, onkeydown, onkeypress });
	$.on(EVENT.address.focus, onfocus.bind(this));
}

function onrender () {
	this.inputbox = this.el.querySelector('.addressbar');
}


module.exports = Ractive.extend({ template, data, oninit, onrender });
