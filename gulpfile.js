const gulp = require('gulp');
const babel = require('gulp-babel');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');
const runElectron = require('gulp-run-electron');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');

// const minifyCSS = require('gulp-csso');


gulp.task('js', () => gulp
	.src('src/**/*.{js,jsx}')
	.pipe(plumber({errorHandler: notify.onError('JS: <%= error.message %>')}))
	.pipe(babel({
		presets: ['es2015', 'preact'],
		plugins: [
			['transform-react-jsx', { pragma: 'h' }]
		]
	}))
	.pipe(gulp.dest('app/'))
);


gulp.task('css', () => gulp
	.src('src/**/*.styl')
	.pipe(plumber({errorHandler: notify.onError('Stylus: <%= error.message %>')}))
	.pipe(stylus())
	.pipe(concat('app.css'))
	.pipe(gulp.dest('app/'))
);

gulp.task('webview-css', () => gulp
	.src('src/**/webview.css')
	.pipe(gulp.dest('app/'))
);

gulp.task('build', ['js', 'css', 'webview-css']);


gulp.task('electron', ['build'], () => gulp
	.src('./')
	.pipe(runElectron())
);

gulp.task('all', ['electron']);


gulp.task('default', ['all'], () => {
	gulp.watch('src/**/webview.css', ['webview-css']);
	gulp.watch('src/**/*.styl', ['css']);
	gulp.watch('src/**/*.{js,jsx}', ['js']);
});