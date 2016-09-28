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

function initTasks(gulp) {
  var runSequence = require('run-sequence').use(gulp);

  require('gulp-common')(gulp, 'raspberrypi-node');

  gulp.task('cleanup', false, cleanup);

  gulp.task('send-device-to-cloud-messages', false, function () {
    runSequence('run-internal', 'cleanup');
  })

  if (doesReadStorage) {
    gulp.task('query-table-storage', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-table-storage', 'send-device-to-cloud-messages']);
  }
  else {
    gulp.task('query-iot-hub-messages', false, receiveMessages);
    gulp.task('run', 'Runs deployed sample on the board', ['query-iot-hub-messages', 'send-device-to-cloud-messages']);
  }
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

var https = require('https');
var querystring = require('querystring');
var sendMessageFunction = '/api/SendCloudMessages';
var config = require('./config.json');
var params = require('./arm-template-param.json').parameters;

gulp.task('send-message', function () {
  var functionApp = params.resoucePrefix.value + 'functionApp.azurewebsites.net';
  var postData = querystring.stringify({
    'deviceId': config.iot_hub_device_id
  });
  var options = {
    hostname: functionApp,
    port: 443,
    path: sendMessageFunction,
    method: 'GET'
  };

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  req.write(postData);
  req.end();

  req.on('error', (e) => {
    console.error(e);
  });

});

initTasks(gulp);

