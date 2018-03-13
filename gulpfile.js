var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    base64 = require('gulp-css-base64'),
    runSequence = require('run-sequence'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    jpegtran = require('imagemin-jpegtran'),
    optipng = require('imagemin-optipng'),
    svgo = require('imagemin-svgo'),
    rename = require("gulp-rename"),
    babel = require('gulp-babel');

var ASSETS_PATH = 'web/assets',
    TWIG_PATH = 'app/Resources/views',
    SITE_URL= 'funnyspanishquiz.perepecho.dev';

gulp.task('prefix', function () {
    return gulp.src(ASSETS_PATH + '/css/**/*.css')
        .pipe(prefix({
            browsers: ['last 10 versions']
        }))
        .pipe(gulp.dest(ASSETS_PATH +'/css'))
});

gulp.task('sass', function () {
    return gulp.src(ASSETS_PATH+ '/scss/**/*.scss')
        .pipe(sass()) // Converts Sass to CSS with gulp-sass
        .pipe(gulp.dest(ASSETS_PATH+ '/css/'))
        .pipe(browserSync.stream());
});

gulp.task('compressJS', function () {
    return gulp.src([ASSETS_PATH+ '/js/src/**/*.js', '!'+ASSETS_PATH+ '/js/src/**/*.min.js', '!'+ASSETS_PATH+ '/js/src/html5shiv.js'])
        .pipe(babel())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(ASSETS_PATH+ '/js/build'));
});

gulp.task('compressCSS', function () {
    return gulp.src([ASSETS_PATH+ '/css/**/*.css', '!'+ASSETS_PATH+ '/css/**/*.min.css'])
        .pipe(cssnano({autoprefixer: false, zindex:false}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(ASSETS_PATH+ '/css/'));
});

gulp.task('base64', function () {
    return gulp.src([ASSETS_PATH+ '/css/**/*.css', '!'+ASSETS_PATH+ '/css/**/*.min.css'])
        .pipe(base64({
            extensionsAllowed: ['.gif', '.jpg', '.png', '.svg'],
            maxWeightResource: 4 * 1024
        }))
        .pipe(gulp.dest(ASSETS_PATH+ '/css/'));
});

gulp.task('watch', function () {
    gulp.watch(ASSETS_PATH+ '/css/**', browserSync.stream());
    gulp.watch([ASSETS_PATH+ '/scss/**/*.scss'], ['sass']);
    gulp.watch([TWIG_PATH+'/**/*.twig', ASSETS_PATH+ '/js/**/*.js'], browserSync.reload);
});

gulp.task('browserSync', function () {
    return browserSync.init([ASSETS_PATH+ '/css/**'], {
        proxy: SITE_URL,
        notify: false
    })
});

gulp.task('default', ['browserSync', 'watch']);


// ------------ BEGIN: PRODUCTION TASKS ---------------
gulp.task('compressImg', function () {
    return gulp.src(ASSETS_PATH+ '/img/**')
        .pipe(imagemin([imagemin.jpegtran(), imagemin.optipng(), imagemin.svgo()], {
            progressive: true
        }))
        .pipe(gulp.dest(ASSETS_PATH+ '/img'))
});

gulp.task('build', function () {
    runSequence('sass', 'prefix', 'base64')
});

gulp.task('build:min', function () {
    runSequence('sass', 'prefix', 'base64', ['compressCSS', 'compressJS'])
})
// ------------ END:   PRODUCTION TASKS ---------------