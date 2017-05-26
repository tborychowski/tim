const Ractive = require('ractive');
const $ = require('../util');
const { EVENT } = require('../services');
const AddressBox = require('./addressbox');
const IssueBox = require('./issuebox');

const template = `
	<button class="header-btn js-prev ion-md-arrow-back" title="Back" on-click="prev"></button>
	<button class="header-btn js-next ion-md-arrow-forward" title="Forward" on-click="next"></button>
	<button class="header-btn js-refresh ion-md-refresh" title="Refresh" on-click="refresh"></button>
	<button class="header-btn js-stop ion-md-close" title="Stop" on-click="stop"></button>
	<div class="addressbar-wrapper" class-loading="{{loading}}" class-error="{{error}}">
		<AddressBox value={{url}} on-urlchange="addressChange" />
		<i class="loader"></i>
		<i class="error ion-ios-alert-outline" title="Cannot connect to github. Check your network."></i>
	</div>
	<IssueBox value="{{issueID}}" on-idchange="addressChange"/>
`;


const data = {
	loading: false,
	error: false,
	url: '',
	issueID: ''
};


// function star (exists) {
// 	// starBox.toggleClass('is-starred', !!exists);
// 	$.trigger(EVENT.bookmark.exists, !!exists);
// }

function checkIfBookmarked (url) {
	if (url.indexOf('#') > -1) url = url.substr(0, url.indexOf('#'));
	// bookmarks.getByUrl(url).then(star);
}


function gotoUrl (url) {
	if (url) this.set('url', url.trim());
	url = this.get('url');

	// star(false);
	if (url) $.trigger(EVENT.frame.goto, url);
	$.trigger(EVENT.address.input.end);
}


function onUrlChanged (webview, issue) {
	this.set('url', issue.url);
	this.set('issueID', (issue && issue.id ? issue.id : ''));
	if (issue && issue.url) checkIfBookmarked(issue.url);
}



function addressChange (e) {
	gotoUrl.call(this, e.url);
}


function oninit () {
	this.on({ addressChange, });
	$.on(EVENT.url.change.to, gotoUrl.bind(this));
	$.on(EVENT.url.change.done, onUrlChanged.bind(this));
}


module.exports = new Ractive({
	el: '#toolbar',
	data,
	template,
	oninit,
	components: { AddressBox, IssueBox },
});
