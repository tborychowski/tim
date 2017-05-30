const Ractive = require('ractive');
const { config, EVENT, helper } = require('../services');
const $ = require('../util');


const template = `
	<button class="btn-right ion-md-open" title="Open in browser" on-click="openBrowser"></button>
	<button class="btn-right ion-md-link" title="Copy link" on-click="copyUrl"></button>
	<span class="copy-link-confirmation" class-flash="flashing">Link copied!</span>
	<div class="star-box" class-starred="starred">
		<button class="btn-star ion-ios-bookmark-outline" title="Bookmark" on-click="star"></button>
		<button class="btn-unstar ion-ios-bookmark" title="Remove Bookmark" on-click="unstar"></button>
	</div>
	<h1>{{title}}</h1>
`;

const data = {
	title: 'Github Browser',
	starred: false,
	flashing: false
};

function openBrowser () {
	helper.openInBrowser(config.get('state.url'));
}

function copyUrl () {
	helper.copyToClipboard(config.get('state.url'));
	this.set('flashing', true);
	setTimeout(() => { this.set('flashing', false); }, 1800);

}

function star () {
	$.trigger(EVENT.bookmark.add, config.get('state.issue'));
	this.set('starred', true);
}

function unstar () {
	$.trigger(EVENT.bookmark.remove, config.get('state.issue'));
	this.set('starred', false);
}

function onUrlChanged (webview, issue) {
	this.set('title', issue && issue.name || 'Github Browser');
}


function oninit () {
	this.on({ openBrowser, copyUrl, star, unstar });
	$.on(EVENT.url.change.done, onUrlChanged.bind(this));
}

module.exports = new Ractive({
	el: '#appheader',
	data,
	template,
	oninit,
});

