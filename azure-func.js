/*
* IoT Hub Raspberry Pi NodeJS Azure Blink - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
*/
'use strict';

var https = require('https');
var querystring = require('querystring');

var config = require('./config.json');
var params = require('./arm-template-param.json').parameters;

function getDeviceId(connectionString) {
  var elements = connectionString.split(';');
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].startsWith('DeviceId=')) {
      return elements[i].slice(9);
    }
  }
}

var deviceId = getDeviceId(config.iot_device_connection_string);
var queryParams = querystring.stringify({
  'deviceId': deviceId
});
var azureFuncPath = '/api/SendCloudMessages/?' + queryParams;
var azureFuncHostname = params.resoucePrefix.value + 'functionApp.azurewebsites.net';

var triggerAzureFunc = function () {
  var options = {
    hostname: azureFuncHostname,
    port: 443,
    path: azureFuncPath,
    method: 'GET'
  };

  var req = https.request(options, (res) => {
    res.on('data', (d) => {
      console.log('[Azure Func] ' + d);
    });
  });
  req.end();

  req.on('error', (e) => {
    console.error('[Azure Func] ' + e);
  });
};

module.exports.sendMessage = triggerAzureFunc;
