/**
 * Search Box component
 *
 * it's included in the main addressbar component
 *
 */

const Ractive = require('ractive');
const { EVENT } = require('../services');
const $ = require('../util');


const template = `
	<div id="search-bar" class-hidden="!visible">
		<input class="search-input" value="{{term}}" on-keyup="onkeyup" tabindex="4" placeholder="Find in page" />
		<span class="search-info">{{info()}}</span>
		<button {{#if !total}}disabled{{/if}} class="btn-prev ion-ios-arrow-up" title="Previous" on-click="findPrev" tabindex="5"></button>
		<button {{#if !total}}disabled{{/if}} class="btn-next ion-ios-arrow-down" title="Next" on-click="findNext" tabindex="6"></button>
		<button class="btn-close ion-md-close" title="Close" on-click="hide" tabindex="7"></button>
	</div>
`;


function data () {
	return {
		term: '',
		no: 0,
		total: 0,
		visible: false,
		info: () => {
			if (!this.get('term')) return '';
			if (!this.get('total')) return 'no results';
			return `${this.get('no')} of ${this.get('total')}`;
		},
	};
}


function highlightFindings (options = { findNext: false, forward: true }) {
	if (!this.webview) return;
	const text = this.get('term');
	if (text) this.webview.findInPage(text, options);
	else {
		this.set('total', 0);
		this.webview.stopFindInPage('keepSelection');
	}
}

function findNext () { highlightFindings.call(this, { findNext: true }); }

function findPrev () { highlightFindings.call(this, { findNext: true, forward: false }); }

function foundInPage (ev) {
	const total = ev.result.matches || 0;
	this.set('no', ev.result.activeMatchOrdinal || 0);
	this.set('total', total);
}


function show () {
	if (!this.get('visible')) this.set('visible', true);
	this.input.focus();
}


function hide () {
	if (!this.get('visible')) return;
	const term = this.get('term');
	this.set('visible', false);
	this.set('term', '');
	highlightFindings.call(this);
	if (term) this.webview.focus();
	else $.trigger(EVENT.address.focus);
}


function onkeyup (e) {
	const key = e.original.key;
	const shift = e.original.shiftKey;
	if (key === 'Escape') hide.call(this);
	else if (key === 'Enter') {
		if (shift) findPrev.call(this);
		else findNext.call(this);
	}
}


function oninit () {
	this.on({ hide, findPrev, findNext, onkeyup });
	this.observe('term', () => { highlightFindings.call(this); });
	$.on(EVENT.search.start, show.bind(this));
	$.on(EVENT.search.stop, hide.bind(this));

}

function oncomplete () {
	this.webview = document.querySelector('#frame webview');
	this.webview.addEventListener('found-in-page', foundInPage.bind(this));
	this.input = this.el.querySelector('.search-input');

}

module.exports = Ractive.extend({ template, data, oninit, oncomplete });
