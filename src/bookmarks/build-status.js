const Ractive = require('ractive');
const { github, helper } = require('../services');
const $ = require('../util');


const statusIconCls = {
	failure: 'ion-md-alert',
	aborted: 'ion-md-alert',
	success: 'ion-md-checkmark-circle',
	merged: 'ion-md-checkmark-circle',
	progress: 'ion-md-time'
};


function openCI (e) {
	const url = e.get().url;
	if (url) helper.openInBrowser(url);
	return false;
}


function updateStatus (pr, status) {
	if (!status) return;
	pr.build = {
		result: status.result ? status.result : status.progress < 100 ? 'progress' : '',
		progress: status.progress,
		url: status.url,
	};

	// set this for merged PRs, update the issue in the parent component
	if (status.merged) this.set('issue.state', 'merged');

	this.update();		// updates ractive component
	if (pr.build.timer) clearTimeout(pr.build.timer);
	if (!status.result) pr.build.timer = setTimeout(() => monitorPr.call(this, pr), 15000);
}


async function monitorPr (pr) {
	const status = await github.getBuildStatus(pr)
	updateStatus.call(this, pr, status);
}


const template = `
	{{#with issue.build}}
	<a href="{{url}}" class="build-status {{result}}" title="{{buildTitle(result)}}" on-click="openCI">
		<i class="icon {{buildIcon(result)}}"></i>
		<div class="build-progress">
			<div class="build-progress-inner" style-width="{{progress || 0}}%"></div>
		</div>
	</a>
	{{/with}}
`;


function data () {
	return {
		issue: {},
		buildTitle: result => result ? $.ucfirst(result) : 'Open build job',
		buildIcon: result => statusIconCls[result],
	};
}

function oninit () {
	this.on({ openCI });
	// this.observe('issue', function (value) {
	// 	if (this.el && value) this.monitorPr(value);
	// });
}

function onrender () {
	monitorPr.call(this, this.get('issue'));
}

module.exports = Ractive.extend({ template, data, oninit, onrender });
