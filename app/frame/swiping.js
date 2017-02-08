const $ = require('../util');


let frame, webview, isReady = false;
const treshold = 200;

// const wellWidth = 60;
let trackSwipe = false;
let trackingLeft = null;
let trackingStartLeft = null;
// let trackingVelocity;

function onWheel (e) {
	if (!trackingStartLeft) trackingLeft = trackingStartLeft = webview[0].offsetLeft;
	if (trackSwipe) {
		const trackingVelocity = e.wheelDeltaX / 10;
		trackingLeft = trackingLeft + trackingVelocity;
		// make sure it only moves to the max
		trackingLeft = trackingLeft < 0 ? Math.max(trackingLeft, -treshold) : Math.min(trackingLeft, treshold);

		webview[0].style.left = trackingLeft + 'px';
	}
}

function revert () {
	webview.animate({ left: trackingLeft + 'px' }, { left: 0 });
}


function triggerAction (prev) {
	$.trigger('frame/goto', prev ? 'prev' : 'next');
}

function swipeStart () {
	trackingStartLeft = trackingLeft = null;
	trackSwipe = true;
}

function swipeEnd () {
	trackSwipe = false;
	if (Math.abs(trackingLeft) >= treshold) triggerAction(trackingLeft > 0);
	revert();

}



function init (frm, wbv) {
	if (isReady) return;

	frame = frm;
	webview = wbv;

	frame.on('wheel', onWheel);
	$.on('swipe-start', swipeStart);
	$.on('swipe-end', swipeEnd);

	isReady = true;
}


module.exports = init;
