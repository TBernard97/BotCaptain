var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');
var jsonfile = require('jsonfile')
const config = jsonfile.readFileSync('./config.json')

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../botcaptain.zip');
var kuduApi = config.kudu.kuduAPI;
var userName = config.kudu.userName;
var password = config.kudu.password;

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('botcaptain publish');
  } else {
    console.error('failed to publish botcaptain', err);
  }
});