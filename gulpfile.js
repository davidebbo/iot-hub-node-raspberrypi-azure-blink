'use strict';

var gulp = require('gulp');
var args = require('get-gulp-args')();

var receiveMessages = args['read-storage'] ? require('./azure-table.js').readAzureTable : require('./iot-hub.js').readIoTHub;
var callback = args['read-storage'] ? require('./azure-table.js').callback : require('./iot-hub.js').callback;

function initTasks(gulp) {
  var runSequence = require('run-sequence').use(gulp);
  require('gulp-common')(gulp, 'raspberrypi-node', options);

  gulp.task('receiveMessages', false, receiveMessages);
  gulp.task('callback', false, callback);

  gulp.task('runInternalAndTriggerCallback', false, function () {
    runSequence('run-internal', 'callback');
  })

  gulp.task('run', 'Runs deployed sample on the board', ['receiveMessages', 'runInternalAndTriggerCallback']);
}

module.exports = initTasks(gulp);