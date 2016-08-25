var lodash = require('lodash'),
  BuildAsColor = function () {};

BuildAsColor.prototype.getBoolean = function(color) {
  switch (color.toLowerCase()) {
    case "blue":
      return true;
    case "green":
      return true;
    case "red":
      return false;
  }
};

BuildAsColor.prototype.getPassOrFail = function(color) {
  switch (color.toLowerCase()) {
    case "blue":
      return "pass";
    case "green":
      return "pass";
    case "red":
      return "fail";
  }
};

BuildAsColor.prototype.getPassOrFailEmoji = function(color) {
  switch (color.toLowerCase()) {
    case "blue":
      return ":thumbsup:";
    case "green":
      return ":thumbsup:";
    case "red":
      return ":facepalm:";
  }
};

module.exports = BuildAsColor;
