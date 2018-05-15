"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var cssmin = require ("gulp-cssmin");
var uglify = require ("gulp-uglify");
var pump = require ("pump");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var del = require("del");
var posthtml = require("gulp-posthtml");
var run = require("run-sequence");

gulp.task("style", function() {
  gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
  });

gulp.task("cssmin", function () {
  return gulp.src("build/css/*.css")
    .pipe(cssmin())
    .pipe(rename({suffix:".min"}))
    .pipe(gulp.dest("build/css"));
});

gulp.task("images", function () {
  return gulp.src("build/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
  });

gulp.task("webp", function () {
  return gulp.src("build/img/**/*{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
  });

gulp.task("sprite", function () {
  return gulp.src("build/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
  });

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff, woff2}",
    "source/img/**",
    "source/js/**"
    ], {
    base: "source"
    })
    .pipe(gulp.dest("build"));
  });

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", function (done){
  run(
    "clean",
    "copy",
    "style",
    "sprite",
    "html",
    "cssmin",
    done
  );
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", ["style"]);
  gulp.watch("source/*.html").on("change", server.reload);
  });
