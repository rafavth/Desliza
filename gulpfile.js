let gulp = require('gulp'),
    babel = require('gulp-babel'),
    del = require('del'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

function clean() {
    return del(["dist"]);
}

function renjs() {
    return gulp.src('./src/desliza.js')
        .pipe(rename('desliza.min.js'))
        .pipe(gulp.dest('dist'));
}

function rencss() {
    return gulp.src('./src/desliza.css')
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('docs/assets/css/'));
}

function minjs() {
    return gulp.src('./dist/*.js')
        .pipe(babel({
            presets: ['@babel/env'],
            plugins: ["@babel/plugin-transform-object-assign"]
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('docs/assets/js/'));
}


exports.clean = clean;
exports.minjs = minjs;
exports.renjs = renjs;
exports.rencss = rencss;

gulp.task('compile', gulp.series(clean, renjs, rencss, minjs));
gulp.task('build', gulp.series('compile'));