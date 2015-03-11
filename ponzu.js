var PF = require("pathfinding");

var Ponzu = function () {
  this.map = this.newMap();
  this.matrix = this.map.map(function (row) {
    return row.map(function (tile) { return tile == '.' ? false : true });
  });
  this.turn = 0;
  this.gold = 0;
  this.log = "Welcome to Ponzu."

  this.playerNum = 0;
  this.enemyNum = 0;
  this.queue = [];

  // ライブラリ読み込み
  this.finder = new PF.AStarFinder({
    diagonalMovement: PF.DiagonalMovement.Always
  });
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
  map[2][2] = '<';
  map[13][70] = '>';
  return map;
};

Ponzu.prototype.build = function (type, is_player) {
  var character = {
    type: type,
    isPlayer: is_player,
    created: this.turn,
    dead: false,
    actions: [ ['move', 2, 2 ], [ 'move', 70, 13 ] ],
    state: 0,
    x: 40,
    y: 7
  };
  var map = this.map;
  if (map[7][40] == ".") {
    map[7][40] = "@";
    this.matrix[7][40] = true;
    ++this.playerNum;
    this.queue.push(character);
    return true;
  }
};

// called after 2. user input
Ponzu.prototype.next = function () {
  // 3. character action
  this.queue = this.queue.filter(function (character) {
    this._action(character);
    if (!character.dead) {
      return true;
    }
  }, this);

  // next turn
  //delete this.queue[this.turn];
  ++this.turn;

  // 1. check game over
  
};

Ponzu.prototype._action = function (character) {
  var action = character.actions[character.state];
  var map = this.map;
  var matrix = this.matrix;

  if (action[0] == 'move') {
    var from_x = character.x, from_y = character.y;
    var to_x = action[1], to_y = action[2];
    var grid = new PF.Grid(80, 15, matrix);
    grid.setWalkableAt(to_x, to_y, true);
    var path = this.finder.findPath(from_x, from_y, to_x, to_y, grid);
    if (path.length > 2) { // path found
      next_x = path[1][0];
      next_y = path[1][1];
      map[character.y][character.x] = '.';
      matrix[character.y][character.x] = false;
      character.x = next_x; character.y = next_y;
      map[next_y][next_x] = '@';
      matrix[next_y][next_x] = true;
      this.log = to_x + ',' + to_y + ' -> ' + next_x + ',' + next_y + ' ' + Math.abs(to_x - next_x) + ' ' + Math.abs(to_y - next_y) + ' ' + character.state;
      if (Math.abs(to_x - next_x) <= 1 && Math.abs(to_y - next_y) <= 1) {
        ++character.state;
        if (character.state == character.actions.length) {
          character.state = 0;
        }
      }
    }
  }
};

// for node.js, not for CommonJS
if (typeof module === "object" && module) {
  module.exports = Ponzu;
}

