var PF = require("pathfinding");

var Ponzu = function () {
  this.map = this.newMap();
  this.old_map = this.newMap(true);
  this.turn = 0;
  this.gold = 0;
  this.log = "Welcome to Ponzu."

  this.playerNum = 0;
  this.enemyNum = 0;
  this.queue = {};
};

Ponzu.UIMap = [
  [" ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "],
  [" ","|"," "," "," ","R","e","c","o","r","d"," "," "," ","|"," "," ","|"," "," "," ","B","u","i","l","d"," "," "," "," ","|"," "," ","|"," "," "," ","T","r","a","d","e"," "," "," "," ","|"," "," ","|"," "," ","R","e","s","e","a","r","c","h"," "," ","|"," "," ","|"," ","N","e","x","t"," ","T","u","r","n"," "," ","|"," "],
  [" ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "," ","-","-","-","-","-","-","-","-","-","-","-","-","-","-"," "]
];

Ponzu.prototype.newMap = function (empty) {
  var map = [];
  for (var i = 0; i < 15; ++i) {
    var row = [];
    for (var j = 0; j < 80; ++j) {
      row.push(empty ? '' : '.' );
    }
    map.push(row);
  }
  return map;
};

Ponzu.prototype.build = function (type, is_player) {
  var character = {
    type: type,
    isPlayer: is_player,
    created: this.turn,
    dead: false,
    x: 40,
    y: 7
  };
  var map = this.map;
  if (map[7][40] == ".") {
    map[7][40] = "@";
    ++this.playerNum;
    this._addQueue(character, 0);
    return true;
  }
};

// called after 2. user input
Ponzu.prototype.next = function () {
  // 3. character action
  if (Array.isArray(this.queue[this.turn])) {
    this.queue[this.turn].forEach(function (character) {
      if (!character.dead) {
        this._action(character);
      }
    },this);
  }

  // next turn
  delete this.queue[this.turn];
  ++this.turn;

  // 1. check game over
  
};

Ponzu.prototype._addQueue = function (character, add_turn) {
  var next_turn = this.turn + add_turn;
  (Array.isArray(this.queue[next_turn]) ? this.queue[next_turn] : (this.queue[next_turn] = [])).push(character);
};

Ponzu.prototype._action = function (character) {
  var actioned = false;
  var map = this.map;
  var x = character.x, y = character.y;
  // random walk
  x += Math.floor( Math.random() * 3 ) - 1;
  y += Math.floor( Math.random() * 3 ) - 1;
  if (0 <= x && x < 80 && 0 <= y && y < 15 && map[y][x] == '.') {
    map[character.y][character.x] = '.';
    character.x = x; character.y = y;
    map[y][x] = '@';
    actioned = true;
  }
  this._addQueue(character, actioned ? 1 : 1);
};

// for node.js, not for CommonJS
if (typeof module === "object" && module) {
  module.exports = Ponzu;
}

