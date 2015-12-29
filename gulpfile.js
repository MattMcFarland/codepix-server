var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');


gulp.task('default', ['browser-sync']);

gulp.task('browser-sync', ['nodemon'], () => {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    reloadDelay: 50,
    reloadDebounced: 50,
    online: false,
    files: [
      'node_modules/codepix-client/lib/public/js/main.min.js',
      'node_modules/codepix-client/lib/public/js/vendor/vendor.min.js',
      'node_modules/codepix-client/lib/public/style/main.css'
    ],
    browser: 'google chrome',
    port: 7000
  });
});
gulp.task('nodemon', function (cb) {

  var started = false;

  return nodemon({
    restartable: 'rs',
    verbose: false,
    script: 'lib/bin/server.js',
    watch: [
    'src/**/*.js'
  ],
    env: {
    NODE_ENV: 'development'
  },
    ext: 'js json'
  }).on('start', () => {
    if (!started) {
      cb();
      started = true;
    }
  });
});
