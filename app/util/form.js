'use strict';

const keyBreaker = /[^[\]]+/g;
const numberMatcher = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;

function _isNumber (value) {
	if (typeof value === 'number') return true;
	if (typeof value !== 'string') return false;
	return value.match(numberMatcher);
}

function _decodeEntities (str) {
	const d = document.createElement('div');
	d.innerHTML = str;
	return d.innerText || d.textContent;
}

function _getInputs (form) {
	const inputs = form.querySelectorAll('[name]');
	return Array.prototype.slice.call(inputs) || [];
}



/**
 * Form component
 * @param {object} el - form DOM element
 */
function Form (el) {
	if (!el) return null;
	if (!(this instanceof Form)) return new Form(el);
	this.form = el;
	if (el.elements) this.inputs = el.elements;
}

Form.prototype.set = function (params = {}, clear) {
	this.suspendObserve = true;
	if (this.animFrame) cancelAnimationFrame(this.animFrame);

	const inputs = _getInputs(this.form);
	for (let input of inputs) {
		const name = input.name;
		let value = (typeof params[name] === 'undefined' ? '' : params[name]);

		// if name is object, e.g. user[name], userData[address][street], update value to read this correctly
		if (name.indexOf('[') > -1) {
			let v = params;
			let names = name.replace(/[[\]]/g, '|').split('|');
			for (let n of names) {
				if (v[n]) v = v[n];
				else { v = undefined; break; }
			}
			value = v;
		}

		// if clear==true and no value = clear field, otherwise - leave it as it was
		if (clear !== true && value === undefined) continue;

		// if no value - clear field
		if (value === null || value === undefined) value = '';

		// decode html special chars (entities)
		if (typeof value === 'string' && value.indexOf('&') > -1) value = _decodeEntities(value);

		if (input.type === 'radio') input.checked = (input.value.toString() === value.toString());
		else if (input.type === 'checkbox') input.checked = value;
		else if (input.tagName === 'SELECT') {
			if (value === '' || value === undefined) input.selectedIndex = 0;
			else input.value = value;
		}
		else input.value = value;
	}
	this.suspendObserve = false;

	return this.update();
};


Form.prototype.get = function (convert = false) {
	const inputs = _getInputs(this.form);
	let data = {}, current;

	for (let input of inputs) {
		let type = input.type && input.type.toLowerCase(), value, parts, lastPart, last;

		// if we are submit or disabled - ignore
		if ((type === 'submit') || !input.name || input.disabled) continue;

		value = input.value;
		parts = input.name.match(keyBreaker);

		// return only "checked" radio value
		if (type === 'radio' && !input.checked) continue;

		// convert chekbox to [true | false]
		if (type === 'checkbox') value = input.checked;

		if (convert) {
			if (_isNumber(value)) {
				let tv = parseFloat(value);
				let cmp = tv + '';
				// convert (string)100.00 to (int)100
				if (value.indexOf('.') > 0) cmp = tv.toFixed(value.split('.')[1].length);
				if (cmp === value) value = tv;
			}
			else if (value === 'true') value = true;
			else if (value === 'false') value = false;
			if (value === '') value = null;
		}

		current = data;
		// go through and create nested objects
		for (let i = 0; i < parts.length - 1; i++) {
			current[parts[i]] = current[parts[i]] || {};
			current = current[parts[i]];
		}
		lastPart = parts[parts.length - 1];

		// now we are on the last part, set the value
		last = current[lastPart];
		if (last) {
			if (!Array.isArray(last)) current[lastPart] = (last === undefined ? [] : [last]);
			current[lastPart].push(value);
		}
		else current[lastPart] = value;
	}

	return data;
};

Form.prototype.reset = function () { this.set({}); };

Form.prototype.clear = function () { this.set({}, true); };


Form.prototype.update = function () {
	if (this.animFrame) cancelAnimationFrame(this.animFrame);
	if (!this.observeCb) return;
	if (this.suspendObserve) return;
	for (let field of this.form.elements) {
		let fname = field.name.replace(/[[\]]/g, '_') + 'val',
			ov = this.form.dataset[fname],
			v = field.value;
		if (fname === 'val') continue;
		if (field.type === 'checkbox') {
			v = field.checked;
			ov = (ov === 'true');
		}
		else if (field.type === 'radio' && !field.checked) continue;
		if (typeof ov === 'undefined' && typeof v !== 'undefined') {
			if (field.type === 'radio') this.observeCb(v, ov, field);
			ov = this.form.dataset[fname] = v;
		}
		else if (ov !== v) {
			this.form.dataset[fname] = v;
			this.observeCb(v, ov, field);
		}
	}

	this.animFrame = requestAnimationFrame(this.update.bind(this));
};
Form.prototype.observe = function (cb) { this.update(this.observeCb = cb); };
Form.prototype.observeStop = function () { this.observeCb = null; };



module.exports = Form;
