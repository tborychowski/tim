const Ractive = require('ractive');
const $ = require('../util');
const { EVENT } = require('../services');
const AddressBox = require('./addressbox');
const IssueBox = require('./issuebox');

const template = `
	<div class="addressbar-inner" class-loading="loading" class-error="error">
		<button class="btn-prev ion-md-arrow-back" class-disabled="cantGoBack" title="Back" on-click="prev"></button>
		<button class="btn-next ion-md-arrow-forward" class-disabled="cantGoForward" title="Forward" on-click="next"></button>
		<button class="btn-refresh ion-md-refresh" title="Refresh" on-click="refresh"></button>
		<button class="btn-stop ion-md-close" title="Stop" on-click="stop"></button>
		<div class="addressbox-wrapper">
			<AddressBox value={{url}} on-urlchange="addressChange" />
			<i class="loader"></i>
			<i class="error ion-ios-alert-outline" title="Cannot connect to github. Check your network."></i>
		</div>
		<IssueBox value="{{issueID}}" on-idchange="addressChange"/>
	</div>
`;


const data = {
	loading: false,
	error: false,
	cantGoBack: true,
	cantGoForward: true,
	url: '',
	issueID: ''
};


function gotoUrl (url) {
	if (url) this.set('url', url.trim());
	url = this.get('url');
	if (url) $.trigger(EVENT.frame.goto, url);
	$.trigger(EVENT.address.input.end);
}


function onUrlChanged (webview, issue) {
	const url = (issue && issue.url ? issue.url : webview.getURL());
	this.set('url', url);
	this.set('issueID', (issue && issue.id ? issue.id : ''));
	this.set('cantGoBack', !webview.canGoBack());
	this.set('cantGoForward', !webview.canGoForward());
}



function addressChange (e) {
	gotoUrl.call(this, e.url);
}

function prev () {
	$.trigger(EVENT.frame.goto, 'prev');
}

function next () {
	$.trigger(EVENT.frame.goto, 'next');
}

function refresh () {
	$.trigger(EVENT.frame.goto, 'refresh');
}

function stop () {
	$.trigger(EVENT.frame.goto, 'stop');
}


function oninit () {
	this.on({ addressChange, prev, next, refresh, stop });
	$.on(EVENT.url.change.start, () => this.set('loading', true));
	$.on(EVENT.url.change.end, () => this.set('loading', false));
	$.on(EVENT.url.change.to, gotoUrl.bind(this));
	$.on(EVENT.url.change.done, onUrlChanged.bind(this));
}


module.exports = new Ractive({
	el: '#addressbar',
	data,
	template,
	oninit,
	components: { AddressBox, IssueBox },
});
