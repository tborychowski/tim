const { series, parallel, src, dest, watch } = require('gulp');

const stylus = require('gulp-stylus');
const concat = require('gulp-concat');
const runElectron = require('gulp-run-electron');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
// const debug = require('gulp-debug');
// const minifyCSS = require('gulp-csso');


function js () {
	return src('src/**/*.js')
		.pipe(plumber({errorHandler: notify.onError('JS: <%= error.message %>')}))
		.pipe(dest('app/'));

}


function css () {
	return src('src/**/*.styl')
		.pipe(sourcemaps.init())
		.pipe(plumber({errorHandler: notify.onError('Stylus: <%= error.message %>')}))
		.pipe(stylus({ include: __dirname + '/src'}))
		.pipe(concat('app.css'))
		.pipe(sourcemaps.write())
		.pipe(dest('app/'));
}



function webviewCss () {
	return src('src/**/webview.css').pipe(dest('app/'));
}


// function previewHtml () {
// 	return src('src/preview/index.html').pipe(dest('app/preview/'));
// }


function electron () {
	return src('./').pipe(runElectron());
}


// build
function watchTask () {
	watch('src/**/webview.css', webviewCss);
	watch('src/**/*.styl', css);
	watch('src/**/*.js', js);
}

const defaultTask = parallel(js, css, webviewCss, /*previewHtml*/);

exports.js = js;
exports.css = css;
exports.dev = series(defaultTask, parallel(electron, watchTask));
exports.watch = series(defaultTask, watchTask);
exports.default = defaultTask;
