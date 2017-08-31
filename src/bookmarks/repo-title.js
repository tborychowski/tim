const Ractive = require('ractive');
const { EVENT } = require('../services');
const $ = require('../util');


const template = `
	<h2>
		{{#if url }}
			<a href="{{url}}" class="hdr" on-click="openRepo">{{title}}</a>
		{{else}}
			<span class="hdr">{{title}}</span>
		{{/if}}
	</h2>
`;


function data () {
	return {
		title: '',
		url: ''
	};
}


function openRepo (e) {
	if (e.original.metaKey || e.original.ctrlKey) return;
	$.trigger(EVENT.url.change.to, e.get().url);
	return false;
}


function oninit () {
	this.on({ openRepo });
}

module.exports = Ractive.extend({ template, data, oninit });
