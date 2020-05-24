// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp')
// Importing all the Gulp-related packages we want to use
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

const clean = require('gulp-clean')

const replace = require('gulp-replace')

const browserSync = require('browser-sync')
const server = browserSync.create()

// File paths
const files = {
  imagePath: 'src/img/*.{png,jpg,gif,ico}',
  scssPath: 'src/scss/**/*.scss',
  htmlPath: 'src/*.html',
  jsPath: 'src/js/**/*.js',
  jsLibPath: 'src/lib/**/*.js',
}

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return src(files.scssPath)
    .pipe(sourcemaps.init()) // initialize sourcemaps first
    .pipe(sass().on('error', sass.logError)) // compile SCSS to CSS
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: ['> 1%', 'last 2 versions'],
        }),
        cssnano(),
      ])
    ) // PostCSS plugins
    .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
    .pipe(dest('dist'))
    .pipe(
      browserSync.reload({
        // Reloading with Browser Sync
        stream: true,
      })
    ) // put final CSS in dist folder
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask() {
  return src(files.jsPath)
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(dest('dist'))
}

// JS task: concatenates and uglifies JS files to script.js
function jsLibTask() {
  return src([
    'node_modules/swiper/js/swiper.min.js', // 添加依赖js库文件
    files.jsLibPath, // 添加依赖js库文件
  ])
    .pipe(concat('lib.js'))
    .pipe(uglify())
    .pipe(dest('dist'))
}

// image task
function imageTask() {
  return src(files.imagePath)
    .pipe(
      imagemin({
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
      })
    )
    .pipe(dest('dist/img'))
}

// Cachebust
function cacheBustTask() {
  var cbString = new Date().getTime()
  return src([files.htmlPath])
    .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
    .pipe(dest('dist'))
}
// clean task

function cleanTask() {
  return src('dist', { read: false }).pipe(clean())
}
function reloadTask(done) {
  server.reload()
  done()
}

function serveTask(done) {
  server.init({
    server: {
      baseDir: 'dist',
    },
  })
  done()
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
  watch(
    files.scssPath,
    { interval: 1000, usePolling: true }, //Makes docker work
    series(scssTask, cacheBustTask, reloadTask)
  )
  watch(
    [files.jsPath, files.jsLibPath],
    { interval: 1000, usePolling: true }, //Makes docker work
    series(parallel(jsTask, jsLibTask), cacheBustTask, reloadTask)
  )
  watch(
    files.imagePath,
    { interval: 1000, usePolling: true }, //Makes docker work
    series(imageTask, cacheBustTask, reloadTask)
  )
  watch(
    files.htmlPath,
    { interval: 1000, usePolling: true }, //Makes docker work
    series(cacheBustTask, reloadTask)
  )
}
// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
  cleanTask,
  parallel(scssTask, jsTask, jsLibTask, imageTask),
  cacheBustTask,
  serveTask,
  watchTask
)
