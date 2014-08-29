"use strict";

var gulp = require('gulp');

var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var gulpif = require('gulp-if');
var replace = require('gulp-replace');
var sequence = require('run-sequence');
var argv = require('yargs').argv;

// Package information, including version
var pkg = require('./package.json');

var config = { 'platform': 'android' };

var bases = {
    app: 'www/',
    dist: 'dist/www/',
};

var paths = {
    config: ['config.xml'],
    styles: ['css/**/*.css'],
    scripts: ['js/**/*.js'],
    mainhtml: ['index.html'],
    html: ['templates/**/*.html'],
    images: ['img/**/*.png'],
    locales: ['locales/**/*.*'],
    lib: ['lib/**/*.min.css', 'lib/**/fonts/*.*', 'lib/**/*.min.js', 'lib/**/compressed/showdown.js', 'lib/**/Google.js', 'lib/**/leaflet.js'],
    leaflet: ['lib/**/leaflet-dist/*.css', 'lib/**/leaflet-dist/**/*.png'],
};

var platform = {
    excludeiosimages: ['!img/icons/ios/**'],
    excludeandroidimages: ['!img/icons/android/**'],
};

// Imagemin images and ouput them in dist
gulp.task('imagemin', function () {
    gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest(bases.dist));
});

// Delete the dist directory
gulp.task('clean', function () {
    return gulp.src(bases.dist, { read: false})
    .pipe(clean());
});

// Process scripts and concatenate them into one output file
gulp.task('scripts', function () {
    gulp.src(paths.scripts, { cwd: bases.app })
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
    .pipe(gulpif(argv.production, uglify()))
    // .pipe(gulpif(argv.production, rename({ suffix: '.min' })))
    .pipe(gulp.dest(bases.dist + 'js/'));
});

gulp.task('copy', function () {
    gulp.src(paths.mainhtml, { cwd: bases.app })
    .pipe(gulp.dest(bases.dist));

    gulp.src(paths.html, { cwd: bases.app })
    .pipe(gulp.dest(bases.dist + 'templates'));

    gulp.src(paths.styles, { cwd: bases.app })
    .pipe(gulp.dest(bases.dist + 'css'));

    gulp.src(paths.leaflet, { cwd: bases.app })
    .pipe(gulp.dest(bases.dist + 'lib'));

    //gulp.src(paths.images, { cwd: bases.app })
    //.pipe(gulp.dest(bases.dist + 'img'));

    if (argv.android) {
        gulp.src(paths.images.concat(platform.excludeiosimages), { cwd: bases.app })
        .pipe(gulp.dest(bases.dist + 'img'));

        gulp.src(paths.config, { cwd: bases.app })
            .pipe(replace('APP-NAME', 'Baltimore Beer Week 2014'))
            .pipe(gulp.dest(bases.dist));
    }

    if (argv.ios) {
        gulp.src(paths.images.concat(platform.excludeandroidimages), { cwd: bases.app })
        .pipe(gulp.dest(bases.dist + 'img'));

        gulp.src(paths.config, { cwd: bases.app })
            .pipe(replace('APP-NAME', 'BBW 2014'))
            .pipe(gulp.dest(bases.dist));
    }

    gulp.src(paths.locales, { cwd: bases.app })
    .pipe(gulp.dest(bases.dist + 'locales'));

    gulp.src(paths.lib, { cwd: bases.app })
    .pipe(gulp.dest(bases.dist + 'lib'));
});

// Define the default task as a sequence and delegate to the full build
gulp.task('default', ['build']);

// Full build
gulp.task('build', function (callback) {
    console.log('\nBuilding Version: ' + pkg.version);

    if (argv.android) {
        bases.dist = 'dist-android/www/';
        console.log('Platform: Android - Output redirected to: ' + bases.dist);
    }

    if (argv.ios) {
        bases.dist = 'dist-ios/www/';
        console.log('Platform: iOS -Output redirected to: ' + bases.dist);
    }

    // empty line for easy reading
    console.log();

    sequence(
          'clean',
          'scripts',
          'imagemin',
          'copy',
          callback
      );
});