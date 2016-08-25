var _ = require('lodash'),
  JobData = require('./JobData'),
  BuildAsColor = require('./BuildAsColor'),
  JenkinsClient = require('./JenkinsClient');
var client = new JenkinsClient();

var TestReport = function() {},
  jobData = new JobData(),
  colorProvider = new BuildAsColor();

TestReport.prototype.getHighLevel = function(callback, data, params) {
  if(_.isUndefined(data)) {
    console.log("No data defined");
    callback();
  }
  try {
    var self = this;
    self.createReportHeader(function(err, header) {
      if (err) {
        callback(err);
      }
      var passing = 0, failing = 0, failingText = "Failed tests:\n",
        percentPassing, responseMsg = "";
      console.log(header);
      responseMsg += header;
      _.each(data, function (json) {
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

    }, params, true);

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
  var rgbTxt = "", passing = 0, failing = 0, percentPassing;
  _.each(data, function(job) {
    if (!jobData.isFailing(job)) {
      passing++;
    } else {
      failing++;
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

TestReport.prototype.createReportHeader = function(callback, params, pretty) {
  try {
    var responseMsg = "";
    responseMsg += pretty ? "===Higgins Report===\n" : "";
    _.forIn(params, function (value, key) {
      responseMsg += _.upperFirst(key) + ": " + value;
      responseMsg += (pretty) ? "\n" : "";
    });
    callback(null, responseMsg);
  } catch (e) {
    console.log(e);
    callback(null, "");
  }

};

TestReport.prototype.getSingleJobReport = function(callback, data) {
  try {
    var responseMsg = _.has(data, 'displayName') ? data.displayName : "Untitled Job";
    responseMsg += "\nURL: [" + data.url + "]";
    if (_.has(data, "healthReport")) {
      responseMsg += "\n:clipboard: " + data.healthReport[0].description;
    }

    if (_.has(data, 'builds')) {
      responseMsg += "\nBuilds:";
      _.each(_.take(data.builds, 5), function(build) {
        responseMsg += "\n  Number: " + build.number;
        responseMsg += "\n  Build_URL: [" + build.url + "]"
      });
    }

    callback(null, responseMsg);
  } catch (e) {
    console.log(e);
    callback("An error occurred");
  }
};

module.exports = TestReport;
