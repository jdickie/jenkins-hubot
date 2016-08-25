// Returns a jenkins client for use in other classes
var config = require('config'),
  lodash = require('lodash'),
  async = require('async'),
  JobData = require('./JobData.js');

var jobProvider = new JobData();

var JenkinsClient = function() {
  this._client = require('jenkins')({baseUrl: config.get("JenkinsUrl")});
};

JenkinsClient.prototype._client = null;

/**
 * @param callback
 * @param environment
 * @param codebase
 */
JenkinsClient.prototype.getMultiJobSubJobStatuses = function(callback, environment, codebase) {
  var self = this;
  try {
    console.log("Getting information on " + codebase + " for " + environment);
    var jobNames = config.get("Jobs." + environment + "." + codebase);
    self.getJobData(callback, jobNames, environment);
  } catch (e) {
    console.log(e);
    callback();
  }
};

JenkinsClient.prototype.getJobsWithPrefix = function(prefix, jobs) {
  return lodash.filter(jobs, function (j) {
    return lodash.startsWith(j.name, prefix);
  });
};

JenkinsClient.prototype.getJobData = function(callback, jobNames, environment) {
  var self = this,
    results = {};
  try {
    async.each(jobNames, function(name, eachCallback) {
      console.log("Fetching information for job:", name);
      self._client.job.get(name, function(err, data) {
        if (err) {
          console.log(err);
          eachCallback();
        }
        if (!lodash.isUndefined(data) && !lodash.isUndefined(data.jobs)) {
          var filteredJobs = self.getJobsWithPrefix(config.get("Jobs." + environment + ".jobPrefix"), data.jobs);

          lodash.each(filteredJobs, function(job) {
            results[job.name] = job;
          });
          eachCallback(null);
        } else {
          eachCallback("Jenkins returned no information for " + environment);
        }
      });
    }, function (err) {
      if (err) {
        console.log(err);
      }
      callback(null, results);
    });
  } catch (e) {
    console.log(e);
    callback();
  }
};

JenkinsClient.prototype.getMultiJobTestStatus = function(callback, environment) {
  try {
    var self = this,
      jobNames = config.get("Jobs." + environment + ".all");
    console.log("Getting info on " + environment);
    self.getJobData(callback, jobNames, environment);
  } catch(e) {
    console.log(e);
    callback();
  }
};

module.exports = JenkinsClient;
