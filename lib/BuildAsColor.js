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

BuildAsColor.prototype.getRgbTextValue = function(color) {
  color = lodash.lowerCase(color);
  console.log("color", color);
  if (color === "blue" || color === "green" || color === "pass") {
    return "102, 255, 102"; //green
  } else {
    return "255, 0, 0"; //red
  }
};

module.exports = BuildAsColor;
