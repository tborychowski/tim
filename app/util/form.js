'use strict';

var keyBreaker = /[^[\]]+/g;
var numberMatcher = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;

function _isNumber(value) {
	if (typeof value === 'number') return true;
	if (typeof value !== 'string') return false;
	return value.match(numberMatcher);
}

function _decodeEntities(str) {
	var d = document.createElement('div');
	d.innerHTML = str;
	return d.innerText || d.textContent;
}

function _getInputs(form) {
	var inputs = form.querySelectorAll('[name]');
	return Array.prototype.slice.call(inputs) || [];
}

/**
 * Form component
 * @param {object} el - form DOM element
 */
function Form(el) {
	if (!el) return null;
	if (!(this instanceof Form)) return new Form(el);
	this.form = el;
	if (el.elements) this.inputs = el.elements;
}

Form.prototype.set = function () {
	var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var clear = arguments[1];

	this.suspendObserve = true;
	if (this.animFrame) cancelAnimationFrame(this.animFrame);

	var inputs = _getInputs(this.form);
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var input = _step.value;

			var name = input.name;
			var value = typeof params[name] === 'undefined' ? '' : params[name];

			// if name is object, e.g. user[name], userData[address][street], update value to read this correctly
			if (name.indexOf('[') > -1) {
				var v = params;
				var names = name.replace(/[[\]]/g, '|').split('|');
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = names[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var n = _step2.value;

						if (v[n]) v = v[n];else {
							v = undefined;break;
						}
					}
				} catch (err) {
					_didIteratorError2 = true;
					_iteratorError2 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion2 && _iterator2.return) {
							_iterator2.return();
						}
					} finally {
						if (_didIteratorError2) {
							throw _iteratorError2;
						}
					}
				}

				value = v;
			}

			// if clear==true and no value = clear field, otherwise - leave it as it was
			if (clear !== true && (value === undefined || !params[name])) continue;

			// if no value - clear field
			if (value === null || value === undefined) value = '';

			// decode html special chars (entities)
			if (typeof value === 'string' && value.indexOf('&') > -1) value = _decodeEntities(value);

			if (input.type === 'radio') input.checked = input.value.toString() === value.toString();else if (input.type === 'checkbox') input.checked = value;else if (input.tagName === 'SELECT') {
				if (value === '' || value === undefined) input.selectedIndex = 0;else input.value = value;
			} else input.value = value;
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	this.suspendObserve = false;

	return this.update();
};

Form.prototype.get = function () {
	var convert = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	var inputs = _getInputs(this.form);
	var data = {},
	    current = void 0;

	var _iteratorNormalCompletion3 = true;
	var _didIteratorError3 = false;
	var _iteratorError3 = undefined;

	try {
		for (var _iterator3 = inputs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
			var input = _step3.value;

			var type = input.type && input.type.toLowerCase(),
			    value = void 0,
			    parts = void 0,
			    lastPart = void 0,
			    last = void 0;

			// if we are submit or disabled - ignore
			if (type === 'submit' || !input.name || input.disabled) continue;

			value = input.value;
			parts = input.name.match(keyBreaker);

			// return only "checked" radio value
			if (type === 'radio' && !input.checked) continue;

			// convert chekbox to [true | false]
			if (type === 'checkbox') value = input.checked;

			if (convert) {
				if (_isNumber(value)) {
					var tv = parseFloat(value);
					var cmp = tv + '';
					// convert (string)100.00 to (int)100
					if (value.indexOf('.') > 0) cmp = tv.toFixed(value.split('.')[1].length);
					if (cmp === value) value = tv;
				} else if (value === 'true') value = true;else if (value === 'false') value = false;
				if (value === '') value = null;
			}

			current = data;
			// go through and create nested objects
			for (var i = 0; i < parts.length - 1; i++) {
				current[parts[i]] = current[parts[i]] || {};
				current = current[parts[i]];
			}
			lastPart = parts[parts.length - 1];

			// now we are on the last part, set the value
			last = current[lastPart];
			if (last) {
				if (!Array.isArray(last)) current[lastPart] = last === undefined ? [] : [last];
				current[lastPart].push(value);
			} else current[lastPart] = value;
		}
	} catch (err) {
		_didIteratorError3 = true;
		_iteratorError3 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion3 && _iterator3.return) {
				_iterator3.return();
			}
		} finally {
			if (_didIteratorError3) {
				throw _iteratorError3;
			}
		}
	}

	return data;
};

Form.prototype.reset = function () {
	this.set({});
};

Form.prototype.clear = function () {
	this.set({}, true);
};

Form.prototype.update = function () {
	if (this.animFrame) cancelAnimationFrame(this.animFrame);
	if (!this.observeCb) return;
	if (this.suspendObserve) return;
	var _iteratorNormalCompletion4 = true;
	var _didIteratorError4 = false;
	var _iteratorError4 = undefined;

	try {
		for (var _iterator4 = this.form.elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
			var field = _step4.value;

			var fname = field.name.replace(/[[\]]/g, '_') + 'val',
			    ov = this.form.dataset[fname],
			    v = field.value;
			if (fname === 'val') continue;
			if (field.type === 'checkbox') {
				v = field.checked;
				ov = ov === 'true';
			} else if (field.type === 'radio' && !field.checked) continue;
			if (typeof ov === 'undefined' && typeof v !== 'undefined') {
				if (field.type === 'radio') this.observeCb(v, ov, field);
				ov = this.form.dataset[fname] = v;
			} else if (ov !== v) {
				this.form.dataset[fname] = v;
				this.observeCb(v, ov, field);
			}
		}
	} catch (err) {
		_didIteratorError4 = true;
		_iteratorError4 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion4 && _iterator4.return) {
				_iterator4.return();
			}
		} finally {
			if (_didIteratorError4) {
				throw _iteratorError4;
			}
		}
	}

	this.animFrame = requestAnimationFrame(this.update.bind(this));
};
Form.prototype.observe = function (cb) {
	this.update(this.observeCb = cb);
};
Form.prototype.observeStop = function () {
	this.observeCb = null;
};

module.exports = Form;