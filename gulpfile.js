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
    rename = require('gulp-rename');
gulp.task('js', function () {
    gulp.src(['./src/zepto.js', './src/main.js'])
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(livereload());
});
gulp.task('css', function () {
    gulp.src('./src/ruler.scss')
        .pipe(sass())
        .pipe(cssNano())
        .pipe(autoprefixer())
        .pipe(rename('ruler.min.css'))
        .pipe(gulp.dest('./dist/'))
        .pipe(livereload());
});
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('src/*.js', ['js']);
    gulp.watch('src/*.scss', ['css']);
});
gulp.task('default', ['watch','css','js']);