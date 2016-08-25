var lodash = require('lodash'),
  AWS = require('aws-sdk'),
  config = require('config'),
  request = require('request'),
  TestReport = require('./TestReport');

AWS.config.region = config.get('aws.region');
process.env.AWS_ACCESS_KEY_ID = config.get('aws.key');
process.env.AWS_SECRET_ACCESS_KEY = config.get('aws.secret_access_key');

var testReport = new TestReport();
var UpdateFile = function () {};

UpdateFile.prototype.s3Params = {
  Bucket: config.get('aws.bucketName'),
  ACL : "public-read",
  ContentEncoding: "text/plain",
  ContentType:"text/plain"
};

UpdateFile.prototype.putEnviromentInfoFile = function(callback, environment) {
  var self = this;

  try {
      self.sendToS3(callback, lodash.toUpper(environment), config.get('aws.envInfoFilename'));
  } catch (e) {
    console.log(e);
    callback("There was an error trying to update the file");
  }
};

UpdateFile.prototype.putRgbFile = function(callback, data) {
  var self = this;

  try {
    self.interpretResultsToRgb(function(err, txt) {
      if (err) {
        callback(err);
      }
      self.sendToS3(callback, txt, config.get('aws.rgbFilename'));
    }, data);
  } catch (e) {
    console.log(e);
    callback("There was an error trying to update the file");
  }
};

UpdateFile.prototype.sendToS3 = function(callback, txt, filename) {
  try {
    var self = this,
      s3 = new AWS.S3({
        region: config.get('aws.region')
      }),
      params = lodash.merge(self.s3Params, { Key: filename, Body: txt });

    s3.putObject(params, function(err, data) {
      if (err) {
        console.log(err);
        callback("An error occurred while trying to upload to s3");
      } else {
        console.log("Retrieved signed URL", data);
        callback();
      }
    });
  } catch (e) {
    console.log(e);
    callback("Something went wrong when trying to upload");
  }
};

UpdateFile.prototype.interpretResultsToRgb = function(callback, data) {
  if(lodash.isUndefined(data)) {
    callback("No data defined");
  }
  try {
    testReport.buildColorReport(callback, data);
  } catch (e) {
    console.log(e);
    callback("Error");
  }

};

module.exports = UpdateFile;

