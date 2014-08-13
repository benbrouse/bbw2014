var gulp = require('gulp');

var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var gulpif = require('gulp-if');

var config = {'platform': 'android'};

var bases = {
 app: 'www/',
 dist: 'dist/',
};

var paths = {
 styles: ['css/**/*.css'],
 scripts: ['js/**/*.js'],
 mainhtml: ['index.html', 'config.xml'],
 html: ['templates/**/*.html'],
 images: ['img/**/*.png'],
 excludeiosimages: ['!img/icons/ios/**'],
 excludeandroidimages: ['!img/icons/android/**'],
 locales: ['locales/**/*.*'],
 lib: ['lib/**/*.min.css', 'lib/**/fonts/*.*', 'lib/**/*.min.js'],
};

// Imagemin images and ouput them in dist
gulp.task('imagemin', ['clean'], function() {
 gulp.src(paths.images)
 .pipe(imagemin())
 .pipe(gulp.dest(bases.dist));
});

// Delete the dist directory
gulp.task('clean', function() {
 return gulp.src(bases.dist)
 .pipe(clean());
});

// Process scripts and concatenate them into one output file
gulp.task('scripts', ['clean'], function() {
 gulp.src(paths.scripts, {cwd: bases.app})
 .pipe(jshint('.jshintrc'))
 .pipe(jshint.reporter('default'))
 .pipe(jshint.reporter('fail'))
 .pipe(uglify())
 .pipe(gulp.dest(bases.dist + 'js/'));
});

gulp.task('copy', ['clean'], function(){
 gulp.src(paths.mainhtml, {cwd: bases.app})
 .pipe(gulp.dest(bases.dist));

 gulp.src(paths.html, {cwd: bases.app})
 .pipe(gulp.dest(bases.dist + 'templates'));

 gulp.src(paths.styles, {cwd: bases.app})
 .pipe(gulp.dest(bases.dist + 'css'));

 if (config.platform == 'android') {
   gulp.src(paths.images.concat(paths.excludeiosimages), {cwd: bases.app})
   .pipe(gulp.dest(bases.dist + 'img'));
 }

 if (config.platform == 'ios') {
   gulp.src(paths.images.concat(paths.excludeandroidimages), {cwd: bases.app})
   .pipe(gulp.dest(bases.dist + 'img'));
 }

 gulp.src(paths.locales, {cwd: bases.app})
 .pipe(gulp.dest(bases.dist + 'locales'));

 gulp.src(paths.lib, {cwd: bases.app})
 .pipe(gulp.dest(bases.dist + 'lib'));
});

// Define the default task as a sequence of the above tasks
gulp.task('default', ['clean', 'scripts', 'imagemin', 'copy']);

gulp.task('androidconfig', function () {
   config.platform = 'android';
   bases.dist = 'dist-android/';
});

gulp.task('iosconfig', function () {
   config.platform = 'ios';
   bases.dist = 'dist-ios/';
});

gulp.task('android', ['androidconfig','default']
);

gulp.task('ios', ['iosconfig','default']
);

