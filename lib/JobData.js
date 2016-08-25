var _ = require('lodash'),
  goodColors = ["green","blue"],
  JobData;

JobData = function() {

};

JobData.prototype.isFailing = function (json) {
  if (_.has(json, "color")) {
    return !_.includes(goodColors, _.lowerCase(json.color));
  } else {
    return false;
  }
};

JobData.prototype.getName = function (json) {
  if (_.has(json, "name")) {
    return _.upperFirst(json.name);
  } else {
    return "Untitled Job ";
  }
};

JobData.prototype.getUrl = function (json) {
  if (_.has(json, "url")) {
    return "[" + json.url + "]";
  } else {
    return "";
  }
};

module.exports = JobData;
