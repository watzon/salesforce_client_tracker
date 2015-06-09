var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var gutil = require('gulp-util');

var path = require('path');

gulp.task('babel', function() {
  return gulp.src('./scripts/es6/*.es6')
        .pipe(babel())
        .pipe(gulp.dest('./scripts'));
});

gulp.task('watch', function() {
  gulp.watch('./scripts/es6/*.es6', ['babel']);
});

gulp.task('default', ['watch']);
