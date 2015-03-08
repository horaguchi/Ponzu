var PF = require("pathfinding");

var Ponzu = function () {
  this.map = this.newMap();
  this.old_map = this.newMap(true);
};

Ponzu.prototype.newMap = function (empty) {
  var map = [];
  for (var i = 0; i < 20; ++i) {
    var row = [];
    for (var j = 0; j < 80; ++j) {
      row.push(empty ? '' : '.' );
    }
    map.push(row);
  }
  return map;
};

// for node.js, not for CommonJS
if (typeof module === "object" && module) {
  module.exports = Ponzu;
}
