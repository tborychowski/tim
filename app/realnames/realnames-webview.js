'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var trim = function trim(str) {
	var chars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\\s';
	return str.replace(new RegExp('(^' + chars + '+)|(' + chars + '+$)', 'g'), '');
};

var REAL_NAME_CLS = 'real-name-replaced';
var notRealName = ':not(.' + REAL_NAME_CLS + ')';

var elementSelectors = ['.issues-listing .author' + notRealName, '.sidebar-assignee .assignee' + notRealName, '.user-mention' + notRealName, 'a .discussion-item-entity:not(code)' + notRealName, '.project-card .d-block a.text-gray-dark' + notRealName, '.js-issue-row .opened-by a' + notRealName];

var tooltipSelectors = ['.reaction-summary-item.tooltipped' + notRealName];

function getElementsWithUserId(document) {
	var els = document.querySelectorAll(elementSelectors.join(','));
	return Array.from(els);
}

function getTooltipsWithUserId(document) {
	var els = document.querySelectorAll(tooltipSelectors.join(','));
	return Array.from(els);
}

function gatherUserIds(document) {
	var ids = getElementsWithUserId(document).map(function (el) {
		return trim(el.innerText, '@');
	});
	return [].concat(_toConsumableArray(new Set(ids))); // unique list
}

function updateUserNames(document, users) {
	getElementsWithUserId(document).forEach(function (el) {
		var id = trim(el.innerText, '@');
		if (users[id] && users[id].name) {
			el.innerText = '' + users[id].name;
			el.title = '' + id;
			el.classList.add(REAL_NAME_CLS);
		}
	});
	getTooltipsWithUserId(document).forEach(function (el) {
		if (el.classList.contains(REAL_NAME_CLS)) return;
		var lbl = el.getAttribute('aria-label');
		for (var id in users) {
			lbl = lbl.replace(id, users[id].name);
		}el.setAttribute('aria-label', lbl);
		el.classList.add(REAL_NAME_CLS);
	});
}

module.exports = {
	gatherUserIds: gatherUserIds,
	updateUserNames: updateUserNames
};