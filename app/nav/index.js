'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('preact'),
    h = _require.h,
    render = _require.render,
    Component = _require.Component;

var NavButton = function (_Component) {
	_inherits(NavButton, _Component);

	function NavButton(props) {
		_classCallCheck(this, NavButton);

		var _this = _possibleConstructorReturn(this, (NavButton.__proto__ || Object.getPrototypeOf(NavButton)).call(this, props));

		_this.state = {
			badge: props.badge || 0
		};
		// this.changeSection = this.changeSection.bind(this);
		return _this;
	}

	_createClass(NavButton, [{
		key: 'changeSection',
		value: function changeSection(e) {
			e.preventDefault();
			console.log(this);
		}
	}, {
		key: 'render',
		value: function render(props, state) {
			return h(
				'a',
				{ href: '#', 'class': 'nav-btn nav-' + props.type, title: props.name, onclick: this.changeSection.bind(this) },
				h('i', { 'class': 'icon' }),
				state.badge > 0 ? h(
					'span',
					{ 'class': 'badge' },
					state.badge
				) : null
			);
		}
	}]);

	return NavButton;
}(Component);

var Nav = function (_Component2) {
	_inherits(Nav, _Component2);

	function Nav() {
		_classCallCheck(this, Nav);

		return _possibleConstructorReturn(this, (Nav.__proto__ || Object.getPrototypeOf(Nav)).apply(this, arguments));
	}

	_createClass(Nav, [{
		key: 'render',
		value: function render(props, state) {
			return h(
				'nav',
				{ id: 'nav' },
				h(NavButton, { type: 'notifications', name: 'Notifications (1)', badge: '0' }),
				h(NavButton, { type: 'bookmarks', name: 'Bookmarks (2)', badge: '0' }),
				h(NavButton, { type: 'myissues', name: 'My Issues (3)', badge: '0' }),
				h(NavButton, { type: 'projects', name: 'Projects (4)', badge: '0' }),
				h(
					'div',
					{ 'class': 'nav-bottom' },
					h(NavButton, { type: 'update', name: 'Update available. Click to see details.' }),
					h(NavButton, { type: 'settings', name: 'Open preferences' })
				)
			);
		}
	}]);

	return Nav;
}(Component);

render(h(Nav, null), document.body);

// const $ = require('../util');
// const { config, EVENT } = require('../services');

// let isReady = false, el, subnav, buttons, sections, currentSection, btnUpdate;


// function refreshSection (section = currentSection) {
// 	const handlers = {
// 		notifications: EVENT.notifications.refresh,
// 		bookmarks: EVENT.bookmarks.refresh,
// 		projects: EVENT.projects.refresh,
// 		myissues: EVENT.myissues.refresh
// 	};
// 	$.trigger(handlers[section]);
// }

// function changeSection (sectionName) {
// 	if (sectionName === currentSection) return refreshSection(sectionName);
// 	buttons.removeClass('active');
// 	sections.removeClass('active');
// 	currentSection = sectionName;

// 	el.find('.nav-' + sectionName).addClass('active');
// 	subnav.find('.subnav-' + sectionName).addClass('active');
// 	config.set('state.section', sectionName);
// }

// function setSectionBadge (section, count) {
// 	const badge = el.find(`.nav-${section} .badge`);
// 	badge.toggle(count > 0).html(count);
// }

// function onKeyUp (e) {
// 	const handledKeys = {
// 		r: refreshSection,
// 		1: () => changeSection('notifications'),
// 		2: () => changeSection('bookmarks'),
// 		3: () => changeSection('myissues'),
// 		4: () => changeSection('projects')
// 	};

// 	if (e.key in handledKeys && !e.metaKey && !e.ctrlKey) {
// 		// if real event and focused on these - ignore
// 		if ($.type(e) === 'keyboardevent' && document.activeElement.matches('input,select,textarea,webview')) return;

// 		// if not input or event passed from webview:
// 		handledKeys[e.key]();
// 	}
// }

// function onClick (e) {
// 	const target = $(e.target).closest('.nav-btn');
// 	const go = target.length && target.data('go');
// 	if (!target || !go) return;
// 	e.preventDefault();
// 	e.stopPropagation();
// 	if (go === 'update') return $.trigger(EVENT.updater.nav.clicked);
// 	if (go === 'settings') return $.trigger(EVENT.settings.show);
// 	changeSection(go);
// }


// function init () {
// 	if (isReady) return;

// 	el = $('#nav');
// 	buttons = el.find('.nav-btn');
// 	btnUpdate = el.find('.nav-update');
// 	subnav = $('#subnav');
// 	sections = subnav.find('.subnav-section');

// 	el.on('click', onClick);

// 	const sect = config.get('state.section');
// 	if (sect) changeSection(sect);

// 	$.on(EVENT.section.refresh, refreshSection);
// 	$.on(EVENT.updater.nav.show, () => btnUpdate.show());
// 	$.on(EVENT.section.badge, setSectionBadge);
// 	$.on(EVENT.document.keyup, onKeyUp);

// 	isReady = true;
// }


// module.exports = {
// 	init
// };