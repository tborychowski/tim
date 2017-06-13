const Ractive = require('ractive');


const outerRadius = 22;
const innerRadius = 18;
const color = 'rgba(150,255,70,0.2)';

const template = `<svg width="100%" height="100%"><path stroke="${color}" stroke-width="${outerRadius - innerRadius}" d="{{arc(progress)}}" fill="none" /></svg>`;

function data () {
	return { progress: 0, arc };
}


function arc (perc) {
	const startAngle = 0;
	const endAngle = (perc || 0.0001) * 3.6;
	const x = outerRadius;
	const r = (innerRadius + outerRadius) / 2;

	const start = polarToCartesian(x, x, r, endAngle);
	const end = polarToCartesian(x, x, r, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
	return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}


function polarToCartesian (x, y, r, deg) {
	const rad = (deg - 90) * Math.PI / 180.0;
	return { x: x + (r * Math.cos(rad)), y: y + (r * Math.sin(rad)) };
}

module.exports = Ractive.extend({ template, data });
