var gulp = require('gulp-help')(require('gulp'));

require('./gulp-common/raspberrypi-node.js').initTasks(gulp);

// For DEMO purpose. We can discuss later whether we should put it to gulp-common.
var storage = require('azure-storage');
var moment = require('moment');
var params = require('./parameter.json');
var exec = require('child_process').exec;
var defaultResourceGroup = 'iot-hub-test-rg';

// TODO: allow user to pass resource group as parameter if default value is not what they want.
gulp.task('read-message', function () {
  var command = 'az storage account connection-string -g ' + defaultResourceGroup + ' -n ' + params.parameters.resoucePrefix.value + 'storage';
  exec(command, function (err, stdout, stderr) {
    if (err) {
      console.log('ERROR:\n' + err);
      return;
    }
    if (stderr) {
      console.log('Message from STDERR:\n' + stderr);
    }
    if (stdout) {
      var connStr = JSON.parse(stdout).ConnectionString;
      if (connStr) {
        var tableService = storage.createTableService(connStr);
        var condition = 'PartitionKey eq ? and RowKey gt ? ';
        var tableName = 'DeviceData';
        var timestamp = moment.utc().format('hhmmssSSS');

        function readNewMessage() {
          var query = new storage.TableQuery().where(condition, moment.utc().format('YYYYMMDD'), timestamp);

          tableService.queryEntities(tableName, query, null, function (error, result, response) {
            if (error) {
              console.log('Fail to read messages:\n' + error);
              setTimeout(readNewMessage, 0);
              return;
            }

            // result.entries contains entities matching the query
            if (result.entries.length == 0) {
              console.log('\nNo New Message.');
              setTimeout(readNewMessage, 0);
              return;
            }

            console.log('\nNew Messages:');
            timestamp = moment.utc().format('hhmmssSSS');
            for (var i = 0; i < result.entries.length; i++) {
              console.log(result.entries[i].message['_']);
              // Update timestamp for next table query
              if (result.entries[i].RowKey['_'] > timestamp) {
                timestamp = result.entries[i].RowKey['_'];
              }
            }
            setTimeout(readNewMessage, 0);
          });
        }

        readNewMessage();
      } else {
        console.log('ERROR: Fail to get connection string of Azure Storage account.')
      }
    } else {
      console.log('ERROR: No output when getting connection string of Azure Storage account.');
    }
  });
});
