const Ractive = require('ractive');
const { EVENT, config } = require('../services');
const $ = require('../util');

const baseUrl = $.rtrim(config.get('baseUrl'), '/');
const repoToSearch = config.get('repoToSearch');


const template = `
	<input
		class="issueidbox"
		autocomplete="on"
		placeholder="#"
		tabindex="3"
		on-focus="onIssueboxFocus"
		on-keypress="onIssueboxKeypress"
		on-keyup="onIssueboxKeyup"
		on-keydown="onIssueboxKeydown"
		on-paste="onIssueboxPaste"
		value="{{value}}"
	/>
`;


function data () {
	return {
		value: ''
	};
}



function onIssueboxFocus (e) {
	e.node.select();
	$.trigger(EVENT.address.input.end);
}

function onIssueboxKeypress (e) {
	if (e.original.key === 'Enter') {
		const url = [baseUrl, repoToSearch, 'issues', e.node.value].join('/');
		this.fire('idchange', { url });
	}
}

function onIssueboxKeydown (e) {
	if (!$.isNumberField(e.original)) return e.original.preventDefault();
}

function onIssueboxKeyup (e) {
	const val = e.node.value;
	if (!(/^\d*$/).test(val)) e.node.value = parseInt(val, 10) || '';
}

function onIssueboxPaste (e) {
	const pasteText = e.original.clipboardData && e.original.clipboardData.getData('Text');
	if (!(/^\d*$/).test(pasteText)) e.original.preventDefault();
}



function oninit () {
	this.on({
		onIssueboxFocus, onIssueboxKeypress, onIssueboxKeyup, onIssueboxKeydown, onIssueboxPaste
	});
}


module.exports = Ractive.extend({ template, data, oninit, });
