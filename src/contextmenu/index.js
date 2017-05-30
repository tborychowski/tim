const { config, helper } = require('../services');
// const preview = require('../preview');

let isReady = false;


function parseLink (link) {
	link = '' + link;
	if (link.indexOf('http') !== 0) link = config.get('baseUrl') + link;
	return link;
}


function onDocumentClick (e) {
	if (e.metaKey || e.ctrlKey) {
		const a = e.target.closest('a');
		if (a && a.matches('#subnav a')) {
			helper.openInBrowser(a.getAttribute('href'));
			e.stopPropagation();
			e.preventDefault();
		}
	}
}


function init () {
	if (isReady) return;
	document.addEventListener('click', onDocumentClick);
	isReady = true;
}



module.exports = {
	init
};
