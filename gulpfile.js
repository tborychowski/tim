const gulp = require('gulp');
const babel = require('gulp-babel');
const stylus = require('gulp-stylus');
const concat = require('gulp-concat');
const runElectron = require('gulp-run-electron');
// const minifyCSS = require('gulp-csso');


gulp.task('js', () => gulp
	.src('src/**/*.js')
	.pipe(babel({ presets: ['es2015', 'preact'] }))
	.pipe(gulp.dest('app/'))
);


gulp.task('css', () => gulp
	.src('src/**/*.styl')
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
	gulp.watch('src/**/*.js', ['js']);
});
