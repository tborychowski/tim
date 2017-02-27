module.exports = {
	address: {
		input: {
			key: 'when typing into the address bar',
			end: 'when typing into the address bar has finished'
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
		click: 'document-click'
	},
	frame: {
		goto: 'set the url for the main frame',
		focused: 'frame-focused',
		find: 'find-in-page',
		purge: 'purge-frame-cache',
		devtools: 'frame-devtools-toggle'
	},
	history: {
		focus: 'focus on the search results'
	},
	menu: {
		click: 'main menu has been clicked'
	},
	notifications: {
		toggle: 'notifications-toggle',
		devtools: 'notification-devtools-toggle'
	},
	contextmenu: {
		show: 'show-contextmenu',
		hide: 'hide-contextmenu'
	},
	settings: {
		show: 'show-settings',
		changed: 'on settings changed'
	},
	swipe: {
		start: 'swipe-start',
		end: 'swipe-end'
	},
	url: {
		change: {
			start: 'url-change-start',
			end: 'url-change-end',
			to: 'change-url',
			done: 'url-changed'
		}
	}
};
