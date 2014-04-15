(function() {
    'use strict';
    
    var gulp        = require('gulp'),
        minifyCSS   = require('gulp-minify-css'),
        uglify      = require('gulp-uglify'),
        concat      = require('gulp-concat'),
        rename      = require('gulp-rename'),
        jshint      = require('gulp-jshint'),
        recess      = require('gulp-recess'),
        
        NAME_CSS    = 'menu.css',
        NAME_JS     = ['menu.js', 'util.io-part.js'],
        SUFFIX      = '.min';
        
    
    gulp.task('css', function() {
        gulp.src('menu.css')
            .pipe(minifyCSS())
            .pipe(rename({
                suffix: SUFFIX
            }))
            .pipe(gulp.dest('./'))
            .on('error', onError);
    });
    
    gulp.task('css-check', function () {
        gulp.src(NAME_CSS)
            .pipe(recess())
            .on('error', onError);
    });
    
    gulp.task('js', function() {
      gulp.src(NAME_JS)
        .pipe(uglify())
        .pipe(concat('menu.min.js'))
        .pipe(gulp.dest('./'))
        .on('error', onError);
    });
    
    gulp.task('js-check', function() {
        var namesStr    = NAME_JS.join(',') + ',gulpfile.js',
            names       = namesStr.split(',');
        
        gulp.src(names)
            .pipe(jshint())
            .pipe(jshint.reporter())
            .on('error', onError);
    });
    
    gulp.task('default', ['css', 'css-check', 'js-check']);
    
    function onError(params) {
        console.log(params.message);
    }
    
})();
