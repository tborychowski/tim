const { h, render, Component } = require('preact');

class Subsection extends Component {
	render(props, state) {
		return (
			<section class={'subnav-section subnav-' + props.type}>
				<h1>{props.name}</h1>
				<a href="#" class="nav-icon-btn header-btn js-refresh ion-md-refresh" title="Refresh (r)" data-go="refresh"></a>
				<div class="subnav-section-list"></div>
			</section>
		);
	}
}

class Subnav extends Component {
	render(props, state) {
		return (
			<aside id="subnav">
				<Subsection type="notifications" name="Notifications"/>
				<Subsection type="bookmarks" name="Bookmarks"/>
				<Subsection type="myissues" name="My Issues"/>
				<Subsection type="projects" name="Projects"/>
			</aside>
		);
	}
}

render(<Subnav/>, document.body);

