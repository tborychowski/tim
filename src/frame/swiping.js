const $ = require('../util');
const { EVENT } = require('../services');


let frame, webview, webview0, isReady = false;
const threshold = 100;
const maxX = threshold + 20;
let trackSwipe = false;
let trackingLeft = null;
let trackingStartLeft = null;
let dir = 'prev', left = 0;

const resistanceFunction = t => Math.min(1, t / 2.5);

function hasNoHistory () {
	if (dir === 'next' && !webview0.canGoForward()) return true;
	if (dir === 'prev' && !webview0.canGoBack()) return true;
	return false;
}

function onWheel (e) {
	if (trackingStartLeft === null) trackingLeft = trackingStartLeft = webview0.offsetLeft;
	if (trackSwipe) {
		const trackingVelocity = e.wheelDeltaX / 10;
		trackingLeft = trackingLeft + trackingVelocity;
		dir = trackingLeft  > 0 ? 'prev' : 'next';

		if (hasNoHistory()) {
			trackSwipe = false;
			webview0.send('swipe-end');
			return;
		}

		// make sure it only moves to the max
		left = trackingLeft < 0 ? Math.max(trackingLeft, -threshold) : Math.min(trackingLeft, threshold);

		// add resistance (slow down to the end)
		if (Math.abs(trackingLeft) > threshold) {
			const diff = Math.abs(trackingLeft) - threshold;
			const resist =  Math.min(resistanceFunction(diff / threshold) * Math.min(maxX, diff), threshold);
			left += left < 0 ? -resist : resist;
		}
		webview0.style.transform = `translateX(${left}px)`;
	}
}

function revert (fade) {
	if (!left) return;
	if (!fade) return webview.animate({translateX: left}, {translateX: 0});

	// triggering action
	frame.addClass('loading');
	const moreLeft = left + (trackingLeft < 0 ? -100 : 100);
	webview
		.animate({translateX: left}, {translateX: moreLeft})
		.then(() => {
			webview0.style.transform = 'translateX(0)';
		});
}


function swipeStart () {
	trackingStartLeft = trackingLeft = null;
	left = 0;
	webview0.send('swipe-start');
}

function swipeEnd () {
	trackSwipe = false;
	webview0.send('swipe-end');
	if (Math.abs(left) < maxX) revert();
	else {
		$.trigger(EVENT.frame.goto, dir);
		revert(true);
	}
}



function init (frm, wbv) {
	frame = frm;
	webview = wbv;
	webview0 = wbv[0];

	if (isReady) return;


	frame.on('wheel', onWheel);
	$.on(EVENT.swipe.start, swipeStart);
	$.on(EVENT.swipe.end, swipeEnd);

	webview.on('ipc-message', ev => {
		if (ev.channel === 'swipe-allowed') trackSwipe = true;
	});

	isReady = true;
}


module.exports = init;
