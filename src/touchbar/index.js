const { TouchBar, getCurrentWindow } = require('electron').remote;
const { TouchBarButton, TouchBarSpacer, TouchBarSegmentedControl } = TouchBar;
const { EVENT, helper, config } = require('../services');
const $ = require('../util');
const imgPath = require('path').resolve(__dirname, '..', '..', 'assets');
let btnBookmark, sectionGroup;

const sectionMap = [ 'notifications', 'bookmarks', 'myissues' ];
const icon = name => `${imgPath}/tb-${name}.png`;


function bookmarkExists (exists) {
	const icons = { empty: icon('bookmark-outline'), full: icon('bookmark') };
	btnBookmark.backgroundColor = exists ? '#555' : '#444';
	btnBookmark.icon = exists ? icons.full : icons.empty;
}

function onSectionChange (id) {
	sectionGroup.selectedIndex = sectionMap.indexOf(id);
}

function triggerSectionChange (idx) {
	$.trigger(EVENT.section.change, sectionMap[idx]);
}

function initBar () {
	const spacer = new TouchBarSpacer({ size: 'flexible' });
	const btnOpen = new TouchBarButton({
		icon: icon('open'),
		click: () => helper.openInBrowser(config.get('state.url'))
	});

	btnBookmark = new TouchBarButton({
		icon: icon('bookmark-outline'),
		click: () => $.trigger(EVENT.bookmark.toggle)
	});

	sectionGroup = new TouchBarSegmentedControl({
		segmentStyle: 'rounded',
		segments: [
			{ label: 'Notifications' },
			{ label: 'Bookmarks' },
			{ label: 'My Issues' },
		],
		change: triggerSectionChange
	});

	return new TouchBar([ sectionGroup, spacer, btnBookmark, btnOpen ]);
}


function init () {
	getCurrentWindow().setTouchBar(initBar());

	$.on(EVENT.bookmark.exists, bookmarkExists);
	$.on(EVENT.bookmark.add, () => bookmarkExists(true));
	$.on(EVENT.bookmark.remove, iss => { if (!iss) bookmarkExists(false); });
	$.on(EVENT.section.change, onSectionChange);
}



module.exports = {
	init
};
