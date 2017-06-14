const { Menu, app } = require('electron').remote;
const { EVENT, helper, config } = require('../services');
const $ = require('../util');
const name = app.getName();
const ver = app.getVersion();

const menuTemplate = [
	{
		label: 'GithubBrowser',
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },

			{ label: 'Check for Updates...', click: () => $.trigger(EVENT.updater.check) },
			{ label: 'Changelog', click: () => helper.openChangelog(ver) },
			{ type: 'separator' },

			{
				label: 'Preferences...',
				accelerator: 'CmdOrCtrl+,',
				click: () => $.trigger(EVENT.settings.show)
			},
			{ type: 'separator' },

			{ role: 'services', submenu: [] },
			{ type: 'separator' },

			{ label: 'Hide ' + name, accelerator: 'Command+H', role: 'hide' },
			{ label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
			{ label: 'Show All', role: 'unhide' },
			{ type: 'separator' },

			{ role: 'quit' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'pasteandmatchstyle' },
			{ role: 'delete' },
			{ role: 'selectall' },
			{ type: 'separator' },
			{
				label: 'Find',
				accelerator: 'CmdOrCtrl+F',
				click: () => $.trigger(EVENT.search.start)
			}
		]
	},
	{
		label: 'View',
		submenu: [
			{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click: () => $.trigger(EVENT.frame.goto, 'refresh')
			},
			{
				label: 'Reload sidebar',
				accelerator: 'CmdOrCtrl+E',
				click: () => $.trigger(EVENT.section.refresh, config.get('state.section'))
			},
			{
				label: 'Focus address bar',
				accelerator: 'CmdOrCtrl+L',
				click: () => $.trigger(EVENT.address.focus)
			},
			{ type: 'separator' },
			{
				label: 'Reset Zoom',
				accelerator: 'CmdOrCtrl+0',
				click: () => $.trigger(EVENT.frame.resetzoom)
			},
			{
				label: 'Zoom In',
				accelerator: 'CmdOrCtrl+Plus',
				click: () => $.trigger(EVENT.frame.zoomin)
			},
			{
				label: 'Zoom Out',
				accelerator: 'CmdOrCtrl+-',
				click: () => $.trigger(EVENT.frame.zoomout)
			},
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	},
	{
		label: 'Goto',
		submenu: [
			{
				label: 'Notifications',
				accelerator: 'CmdOrCtrl+1',
				click: () => $.trigger(EVENT.section.change, 'notifications')
			},
			{
				label: 'Bookmarks',
				accelerator: 'CmdOrCtrl+2',
				click: () => $.trigger(EVENT.section.change, 'bookmarks')
			},
			{
				label: 'My Issues',
				accelerator: 'CmdOrCtrl+3',
				click: () => $.trigger(EVENT.section.change, 'myissues')
			},
		]
	},
	{
		label: 'Page',
		submenu: [
			{
				label: 'Copy Link',
				accelerator: 'CmdOrCtrl+P',
				click: () => $.trigger(EVENT.address.copy)
			},
			{
				label: 'Open in browser',
				accelerator: 'CmdOrCtrl+O',
				click: () => helper.openInBrowser(config.get('state.url')),
			},
			{
				label: 'Toggle bookmark',
				accelerator: 'CmdOrCtrl+Shift+B',
				click: () => $.trigger(EVENT.bookmark.toggle)
			},
		]
	},
	{
		role: 'window',
		submenu: [
			{ role: 'minimize' },
			{ role: 'close' }
		]
	},
	{
		label: 'Dev',
		submenu: [
			{ role: 'toggledevtools' },
			{
				label: 'Toggle Main Frame Developer Tools',
				accelerator: '',
				click: () => $.trigger(EVENT.frame.devtools)
			},
			{
				label: 'Toggle Notifications Developer Tools',
				accelerator: '',
				click: () => $.trigger(EVENT.notifications.devtools)
			},
			{ type: 'separator' },
			{
				label: 'Purge Everything (settings, cookies, history)',
				accelerator: 'CmdOrCtrl+Shift+Backspace',
				click: () => $.trigger(EVENT.frame.purge)
			}
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Github Page',
				click: () => helper.openInBrowser('https://github.com/tborychowski/github-browser')
			}
		]
	}
];



function init () {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
}


module.exports = {
	init
};
