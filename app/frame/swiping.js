const $ = require('../util');
const EVENT = require('../db/events');


let frame, webview, isReady = false;
const threshold = 100;
const maxX = threshold + 20;
let trackSwipe = false;
let trackingLeft = null;
let trackingStartLeft = null;
let dir = 'prev', left = 0;

const resistanceFunction = t => Math.min(1, t / 2.5);

function hasNoHistory () {
	if (dir === 'next' && !webview[0].canGoForward()) return true;
	if (dir === 'prev' && !webview[0].canGoBack()) return true;
	return false;
}


function onWheel (e) {
	if (!trackingStartLeft) trackingLeft = trackingStartLeft = webview[0].offsetLeft;
	if (trackSwipe) {
		const trackingVelocity = e.wheelDeltaX / 10;
		trackingLeft = trackingLeft + trackingVelocity;
		dir = trackingLeft  > 0 ? 'prev' : 'next';

		if (hasNoHistory()) {
			trackSwipe = false;
			webview[0].send('swipe-end');
			return;
		}

		// make sure it only moves to the max
		left = trackingLeft < 0 ? Math.max(trackingLeft, -threshold) : Math.min(trackingLeft, threshold);

		// add rubber band effect
		if (Math.abs(trackingLeft) > threshold) {
			const diff = Math.abs(trackingLeft) - threshold;
			const resist =  Math.min(resistanceFunction(diff / threshold) * Math.min(maxX, diff), threshold);
			left += left < 0 ? -resist : resist;
		}
		webview[0].style.left = left + 'px';
	}
}

function revert (fade) {
	if (!fade) return webview.animate({ left: left + 'px' }, { left: 0 });

	// triggering action
	const moreLeft = left + (trackingLeft < 0 ? -100 : 100);
	webview
		.addClass('loading')
		.animate({ left: left + 'px' }, { left: moreLeft + 'px' }, 'ease-out')
		.then(() => webview[0].style.left = 0);
}


function swipeStart () {
	trackingStartLeft = trackingLeft = null;
	left = 0;
	webview[0].send('swipe-start');
}

function swipeEnd () {
	trackSwipe = false;
	webview[0].send('swipe-end');
	if (Math.abs(left) < maxX) revert();
	else {
		$.trigger(EVENT.frame.goto, dir);
		revert(true);
	}
}



function init (frm, wbv) {
	if (isReady) return;

	frame = frm;
	webview = wbv;

	frame.on('wheel', onWheel);
	$.on(EVENT.swipe.start, swipeStart);
	$.on(EVENT.swipe.end, swipeEnd);

	webview.on('ipc-message', ev => {
		if (ev.channel === 'swipe-allowed') trackSwipe = true;
	});

	isReady = true;
}


module.exports = init;
