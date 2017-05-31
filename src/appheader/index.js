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
	$.trigger(EVENT.bookmark.add);
}

function unstar () {
	$.trigger(EVENT.bookmark.remove);
}


function onUrlChanged (webview, issue) {
	this.set('title', issue && issue.name || 'Github Browser');
}


function oninit () {
	this.on({ openBrowser, copyUrl, star, unstar });
	$.on(EVENT.url.change.done, onUrlChanged.bind(this));
	$.on(EVENT.bookmark.exists, isIt => this.set('starred', isIt));
	$.on(EVENT.bookmark.add, () => this.set('starred', true));
	$.on(EVENT.bookmark.remove, () => this.set('starred', false));
}

module.exports = new Ractive({
	el: '#appheader',
	data,
	template,
	oninit,
});

