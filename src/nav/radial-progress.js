const Ractive = require('ractive');
const radiusSize = 11;

const template = `
	<svg width="100%" height="100%"><path stroke-width="${radiusSize * 2}" d="{{arc(progress)}}" fill="none" stroke="rgba(150,255,70,0.2)" /></svg>
`;


function data () {
	return {
		progress: 0,
		arc: perc => describeArc(radiusSize, (perc || 0) * 3.6)
	};
}


function polarToCartesian (x, y, r, deg) {
	const rad = (deg - 90) * Math.PI / 180.0;
	return { x: x + (r * Math.cos(rad)), y: y + (r * Math.sin(rad)) };
}


function describeArc (r, endAngle = 0, startAngle = 0) {
	const x = r * 2;
	const start = polarToCartesian(x, x, r, endAngle);
	const end = polarToCartesian(x, x, r, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
	return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');

}


module.exports = Ractive.extend({ template, data });
