'use strict';

var gulp = require('gulp');
var args = require('get-gulp-args')();

var receiveMessages = args['read-storage'] ? require('./azure-table.js').readAzureTable : require('./iot-hub.js').readIoTHub;
var callback = args['read-storage'] ? require('./azure-table.js').callback : require('./iot-hub.js').callback;

function initTasks(gulp) {
  var runSequence = require('run-sequence').use(gulp);

  require('gulp-common')(gulp, 'raspberrypi-node');

  gulp.task('callback', false, callback);

  gulp.task('send-device-to-cloud-messages', false, function () {
    runSequence('run-internal', 'callback');
  })
  
  if (args['read-storage']) {
    gulp.task('query-table-storage', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-table-storage', 'send-device-to-cloud-messages']);
  }
  else{
    gulp.task('query-iot-hub-messages', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-iot-hub-messages', 'send-device-to-cloud-messages']);
  }
}

module.exports = initTasks(gulp);