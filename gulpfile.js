/*
* IoT Hub Raspberry Pi NodeJS Azure Blink - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var eslint = require('gulp-eslint');
var gulp = require('gulp');
var args = require('get-gulp-args')();

var doesReadStorage = args['read-storage'];
var receiveMessages = doesReadStorage ? require('./azure-table.js').readAzureTable : require('./iot-hub.js').readIoTHub;
var cleanup = doesReadStorage ? require('./azure-table.js').cleanup : require('./iot-hub.js').cleanup;

var sendMessage = require('./azure-func.js').sendMessage;

function initTasks(gulp) {
  var runSequence = require('run-sequence').use(gulp);

  require('gulp-common')(gulp, 'raspberrypi-node', { appName: 'az-blink' });

  gulp.task('cleanup', false, cleanup);

  gulp.task('send-device-to-cloud-messages', false, function () {
    runSequence('run-internal', 'cleanup');
  })

  if (doesReadStorage) {
    gulp.task('query-table-storage', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-table-storage', 'send-device-to-cloud-messages']);
  } else {
    gulp.task('query-iot-hub-messages', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-iot-hub-messages', 'send-device-to-cloud-messages']);
  }

  gulp.task('send-message', false, sendMessage);
}

gulp.task('lint', () => {
  return gulp.src([
    './**/*.js',
    '!node_modules/**',
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

initTasks(gulp);