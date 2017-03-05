module.exports = {
	address: {
		input: {
			key: 'address-input',
			end: 'address-input-end'
		},
		focus: 'focus-address'
	},
	bookmark: {
		add: 'add-bookmark',
		remove: 'remove-bookmark',
	},
	connection: {
		error: {
			show: 'show-connection-error',
			hide: 'hide-connection-error',
		}
	},
	document: {
		click: 'document-clicked'
	},
	frame: {
		goto: 'frame-goto-url',
		focused: 'frame-focused',
		purge: 'purge-frame-cache',
		lookup: 'show-definition-for-selection',
		devtools: 'frame-devtools-toggle'
	},
	history: {
		focus: 'focus-search-results'
	},
	menu: {
		click: 'menu-clicked'
	},
	nav: {
		goto: 'nav-goto'
	},
	notifications: {
		toggle: 'notifications-toggle',
		devtools: 'notification-devtools-toggle',
		count: 'notifications-count-updated'
	},
	contextmenu: {
		show: 'show-contextmenu',
		hide: 'hide-contextmenu'
	},
	settings: {
		show: 'show-settings',
		changed: 'on settings changed'
	},
	search: {
		start: 'start-search',
		stop: 'stop-search'
	},
	swipe: {
		start: 'swipe-start',
		end: 'swipe-end'
	},
	updater: {
		check: 'check-for-updates',
	},
	url: {
		change: {
			start: 'url-change-start',
			done: 'url-changed',		// url started changing or changed to issue; not yet fully loaded
			end: 'url-change-end',
			to: 'change-url',
		}
	}
};
