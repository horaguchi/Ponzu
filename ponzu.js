var PF = require("pathfinding");

var Ponzu = function () {
  this.windowPosition = null;
  this.windowType = null;
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
  for (var y = 0; y < 15; ++y) {
    var row = [];
    for (var x = 0; x < 80; ++x) {
      row.push(empty ? '' : '.' );
    }
    map.push(row);
  }
  map[2][2] = '<';
  map[13][70] = '>';
  return map;
};

Ponzu.prototype.getMap = function () {
  if (!this.windowPosition) {
    return this.map;
  }
  var window_map = this.getWindowMap();
  var tmp_map = this.map.map(function (row) { return row.concat(); });

  if (this.windowPosition == 'left') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 2] = window_map[y][x];
      }
    }
  } else if (this.windowPosition == 'right') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 42] = window_map[y][x];
      }
    }
  } else {
    throw new Error('Invalid windowPosition' + this.windowPosition);
  }
  return tmp_map;
};

Ponzu.prototype.getWindowMap = function () { // 36 x 13
  var window_type = this.windowType;
  if (!window_type) {
    return false;

  } else if (window_type[0] == 'character') {
    var character = window_type[1];
    var window_str = '                                    \n' +
                     ' ' + this.map[character.y][character.x] + '                                   \n' +
                     '                                    \n' +
                     ' (' + character.x + ', ' + character.y + ')                                \n' +
                     '                                    \n' +
                     '                                    \n' +
                     '                                    \n' +
                     '                                    \n' +
                     '                                    \n' +
                     '                                    \n' +
                     '                                    \n' +
                     '                                    \n' +
                     '                                    ';
    return window_str.split("\n").map(function (row_str) { return row_str.split(""); });
  } else {
    throw new Error('Invalid windowType' + window_type);
  }
};

Ponzu.prototype.pointMap = function (point_x, point_y) {
  var character = this.getNearCharacter(point_x, point_y);
  if (this.windowPosition) {
    this.windowPosition = null;
  } else if (character && character.x < 40) {
    this.windowPosition = 'right';
    this.windowType = [ 'character', character ];
  } else if (character) {
    this.windowPosition = 'left';
    this.windowType = [ 'character', character ];
  }
};

Ponzu.prototype.getNearCharacter = function (point_x, point_y) {
  var nearest;
  var min = 10000;
  this.queue.some(function (value) {
    if (value.x == point_x && value.y == point_y) {
      nearest = value;
      return true;
    }
    var d = Math.abs(point_x - value.x) + Math.abs(point_y - value.y);
    if (d < min) {
      nearest = value;
      min = d;
    }
  });
  return nearest;
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
    var next_x, next_y;
    var grid = new PF.Grid(80, 15, matrix);
    grid.setWalkableAt(to_x, to_y, true);
    var path = this.finder.findPath(from_x, from_y, to_x, to_y, grid);
    if (path.length > 2) { // path found
      next_x = path[1][0];
      next_y = path[1][1];

    } else { // random walk
      next_x = from_x + Math.floor( Math.random() * 3 ) - 1;
      next_y = from_y + Math.floor( Math.random() * 3 ) - 1;
      if (next_x < 0 || 80 <= x || y < 0 || 15 <= y && map[next_y][next_x] == '.') {
        return;
      }
    }
    map[character.y][character.x] = '.';
    matrix[character.y][character.x] = false;
    character.x = next_x; character.y = next_y;
    map[next_y][next_x] = '@';
    matrix[next_y][next_x] = true;

    // change state
    if (Math.abs(to_x - next_x) <= 1 && Math.abs(to_y - next_y) <= 1) {
      ++character.state;
      if (character.state == character.actions.length) {
        character.state = 0;
      }
    }
  } else {
    throw new Error('Invalid action:' + action[0]);
  }
};

// for node.js, not for CommonJS
if (typeof module === "object" && module) {
  module.exports = Ponzu;
}

