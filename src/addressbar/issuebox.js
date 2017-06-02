const Ractive = require('ractive');
const { EVENT, config } = require('../services');
const $ = require('../util');

const baseUrl = $.rtrim(config.get('baseUrl'), '/');
const repoToSearch = config.get('repoToSearch');
let lastID = '';

const template = `
	<input
		class="issueidbox"
		autocomplete="on"
		placeholder="#"
		tabindex="3"
		on-focus="onFocus"
		on-keypress="onKeypress"
		on-keyup="onKeyup"
		on-keydown="onKeydown"
		on-paste="onPaste"
		value="{{value}}"
	/>
`;


function data () {
	return {
		value: ''
	};
}


function onUrlChanged (webview, issue) {
	if (issue && issue.id) lastID = issue.id;
}

function onFocus (e) {
	e.node.select();
	$.trigger(EVENT.address.input.end);
}

function onKeypress (e) {
	if (e.original.key === 'Enter') {
		const url = [baseUrl, repoToSearch, 'issues', e.node.value].join('/');
		this.fire('idchange', {}, url);
	}
}

function onKeydown (e) {
	const key = e.original.key;
	if (key === 'Escape') {
		e.node.value = lastID;
		e.node.select();
	}
	else if (!$.isNumberField(e.original)) return e.original.preventDefault();
}

function onKeyup (e) {
	const val = e.node.value;
	if (!(/^\d*$/).test(val)) e.node.value = parseInt(val, 10) || '';
}

function onPaste (e) {
	const pasteText = e.original.clipboardData && e.original.clipboardData.getData('Text');
	if (!(/^\d*$/).test(pasteText)) e.original.preventDefault();
}



function oninit () {
	this.on({ onFocus, onKeypress, onKeyup, onKeydown, onPaste });
	$.on(EVENT.url.change.done, onUrlChanged.bind(this));
}


module.exports = Ractive.extend({ template, data, oninit, });
