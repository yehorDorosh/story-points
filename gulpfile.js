/* global process */
'use strict'
const gulp = require('gulp');
const sass = require('gulp-sass');
const debug = require('gulp-debug'); // Выводит имена файлов прошедшие через него
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify'); // обработчик ошибок
const newer = require('gulp-newer');
const plumber = require('gulp-plumber'); // навешивает обрадотчик ошибок на все потоки таски
const babel = require('gulp-babel');

sass.compiler = require('node-sass');
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';

const srcName = 'src';
const destName = 'dest';
const paths = {
  src: {
    img: `${srcName}/img/**/*.*`,
    html: `${srcName}/html/**/*.html`,
    styles: `${srcName}/styles/**/*.scss`,
    scripts: `${srcName}/js/**/*.js`
  },
  dest: {
    img: `${destName}/img`,
    html: `${destName}`,
    styles: `${destName}/styles`,
    scripts: `${destName}/js`
  }
}

gulp.task('img', () => {
  return gulp.src(paths.src.img, {since: gulp.lastRun('img')}) // since: применяется только к тем файлам которые изменились с заданной даты  gulp.lastRun - дата последнего запуска задачи
    .pipe(newer(paths.dest.img)) // Пропускает только новые файлы или новые версии уже имеющихся файлов 
    .pipe(debug({title: 'img'}))
    .pipe(gulp.dest(paths.dest.img));
});

gulp.task('html', () => {
  return gulp.src(paths.src.html, {since: gulp.lastRun('html')})
    .pipe(newer(paths.dest.html))
    .pipe(debug({title: 'html'}))
    .pipe(gulp.dest(paths.dest.html));
});

gulp.task('clean', () => {
  return del(destName);
});

gulp.task('styles', () => {
  return gulp.src(paths.src.styles, {since: gulp.lastRun('styles')})
    .pipe(plumber({ // применяет обработчик ошибок ко всем потокам сразу
      errorHandler: notify.onError(err => {
        return {
          title: 'Styles task error occured',
          message: err.message
        };
      })
    }))
    .pipe(newer(paths.dest.styles))
    .pipe(debug({title: 'styles'}))
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(sass())
    .pipe(gulpIf(isDev, sourcemaps.write())) // по умолчанию сорсмап пишется в тот же файл как коментарий, параметр '.' создаст отдельный файл для соср мапа
    .pipe(gulp.dest(paths.dest.styles));
});

gulp.task('scripts', () => {
  return gulp.src(paths.src.scripts, {since: gulp.lastRun('scripts')})
    .pipe(newer(paths.dest.scripts))
    .pipe(debug({title: 'scripts'}))
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(gulpIf(isDev, sourcemaps.write()))
    .pipe(gulp.dest(paths.dest.scripts));
});

gulp.task('serve', () =>{
  browserSync.init({
    server: destName // можно убрать параметр, тогда нужно в ручную добавить на страницу скрип, в консоле пропишется штмл вставки
  });
  browserSync.watch(`${destName}/**/*.*`).on('change', browserSync.reload);
});

gulp.task('watch', () => {
  gulp.watch(paths.src.img, gulp.series('img'));
  gulp.watch(paths.src.html, gulp.series('html'));
  gulp.watch(paths.src.styles, gulp.series('styles'));
  gulp.watch(paths.src.scripts, gulp.series('scripts'));
});

gulp.task('build', gulp.series(
  'clean',
  'styles',
  'scripts',
  gulp.parallel('img', 'html')
  )
);

gulp.task( 'dev', gulp.series('build', gulp.parallel('watch', 'serve')));