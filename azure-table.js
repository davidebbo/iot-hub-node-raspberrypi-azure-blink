'use strict';

var exec = require('child_process').exec;
var moment = require('moment');
var storage = require('azure-storage');
var config = require('./config.json');
var params = require('./arm-template-param.json').parameters;

var stopReadAzureTable = false;

var readAzureTable = function () {
  var command = 'az storage account show-connection-string -g ' + config.resource_group + ' -n ' + params.resoucePrefix.value + 'storage';
  exec(command, function (err, stdout, stderr) {
    if (err) {
      console.error('ERROR:\n' + err);
      return;
    }
    if (stderr) {
      console.error('Message from STDERR:\n' + stderr);
    }
    if (stdout) {
      var connStr = JSON.parse(stdout).connectionString;
      if (connStr) {
        var tableService = storage.createTableService(connStr);
        var condition = 'PartitionKey eq ? and RowKey gt ? ';
        var tableName = 'DeviceData';
        var timestamp = moment.utc().format('hhmmssSSS');

        var messageCount = 0;

        function readNewMessages() {
          var query = new storage.TableQuery().where(condition, moment.utc().format('YYYYMMDD'), timestamp);

          tableService.queryEntities(tableName, query, null, function (error, result, response) {
            if (error) {
              console.error('Fail to read messages:\n' + error);
              setTimeout(readNewMessages, 0);
              return;
            }

            // result.entries contains entities matching the query
            if (result.entries.length > 0) {
              for (var i = 0; i < result.entries.length; i++) {
                ++messageCount;
                console.log('[Azure Table] Read message #' + messageCount + ': ' + result.entries[i].message['_'] + '\n');

                if (result.entries[i].RowKey['_'] > timestamp) {
                  timestamp = result.entries[i].RowKey['_'];
                }
              }
            }
            if (!stopReadAzureTable) {
              setTimeout(readNewMessages, 0);
            }
          });
        }

        readNewMessages();
      } else {
        console.error('ERROR: Fail to get connection string of Azure Storage account.')
      }
    } else {
      console.error('ERROR: No output when getting connection string of Azure Storage account.');
    }
  });
}

var callback = function (deferred) {
  // Wait 5 more seconds so that Azure function has the chance to process sent messages.
  setTimeout(function () {
    stopReadAzureTable = true;
    deferred.resolve();
  }, 5000);
}



module.exports.readAzureTable = readAzureTable;
module.exports.callback = callback;