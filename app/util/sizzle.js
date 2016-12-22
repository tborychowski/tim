const util = require('./util');


function sizzle (mixed, context) {
	if (!mixed) return [];
	let el;
	if (typeof mixed !== 'string') el = mixed;

	// is html - create new element
	else if (/<[a-z][\s\S]*>/i.test(mixed)) {
		el = (new DOMParser()).parseFromString(mixed, 'text/html').body.firstChild;
	}
	// is selector - find element
	else el = (context || document).querySelectorAll(mixed);

	if (el.nodeType) el = [el];
	else if (util.isNodeList(el)) el = Array.prototype.slice.call(el);

	return Object.assign(el || [], sizzle.fn);
}


sizzle.fn = {};
sizzle.fn.find = function (selector) { return sizzle(selector, this[0]); };

sizzle.fn.first = function () { return sizzle(this[0]); };
sizzle.fn.last = function () { return sizzle(this[this.length - 1]); };
sizzle.fn.eq = function (idx) { return sizzle(this[idx || 0]); };


sizzle.fn.appendTo = function (parent) {
	if (!this || !this.length) return this;
	if (typeof parent === 'string') parent = sizzle(parent);
	parent[0].appendChild(this[0]);
	return this;
};

sizzle.fn.append = function (child) {
	if (!this || !this.length) return this;
	if (typeof child === 'string') child = sizzle(child);
	this[0].appendChild(child[0]);
	return this;
};

sizzle.fn.on = function (eventName, cb) {
	if (!this || !this.length) return this;
	this.forEach(el => {
		el.addEventListener(eventName, cb);
	});
	return this;
};

sizzle.fn.off = function (eventName, cb) {
	if (!this || !this.length) return this;
	this.forEach(el => {
		el.removeEventListener(eventName, cb);
	});
	return this;
};


sizzle.fn.closest = function (cls) {
	if (!this || !this.length) return false;
	let has = false, el = this[0];
	while (!has && el) {
		has = el.matches(cls);
		if (has) return sizzle(el);
		el = el.parentNode;
		if (el.tagName === 'HTML') return null;
	}
	return null;
};

sizzle.fn.is = function (selector) {
	if (!this || !this.length) return false;
	return this[0].matches(selector);
};

/**
 * Check if target is, or is inside, a selector
 * @param  {object}  target  - dom element
 * @param  {string}  ...cls  - classes/selectors
 * @example
 *    Helper.isTargetIn(el, 'cls1', 'cls2')
 * @return {Boolean}
 */
sizzle.fn.isIn = function (...classes) {
	let target = (this && this.length ? this : null);
	if (target) {
		for (let cls of classes) if (target.closest(cls)) return true;
	}
	return false;
};



/**
 * Modify element class list
 * @param  {array} el        array of elements
 * @param  {string} action   add, remove or toggle
 * @param  {string} cls      space separated list of classes to add/remove/toggle
 * @param  {boolean} cond    [optional] true or false for toggle
 * @return {array}           same array of elements
 */
function modElCls (el, action, cls, cond) {
	if (!el || !el.length) return el;
	cls = cls.split(' ');
	if (typeof cond === 'boolean') {
		el.forEach(e => cls.forEach(c => e.classList[action](c, cond)));
	}
	else el.forEach(e => cls.forEach(c => e.classList[action](c)));
	return el;
}

sizzle.fn.addClass = function (cls) { return modElCls(this, 'add', cls); };
sizzle.fn.removeClass = function (cls) { return modElCls(this, 'remove', cls); };
sizzle.fn.toggleClass = function (cls, cond) { return modElCls(this, 'toggle', cls, cond); };
sizzle.fn.hasClass = function (cls) {
	if (!this || !this.length) return false;
	return this[0].classList.contains(cls);
};

sizzle.fn.html = function (html) {
	if (!this || !this.length) return this;
	if (typeof html === 'undefined') return this[0].innerHTML;
	this.forEach(el => { el.innerHTML = html; });
	return this;
};

sizzle.fn.text = function (text) {
	if (!this || !this.length) return this;
	if (typeof text === 'undefined') return this[0].innerText;
	this.forEach(el => { el.innerText = text; });
	return this;
};

sizzle.fn.remove = function () {
	if (!this || !this.length) return this;
	this.forEach(el => el.remove());
	return this;
};

sizzle.fn.data = function (key) {
	if (!this || !this.length) return this;
	if (!this[0].dataset) return null;
	if (key) return this[0].dataset[key];
	return this[0].dataset;
};


module.exports = sizzle;
