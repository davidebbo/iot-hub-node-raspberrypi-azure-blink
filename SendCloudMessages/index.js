// Invoke the blink command on the device.  Use the Run button below to call the function.  Provide the device id
// of the device you wish to call as input.

var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

var connectionString = process.env.AzureIoTHubConnectionString;

module.exports = function (context, input) {
  var client = Client.fromConnectionString(connectionString);
  var targetDevice = input.deviceId;
  var message = new Message('blink');
  message.ack = 'full';
  message.messageId = generateMessageId();

  client.open(function (err) {
    client.getFeedbackReceiver(receiveFeedback);
    if (err) {
      context.error('Could not connect: ' + err.message);
    } else {
      context.log(message);
      client.send(targetDevice, message, function (err) {
        if (err) {
          context.log('ERROR: ' + err);
        }
      });
    }
  });
  // Helper function to print results in the console
  function printResultFor(op) {
    return function printResult(err, res) {
      if (err) {
        context.log(op + ' error: ' + err.toString());
      } else {
        context.log(op + ' status: ' + res.constructor.name);
      }
    };
  }

  function generateMessageId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  function receiveFeedback(err, receiver) {
    receiver.on('message', function (msg) {
      context.log('Feedback message:')
      context.log(msg.getData().toString('utf-8'));
    });
  }
  context.done();

}



