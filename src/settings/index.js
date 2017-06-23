const Ractive = require('ractive');
const $ = require('../util');
const {dialog} = require('electron').remote;
const { config, EVENT, helper } = require('../services');


const template = `
	<div class="settings-overlay" on-click="hideSettings"></div>
	<div class="settings-window">
		<form class="settings-form" on-submit="saveSettings">
			<h1>Preferences</h1>
			<div class="settings-scroller">
				{{#with settings}}

					<h2>Essentials</h2>
					<label>Base URL: <input value="{{baseUrl}}" required></label>
					<label>Github Token: <input class="input-token" placeholder="token ID" value="{{ghToken}}">
						<button type="button" on-click="generateToken">Generate</button>
					</label>
					<span class="settings-info-text">(make sure to select: <b>"repo/public_repo"</b> and <b>"notifications"</b> scopes)</span>

					<label>Default repo: <input placeholder="owner/repo-name" value="{{repoToSearch}}"></label>
					<span class="settings-info-text">e.g. facebook/react</span>
					<span class="settings-info-text">this will be used for Projects tab, searching, etc.</span>


					<h2>Optional</h2>
					<label>CI URL: <input placeholder="e.g. Travis or Jenkins base URL" value="{{ciUrl}}"></label>
					<span class="settings-info-text">This will allow to monitor job build status on bookmarked PRs</span>
					<label>Default Browser: <input class="input-browser" placeholder="use the OS default browser or select" value="{{browser}}">
						<button type="button" on-click="findBrowser">...</button>
					</label>
					<span class="settings-info-text">This will allow to open pages in another browser</span>

				{{/with}}
			</div>
			<div class="settings-buttons">
				<button type="button" class="btn-left" on-click="openFolder">Open settings folder</button>
				<button type="button" on-click="hideSettings">Cancel</button>
				<button type="submit" class="btn-main">Save</button>
			</div>
		</form>
	</div>
`;


const data = {
	visible: false,
	settings: {
		baseUrl: '',
		ghToken: '',
		repoToSearch: '',
		ciUrl: '',
		browser: '',
	}
};


function openFolder () {
	helper.openSettingsFolder();
}

function generateToken () {
	let baseUrl = config.get('baseUrl');
	if (!baseUrl) baseUrl = this.get('settings.baseUrl');
	if (!baseUrl) return;
	helper.openInBrowser($.trim(baseUrl, '/') + '/settings/tokens');
}

function findBrowser () {
	let defaultPath = helper.applicationsPath();
	const opts = {title: 'Select browser', buttonLabel: 'Select', defaultPath, properties: ['openFile']};
	const cb = res => {
		if (res) this.set('settings.browser', res[0]);
	};
	dialog.showOpenDialog(opts, cb.bind(this));
}


function validate (settings) {
	let baseUrl = this.get('settings.baseUrl');
	if (!baseUrl) return false;
	if (baseUrl.indexOf('http') < 0) baseUrl = `https://${baseUrl}`;
	this.set('settings.baseUrl', $.rtrim(settings.baseUrl, '/') + '/');
	return settings;
}

function showSettings () {
	if (data.visible) return;
	this.set('visible', true);
	this.set('settings', config.get());
	this.el.style.display = 'block';

	setTimeout(() => {
		document.body.classList.add('show-settings');
		this.el.querySelector('input').focus();
	}, 100);
}

function hideSettings () {
	if (!data.visible) return;
	document.body.classList.remove('show-settings');
	setTimeout(() => {
		this.set('visible', false);
		this.el.style.display = 'none';
	}, 400);
}

function saveSettings (e) {
	e.original.preventDefault();
	const old = config.get();
	const nw = this.get('settings');
	let merged = Object.assign({}, old, nw);
	merged = validate.call(this, merged);
	if (merged === false) return;
	config.set(merged);
	$.trigger(EVENT.settings.changed);
	hideSettings.call(this);
}


function onKeyUp (e) {
	if (e.key === 'Escape') return hideSettings.call(this);
}

function documentClicked (e) {
	if (e && e.target && e.target.closest('.settings')) return;
	hideSettings.call(this);
}


function oninit () {
	this.on({ generateToken, openFolder, findBrowser, hideSettings, saveSettings });
	this.documentClicked = documentClicked.bind(this);
	$.on(EVENT.settings.show, showSettings.bind(this));
	document.addEventListener('keyup', onKeyUp.bind(this));
}

module.exports = new Ractive({
	el: '.settings',
	data,
	template,
	oninit,
});

