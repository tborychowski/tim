const keys = {
		A: 65,
		X: 88,
		C: 67,
		D: 68,
		V: 86,
		Z: 90,

		F1: 112,
		F2: 113,
		F5: 116,
		TAB: 9,
		ESC: 27,

		BCKSPC: 8,
		BACKSPACE: 8,
		ENTER: 13,
		SPACE: 32,
		PGUP: 33,
		PGDOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		INS: 45,
		DEL: 46,
		MINUS: 173,
		PLUS: 61,
		DOT: 190,
		SLASH: 191,

		MACMINUS: 189,
		MACPLUS: 187,

		NUMSTAR: 106,
		NUMMINUS: 109,
		NUMPLUS: 107,
		NUMDOT: 110,
		NUMSLASH: 111
	},
	digits = {
		48: 1,		// 0
		49: 1,		// 1
		50: 1,		// 2
		51: 1,		// 3
		52: 1,		// 4
		53: 1,		// 5
		54: 1,		// 6
		55: 1,		// 7
		56: 1,		// 8
		57: 1,		// 9
		96: 1,		// numpad 0
		97: 1,		// numpad 1
		98: 1,		// numpad 2
		99: 1,		// numpad 3
		100: 1,		// numpad 4
		101: 1,		// numpad 5
		102: 1,		// numpad 6
		103: 1,		// numpad 7
		104: 1,		// numpad 8
		105: 1		// numpad 9
	},
	allowedChars = {
		8: 1,		// backspace
		9: 1,		// tab
		46: 1,		// del
		35: 1,		// end
		36: 1,		// home
		37: 1,		// left
		39: 1		// right
	};

// math operators: + - * / ( ) .
function isMath (e) {
	const k = e.keyCode;
	if (k === keys.SPACE) return true;
	if (k === keys.NUMDOT || (k === keys.DOT && !e.shiftKey)) return true;
	if (k === keys.NUMMINUS || (k === keys.MINUS && !e.shiftKey)) return true;
	if (k === keys.NUMPLUS || (k === keys.PLUS && e.shiftKey)) return true;
	if (k === keys.NUMSLASH || (k === keys.SLASH && !e.shiftKey)) return true;
	if (k === keys.MACMINUS && !e.shiftKey) return true;
	if (k === keys.MACPLUS && e.shiftKey) return true;

	if (e.shiftKey) {
		if (k === 56 || k === 57 || k === 48) return true;
	}
	return false;
}

// digits + navigation + copy/cut/paste + math operators
function isCutCopyPaste (e) {
	const k = e.keyCode;
	const ctrlOrCmd = e && (e.ctrlKey === true || e.metaKey === true);
	return ctrlOrCmd && (k === keys.X || k === keys.C || k === keys.V);
}

// a - z
function isAlpha (e) { return (e.keyCode >= 65 && e.keyCode <= 90 && !e.ctrlKey); }

function isAlphaNumeric (e) { return isAlpha(e) || isDigit(e); }

function isNavChar (e) { return allowedChars[e.keyCode] === 1; }

function isDigit (e) { return digits[e.keyCode] === 1 && !e.shiftKey; }

function isNumberField (e) {
	const isEnter = (e.keyCode === 13);
	return isDigit(e) || isNavChar(e) || isCutCopyPaste(e) || isEnter;
}


module.exports = {
	keys,
	isNavChar,
	isCutCopyPaste,
	isDigit,
	isAlpha,
	isMath,
	isAlphaNumeric,
	isNumberField
};
