'use strict';

// This function is triggered each time a message is revieved in the IoTHub.  
// The message payload is persisted in an Azure Storage Table
var moment = require('moment');

module.exports = function (context, iotHubMessage) {
    context.log('Message received: ' + JSON.stringify(iotHubMessage));
    context.bindings.outputTable = {
        "partitionKey": moment().format('YYYYMMDD'),
        "rowKey": moment().format('hhmmssSSS'),
        "message": JSON.stringify(iotHubMessage)
    };
    context.done();
};