var _ = require('lodash'),
  JobData = require('./JobData'),
  BuildAsColor = require('./BuildAsColor');

var TestReport = function() {},
  jobData = new JobData(),
  colorProvider = new BuildAsColor();

TestReport.prototype.getHighLevel = function(callback, data, params) {
  if(_.isUndefined(data)) {
    console.log("No data defined");
    callback();
  }
  try {
    var passing = 0, failing = 0, failingText = "Failed tests:\n",
      percentPassing, responseMsg = "===Higgins Report===\n";

    _.forIn(params, function (value, key) {
      responseMsg += _.upperFirst(key) + ": " + value + "\n";
    });

    _.each(data, function (json) {
      console.log("Job data", json);
      if (jobData.isFailing(json)) {
        failing++;
        failingText += jobData.getName(json) + " " + jobData.getUrl(json) + "\n";
      } else {
        passing++;
      }
    });

    percentPassing = _.round((passing / (passing + failing)) * 100, 2);
    responseMsg += percentPassing + "% passing";
    if (failing) {
      responseMsg += "\n with these failing:\n" + failingText;
    }
    callback(null, responseMsg);
  } catch (e) {
    console.log(e);
    callback("Oops, something went wrong");
  }
};

TestReport.prototype.buildColorReport = function (callback, data) {
  if (_.isUndefined(data)) {
    console.log("Data is undefined");
    callback();
  }
  var rgbTxt = "", passing = 0, percentPassing;
  _.each(data, function(job) {
    if (jobData.isFailing(job)) {
      passing++;
    }
  });
  percentPassing = _.floor((passing / (passing + failing)) * 10);
  _.times(percentPassing, function() {

    rgbTxt += colorProvider.getRgbTextValue("pass") + ", ";
  });
  _.times((10 - percentPassing), function () {
    rgbTxt += colorProvider.getRgbTextValue("fail") + ", ";
  });
  callback(null, rgbTxt);
};

module.exports = TestReport;
