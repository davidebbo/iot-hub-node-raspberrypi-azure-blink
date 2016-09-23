var args = require('get-gulp-args')();

var mainFunc = args['read-storage'] ? require('./azure-table.js').readAzureTable : require('./iot-hub.js').readIoTHub;
var callback = args['read-storage'] ? require('./azure-table.js').callback : require('./iot-hub.js').callback;

var options = {
  main: mainFunc,
  callback: callback,
};

require('gulp-common')(require('gulp'), 'raspberrypi-node-az-blink', options);
