var PF = require("pathfinding");
var Chance = require("chance");

var Ponzu = function () {
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
  this.chance = new Chance();
};

Ponzu.UIMap = [
    [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "],
    [" ","|"," "," "," "," "," ","O","r","d","e","r"," "," "," "," "," "," ","|"," "," ","|"," "," "," "," "," ","B","u","i","l","d"," "," "," "," "," "," ","|"," "," ","|"," "," "," "," ","R","e","s","e","a","r","c","h"," "," "," "," ","|"," "," ","|"," "," "," ","N","e","x","t"," ","T","u","r","n"," "," "," "," ","|"," "],
    [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "]
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
  if (!this.windowType) {
    return this.map;
  }
  var window_map = this.getWindowMap();
  var tmp_map = this.map.map(function (row) { return row.concat(); });

  if (this.windowType[0] == 'left') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 2] = window_map[y][x];
      }
    }
  } else if (this.windowType[0] == 'right') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 42] = window_map[y][x];
      }
    }
  } else {
    throw new Error('Invalid windowType' + this.windowType);
  }
  return tmp_map;
};

Ponzu.prototype.getWindowMap = function () { // 36 x 13
  var window_type = this.windowType;
  if (!window_type) {
    return false;
  } else if (window_type[1] == 'character') {
    var character = window_type[2];
    var line = '                                    \n';
    var list = '';
    if (window_type[3] == 'todo') {
      for (var i = 0; i < 8; ++i) {
        var action = character.actions[ (character.state + i) % character.actions.length ];
        list += (action ? '   ' + action[0] + '(' + action[1] + ', ' + action[2] + ')' : '') + line;
      }
    } else {
      for (var i = 0; i < 8; ++i) {
        var item = character.items[i];
        list += (item ? '   ' + item[0] : '') + line;
      }
    }
    var window_str = line +
                     ' ' + this.map[character.y][character.x] + '                Name: ' + character.name + line +
                     ' Group: ' + character.group + '         Location: (' + character.x + ', ' + character.y + ')' + line +
                     ' ' + window_type[3].replace(/^\w/, function(c) { return c.toUpperCase(); }) + ':' + line + list + line;
    return window_str.split("\n").map(function (row_str) { return row_str.split(""); });
  } else {
    throw new Error('Invalid windowType' + window_type);
  }
};

Ponzu.prototype.pointMap = function (point_x, point_y) {
  var character = this.getNearCharacter(point_x, point_y);
  var window_type = this.windowType;
  if (window_type) {
    if (window_type[0] == 'left' && 2 <=  point_x && point_x <= 37 && 1 <= point_y && point_y <= 13 ||
        window_type[0] == 'right' && 42 <=  point_x && point_x <= 77 && 1 <= point_y && point_y <= 13) {
      if (window_type[1] == 'character') {
        window_type[3] = window_type[3] == 'todo' ? 'inventory' : 'todo';
      }
    } else {
      this.windowType = null;
    }
  } else if (character && character.x < 40) {
    this.windowType = [ 'right', 'character', character, 'todo' ];
  } else if (character) {
    this.windowType = [ 'left', 'character', character, 'todo' ];
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
    name: this.chance.first(),
    group: 1,
    actions: [ ['move', 2, 2 ], [ 'move', 70, 13 ] ],
    items: [],
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

