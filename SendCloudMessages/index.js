// Invoke the blink command on the device.  Use the Run button below to call the function.  Provide the device id
// of the device you wish to call as input.

var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;
var uuid = require('uuid');

var connectionString = process.env.AzureIoTHubConnectionString;

module.exports = function (context, req) {
  context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

  if (!req.query.deviceId && !(req.body && req.body.deviceId)) {
    context.res = {
      status: 400,
      body: "Please pass a deviceId on the query string or in the request body."
    };
    context.done();
  }

  var client = Client.fromConnectionString(connectionString);
  var targetDevice = req.query.deviceId || req.body.deviceId;
  var message = new Message('blink');
  message.ack = 'full';
  message.messageId = uuid.v4();

  client.open(function (err) {
    if (err) {
      var errMsg = 'ERROR: ' + err.message;
      context.error(errMsg);
      context.res = {
        status: 400,
        body: errMsg
      };
      context.done();
    } else {
      client.getFeedbackReceiver(receiveFeedback);
      //context.log(message);
      client.send(targetDevice, message, function (err) {
        if (err) {
          var errMsg = 'ERROR: ' + err.message;
          context.error(errMsg);
          context.res = {
            status: 503,
            body: errMsg
          };
        } else {
          context.res = {
            status: 200,
            body: 'Message sent successfully.'
          };
        }
        context.done();
      });
    }
  });

  function receiveFeedback(err, receiver) {
    receiver.on('message', function (msg) {
      context.log('Feedback message:\n' + msg.getData().toString('utf-8'))
    });
  }
}



