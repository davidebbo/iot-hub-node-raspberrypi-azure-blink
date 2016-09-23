'use strict';

var wpi = require('wiring-pi');
var config = require('./config.json');
var Message = require('azure-iot-device').Message;
var clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
var deviceConnectionString = 'HostName=' + config.iot_hub_host_name + ';DeviceId=' + config.iot_hub_device_id + ';SharedAccessKey=' + config.iot_hub_device_key;

// GPIO pin of the LED
var CONFIG_PIN = 7;

var MAX_BLINK_TIMES = 20;
var totalBlinkTimes = 1;

wpi.setup('wpi');
wpi.pinMode(CONFIG_PIN, wpi.OUTPUT);

var connectCallback = function (err) {
  if (err) {
    console.log('Could not connect: ' + err);
  } else {
    console.log('Client connected');

    sendMessageAndBlink();
  }
};

function sendMessageAndBlink() {
  var message = new Message(JSON.stringify({ deviceId: config.iot_hub_device_id, messageId: totalBlinkTimes }));
  console.log("[Device] Sending message #" + totalBlinkTimes + ": " + message.getData());
  client.sendEvent(message, sendMessageCallback);
}

function sendMessageCallback(err, res) {
  if (err) {
    console.log('Message error: ' + err.toString());
    return;
  }

  // Blink once after successfully sending one message.
  wpi.digitalWrite(CONFIG_PIN, 1);
  setTimeout(function () {
    wpi.digitalWrite(CONFIG_PIN, 0);
  }, 100);

  if (totalBlinkTimes < MAX_BLINK_TIMES) {
    totalBlinkTimes++;
    setTimeout(sendMessageAndBlink, 2000);
  }
  else {
    process.exit();
  }
}

var client = clientFromConnectionString(deviceConnectionString);
client.open(connectCallback);