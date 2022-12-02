const {src, dest, parallel, series, watch} = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const imageminPngquant = require('imagemin-pngquant');
const imageminZopfli = require('imagemin-zopfli');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminGiflossy = require('imagemin-giflossy');
const del = require('del');
const fileinclude = require('gulp-file-include');

function buildHtml() {
    del('dist/**.html')
    return src('app/**.html')
        .pipe(fileinclude({}))
        .pipe(dest('dist/'))
        .pipe(browserSync.stream());
}

function minImages(){
    del('dist/img/**/*');
    return src('app/img/**/*')
        .pipe(cache(imagemin([
            imageminPngquant({
                speed: 1,
                quality: [0.95, 1]
            }),
            imageminZopfli({
                more: true
            }),
            imageminGiflossy({
                optimizationLevel: 3,
                optimize: 3,
                lossy: 2
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            imagemin.mozjpeg({
                progressive: true
            }),
            imageminMozjpeg({
                quality: 90
            })
        ])))
        .pipe(dest('dist/img/'))
}

function scripts(){
    del('dist/js/**/*.js')
    return src(['app/js/main.js'])
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(dest('dist/js/'))
        .pipe(browserSync.stream());
}

function styles(){
    del('dist/styles/**/*.css')
    return src('app/scss/styles.scss')
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions']
        }))
        .pipe(concat('styles.min.css'))
        .pipe(dest('dist/css/'))
        .pipe(browserSync.stream());
}

function serve(){
    browserSync.init({
        server: {baseDir: 'dist/'},
        notify: false,
        online: true
    });
}

function buildOthers(){
    del(['dist/fonts/**/*'])
    return src([
        'app/fonts/**/*'
    ], {base: 'app'})
        .pipe(dest('dist/'));
}

function watching(){
    watch('app/scss/**/*.scss', styles);
    watch('app/**/*.html', buildHtml);
    watch('app/js/main.js', scripts);
    watch('app/img/**/*', minImages);
    watch(['app/fonts/**/*'], buildOthers);
}

exports.serve = serve;
exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.default = series(buildHtml, styles, scripts, minImages, buildOthers, parallel(serve, watching));