'use strict';

module.exports = {
	address: {
		input: {
			key: 'address-input',
			end: 'address-input-end'
		},
		focus: 'focus-address',
		issueFocus: 'focus-issue-box'
	},
	bookmark: {
		add: 'add-bookmark',
		remove: 'remove-bookmark',
		toggle: 'bookmark-toggle',
		exists: 'bookmark-exists'
	},
	bookmarks: {
		refresh: 'refresh-bookmarks'
	},
	connection: {
		error: {
			show: 'show-connection-error',
			hide: 'hide-connection-error'
		}
	},
	contextmenu: {
		show: 'show-contextmenu',
		hide: 'hide-contextmenu'
	},
	document: {
		clicked: 'document-clicked',
		keyup: 'document-keyup'
	},
	frame: {
		goto: 'frame-goto-url',
		focused: 'frame-focused',
		purge: 'purge-frame-cache',
		lookup: 'show-definition-for-selection',
		devtools: 'frame-devtools-toggle',
		zoomin: 'frame-zoom-in',
		zoomout: 'frame-zoom-out',
		resetzoom: 'frame-zoom-reset'
	},
	history: {
		focus: 'focus-search-results'
	},
	menu: {
		click: 'menu-clicked'
	},
	myissues: {
		refresh: 'refresh-my-issues'
	},
	nav: {
		goto: 'nav-goto'
	},
	notifications: {
		toggle: 'notifications-toggle',
		devtools: 'notification-devtools-toggle',
		count: 'notifications-count-updated',
		refresh: 'refresh-notifications',
		reload: 'reload-notifications'
	},
	preview: 'show-preview',
	projects: {
		refresh: 'refresh-projects'
	},
	search: {
		start: 'start-search',
		stop: 'stop-search'
	},
	section: {
		refresh: 'refresh-section',
		badge: 'set-section-badge'
	},
	settings: {
		show: 'show-settings',
		changed: 'on settings changed'
	},
	swipe: {
		start: 'swipe-start',
		end: 'swipe-end'
	},
	updater: {
		check: 'check-for-updates',
		nav: {
			show: 'update-nav-show',
			clicked: 'update-nav-clicked'
		}
	},
	url: {
		change: {
			start: 'url-change-start',
			done: 'url-changed', // url started changing or changed to issue; not yet fully loaded
			end: 'url-change-end',
			to: 'change-url'
		}
	}
};