/**
 * Created by es on 28.12.2015.
 */
var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    cssNano = require('gulp-cssnano'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    shell = require('gulp-shell'),
    zip = require('gulp-zip'),
    stripDebug = require('gulp-strip-debug'),
    clean = require('gulp-clean');
gulp.task('js', function () {
    gulp.src(['./src/zepto.js', './src/zepto-custom.js', './src/main.js', './src/tools/*.js'])
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('./publish/files/'))
        .pipe(livereload());
    gulp.src('./src/chrome.js')
        .pipe(gulp.dest('./dist/'))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('./publish/files/'));
});
gulp.task('css', function () {
    gulp.src('./src/ruler.scss')
        .pipe(sass())
        .pipe(cssNano())
        .pipe(autoprefixer())
        .pipe(rename('ruler.min.css'))
        .pipe(gulp.dest('./dist/'))
        .pipe(gulp.dest('./publish/files/'))
        .pipe(livereload());
});
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('src/*.js', ['js']);
    gulp.watch('src/tools/*.js', ['js']);
    gulp.watch('src/*.scss', ['css']);
});
gulp.task('zip', ['js', 'css', 'publish'], function () {
    gulp.src('./publish/files/*')
        .pipe(zip('wireframes.zip'))
        .pipe(gulp.dest('./publish/'));
});
gulp.task('publish', function () {
    var files = ['./dist/icon.png', './dist/manifest.json'];
    gulp.src(files)
        .pipe(gulp.dest('./publish/files/'));
});
gulp.task('default', ['watch', 'css', 'js']);