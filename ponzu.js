var PF = require("pathfinding");
var Chance = require("chance");

var Ponzu = function () {
  // initial library
  this.finder = new PF.AStarFinder({
    diagonalMovement: PF.DiagonalMovement.Always
  });
  this.chance = new Chance();

  // initial property
  this.windowType = null;
  this.turn = 0;
  this.gold = 0;
  this.log = "Welcome to Ponzu 7DRL 2015 Ver."
  this.unitNum = 0;
  this.queue = [];
  this.orderMax = 4;
  this.inventoryMax = 3;
  this.buildTypeList = [
    ['@', 'a worker', []], // Group 0
    ['@', 'a worker', []], // Group 1
    ['@', 'a worker', []], // Group 2
    ['@', 'a worker', []], // Group 3
    ['@', 'a worker', []], // Group 4
    ['@', 'a worker', []], // Group 5
    ['@', 'a worker', []], // Group 6
    ['@', 'a worker', []], // Group 7
    ['@', 'a worker', []], // Group 8
    ['@', 'a worker', []], // Group 9
    ['<', 'a base', []], // base, not chosen
    ['#', 'a soybean field', [ ['produce', '%', 'a bag of soybeans'], ['wait'], ['wait'] ]],
    ['#', 'a sudachi field', [ ['produce', '%', 'a sudachi'], ['wait'], ['wait'] ]],
    ['#', 'a rice paddy field', [ ['produce', '%', 'a bag of sticky rice'], ['wait'], ['wait'] ]],
    ['[', 'a box', [ ]],
    ['(', 'a juicer', [ ['juice'], ['wait'], ['wait'], ['wait'] ]],
    ['{', 'a brewery', [ ['brew'], ['wait'], ['wait'], ['wait'], ['wait'] ]]
  ];

  // initial map
  this.map = this.newMap();
  this.matrix = this.map.map(function (row) {
    return row.map(function (tile) { return tile == '.' ? false : true });
  });
  var base_x = parseInt(Math.random() * 80), base_y = parseInt(Math.random() * 15);
  this.build(10, base_x, base_y); // build a base
  this.build(1); // build a worker
  this.build(11); // build a soybean field
};

/**************************************
 * Map methods
 **************************************/
Ponzu.prototype.newMap = function (empty) {
  var map = [];
  for (var y = 0; y < 15; ++y) {
    var row = [];
    for (var x = 0; x < 80; ++x) {
      row.push(empty ? '' : ' ' );
    }
    map.push(row);
  }
  return map;
};

Ponzu.prototype.makeVisible = function (point_x, point_y) {
  var map = this.map;
  var matrix = this.matrix;
  var block = 3;
  var x1 = point_x - block, x2 = point_x + block, y1 = point_y - block, y2 = point_y + block;
  x1 = x1 < 0 ? 0 : x1;
  y1 = y1 < 0 ? 0 : y1;
  x2 = 79 < x2 ? 79 : x2;
  y2 = 14 < y2 ? 14 : y2;

  for (var y = y1; y <= y2; ++y) {
    for (var x = x1; x <= x2; ++x) {
      map[y][x]    = map[y][x] == ' ' ? '.' : map[y][x];
      matrix[y][x] = map[y][x] == '.' ? false : true;
    }
  }
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
  } else if (this.windowType[0] == 'center') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 22] = window_map[y][x];
      }
    }
  } else if (this.windowType[0] == 'ui') {
    // nothing

  } else {
    throw new Error('Invalid windowType' + this.windowType);
  }
  return tmp_map;
};

/**************************************
 * Window Map methods
 **************************************/
Ponzu.prototype.getWindowMap = function () { // 36 x 13
  var window_type = this.windowType;
  if (!window_type) {
    return false;

  } else if (window_type[1] == 'order') {
    return Ponzu.FIRST_ORDER_WINDOW;

  } else if (window_type[1] == 'character') {
    return this.getCharacterWindowMap();

  } else if (window_type[1] == 'build') {
    return this.getBuildWindowMap();

  } else if (window_type[1] == 'research') {
    return this.getResearchWindowMap();

  } else {
    throw new Error('Invalid windowType' + window_type);
  }
};

Ponzu.prototype.getCharacterWindowMap = function () {
  var window_type = this.windowType;
  var character = window_type[2];
  var actions = this.buildTypeList[character.group][2];
  var line = '                                    \n';
  var list = '';
  if (window_type[3] == 'todo') {
    for (var i = 0; i < 8; ++i) {
      var action = actions[ (character.state + i) % actions.length ];
      list += (action ? '   ' + action[0] + '(' + action.slice(1).join(',') + ')': '') + line;
    }
  } else {
    for (var i = 0; i < 8; ++i) {
      var item = character.items[i];
      list += (item ? '   ' + item[0] + ' - ' + item[1] : '') + line;
    }
  }
  var window_str = line +
    ' ' + this.map[character.y][character.x] + '                Location: (' + character.x + ', ' + character.y + ')' + line +
    (this.map[character.y][character.x] == '@'
      ? ' Group: ' + character.group + '         Name: ' + character.name + line
      : ' Type: ' + character.type + line) +
    ' ' + window_type[3].replace(/^\w/, function(c) { return c.toUpperCase(); }) + ':' + line + list + line;
  return window_str.split("\n").map(function (row_str) { return row_str.split(""); });
};

Ponzu.FIRST_ORDER_WINDOW = [
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "],
  [" ","|","G","r","o","u","p"," ","1"," ","|"," "," ","|","G","r","o","u","p"," ","2"," ","|"," "," ","|","G","r","o","u","p"," ","3"," ","|"," "],
  [" ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "],
  [" ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "],
  [" ","|","G","r","o","u","p"," ","4"," ","|"," "," ","|","G","r","o","u","p"," ","5"," ","|"," "," ","|","G","r","o","u","p"," ","6"," ","|"," "],
  [" ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "],
  [" ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "],
  [" ","|","G","r","o","u","p"," ","7"," ","|"," "," ","|","G","r","o","u","p"," ","8"," ","|"," "," ","|","G","r","o","u","p"," ","9"," ","|"," "],
  [" ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","+"," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," ","+","-","-","-","-","-","-","-","-","+"," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," ","|","G","r","o","u","p"," ","0"," ","|"," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," ","+","-","-","-","-","-","-","-","-","+"," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "]
];

Ponzu.FIRST_BUILD_WINDOW = [
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" ","?"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","L","o","c","a","t","i","o","n",":"," ","(","?","?",",","?","?",")"," "],
  [" ","T","y","p","e",":"," ","?","?","?"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
  [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "],
  [" ","|"," "," "," "," "," "," "," ","B","u","i","l","d"," ","a"," ","u","n","i","t"," ","(","$","5",")"," "," "," "," "," "," "," "," ","|"," "],
  [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "]
];

Ponzu.prototype.getBuildWindowMap = function () {
  var window_type = this.windowType;
  var character = window_type[2];
  var line = '                                    \n';
  var list = '';
  if (!character) {
    return Ponzu.FIRST_BUILD_WINDOW;
  }
  var window_str = line +
    ' ' + this.map[character.y][character.x] + '                Location: (' + character.x + ', ' + character.y + ')' + line +
    (this.map[character.y][character.x] == '@'
      ? ' Group: ' + character.group + '         Name: ' + character.name + line
      : ' Type: ' + character.type + line) +
    line + line + line + line + line + line + line + line;
  var window_map = window_str.split("\n").map(function (row_str) { return row_str.split(""); });
  window_map[ 9] = [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "];
  window_map[10] = [" ","|"," "," "," "," "," ","R","e","r","o","l","l"," ","t","h","i","s"," ","u","n","i","t"," ","(","$","1",")"," "," "," "," "," "," ","|"," "];
  window_map[11] = [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "];
  window_map[12] = [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "];
  return window_map;
};

Ponzu.prototype.getResearchWindowMap = function () {
  var line = '                                    \n';
  var window_str = line + " Research" + line + line + line + line + line + line + line + line + line + line + line + line + line + line + line + line + line;
  return window_str.split("\n").map(function (row_str) { return row_str.split(""); });
};

/**************************************
 * UI (buttons) methods
 **************************************/
Ponzu.UI = [
    [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "],
    [" ","|"," "," "," "," "," ","O","r","d","e","r"," "," "," "," "," "," ","|"," "," ","|"," "," "," "," "," ","B","u","i","l","d"," "," "," "," "," "," ","|"," "," ","|"," "," "," "," ","R","e","s","e","a","r","c","h"," "," "," "," ","|"," "," ","|"," "," "," ","N","e","x","t"," ","T","u","r","n"," "," "," "," ","|"," "],
    [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "]
];

Ponzu.prototype.getUI = function () {
  var window_type = this.windowType;
  if (window_type && window_type[0] == 'ui' && window_type[1] == 'order') {
    return this.getOrderUI();
  } else {
    return Ponzu.UI;
  }
};
Ponzu.ACTION_ABBR = {
  'move': 'mv',
  'pickup': 'pu',
  'drop': 'drp'
};
Ponzu.prototype.getOrderUI = function () {
  var window_type = this.windowType;
  var actions = this.windowType[3];
  var actions_ui = [ '' ];
  var latest_line = '';
  for (var i = 0; i < actions.length; ++i) {
    var action = actions[i];
    var word = Ponzu.ACTION_ABBR[actions[i][0]] + '(' + actions[i].slice(1).join(',') + ')';
    if ((latest_line + word).length <= 53) {
      actions_ui[actions_ui.length - 1] += word;
      latest_line = actions_ui[actions_ui.length - 1];
    } else {
      actions_ui.push(word);
      latest_line = word;
    }
  }
  word = '(Group ' + this.windowType[2] + ' ' + actions.length + '/' + this.orderMax + ')';
  if ((latest_line + word).length <= 53) {
    actions_ui[actions_ui.length - 1] += word;
  } else {
    actions_ui.push(word);
  }
  actions_ui = actions_ui.map(function (line) { return line.split(""); }).slice(-3);

  var out = [
    [" "," "," "," "," ",")"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","+","-","-","-","-","+"," ","+","-","-","-","-","-","-","+"," ","+","-","-","-","-","-","-","+"," "],
    [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","|","S","a","v","e","|"," ","|","D","e","l","e","t","e","|"," ","|","C","a","n","c","e","l","|"," "],
    [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","+","-","-","-","-","+"," ","+","-","-","-","-","-","-","+"," ","+","-","-","-","-","-","-","+"," "]
  ];
  for (var y = 0; y < 3; ++y) {
    for (var x = 0; x < 54; ++x) {
      out[y][x] = (actions_ui[y] && actions_ui[y][x]) || out[y][x];
    }
  }
  return out;
};

/**************************************
 * Touch & Point methods
 **************************************/
Ponzu.prototype.point = function (x, y) {
  var window_type = this.windowType;
  var mx = parseInt(x / this.fontX), my = parseInt(y / this.fontY);
  if (mx < 0 || 80 <= mx || my < 0 || 20 <= my) {
    return false; // no update

  } else if (my == 0) { // log line
    return false; // no update

  } else if (1 <= my && my <= 16) { 
    this.pointMap(mx, my - 1);

  } else if (16 < my) { // UI button
    if (window_type && window_type[0] == 'ui' && window_type[1] == 'order') {
      if (55 <= mx && mx <= 60) {
        this.buildTypeList[window_type[2]][2] = this.windowType[3];
        this.windowType = null;

      } else if (62 <= mx && mx <= 69) {
        this.windowType[3] = [];

      } else if (71 <= mx && mx <= 78) {
        this.windowType = null;

      }
    } else {
      if (1 <= mx && mx <= 18) {
        this.windowType = [ 'center', 'order' ];

      } else if (21 <= mx && mx <= 38) {
        this.windowType = [ 'center', 'build', null ];

      } else if (41 <= mx && mx <= 58) {
        this.windowType = [ 'center', 'research' ];

      } else if (61 <= mx && mx <= 78) {
        this.next();
      }
    }
  }
  return true; // redraw
};

Ponzu.prototype.pointMap = function (point_x, point_y) {
  var character = this.getNearCharacter(point_x, point_y);
  var window_type = this.windowType;
  if (window_type) {
    if (window_type[0] == 'left'   &&  2 <= point_x && point_x <= 37 && 1 <= point_y && point_y <= 13 ||
        window_type[0] == 'center' && 22 <= point_x && point_x <= 57 && 1 <= point_y && point_y <= 13 ||
        window_type[0] == 'right'  && 42 <= point_x && point_x <= 77 && 1 <= point_y && point_y <= 13) {
      var window_x = point_x - (window_type[0] == 'left' ? 2 : window_type[0] == 'center' ? 22 : 42), window_y = point_y - 1;

      // character window
      if (window_type[1] == 'character') {
        window_type[3] = window_type[3] == 'todo' ? 'inventory' : 'todo';

      // build window
      } else if (window_type[1] == 'build') {
        if (1 <= window_x && window_x <= 34 && 9 <= window_y && window_y <= 11) {
          var created_character = this.windowType[2];
          if (created_character) { // reroll
            this.map[created_character.y][created_character.x] = '.';
            created_character.dead = true;
            --this.unitNum;
          }
          created_character = this.build();
          if (created_character) {
            this.windowType[0] = created_character.x < 40 ? 'right' : 'left';
            this.windowType[2] = created_character;
          }
        }

      // order window
      } else if (window_type[1] == 'order') {
        if (        1 <= window_x && window_x <= 10 && 1 <= window_y && window_y <= 3) {
          this.windowType = [ 'ui', 'order', 1, this.buildTypeList[1][2].concat() ];
        } else if (13 <= window_x && window_x <= 22 && 1 <= window_y && window_y <= 3) {
          this.windowType = [ 'ui', 'order', 2, this.buildTypeList[2][2].concat() ];
        } else if (25 <= window_x && window_x <= 34 && 1 <= window_y && window_y <= 3) {
          this.windowType = [ 'ui', 'order', 3, this.buildTypeList[3][2].concat() ];
        } else if ( 1 <= window_x && window_x <= 10 && 4 <= window_y && window_y <= 6) {
          this.windowType = [ 'ui', 'order', 4, this.buildTypeList[4][2].concat() ];
        } else if (13 <= window_x && window_x <= 22 && 4 <= window_y && window_y <= 6) {
          this.windowType = [ 'ui', 'order', 5, this.buildTypeList[5][2].concat() ];
        } else if (25 <= window_x && window_x <= 34 && 4 <= window_y && window_y <= 6) {
          this.windowType = [ 'ui', 'order', 6, this.buildTypeList[6][2].concat() ];
        } else if ( 1 <= window_x && window_x <= 10 && 7 <= window_y && window_y <= 9) {
          this.windowType = [ 'ui', 'order', 7, this.buildTypeList[7][2].concat() ];
        } else if (13 <= window_x && window_x <= 22 && 7 <= window_y && window_y <= 9) {
          this.windowType = [ 'ui', 'order', 8, this.buildTypeList[8][2].concat() ];
        } else if (25 <= window_x && window_x <= 34 && 7 <= window_y && window_y <= 9) {
          this.windowType = [ 'ui', 'order', 9, this.buildTypeList[9][2].concat() ];
        } else if (13 <= window_x && window_x <= 22 && 10 <= window_y && window_y <= 12) {
          this.windowType = [ 'ui', 'order', 0, this.buildTypeList[0][2].concat() ];
        }
      }
    // order UI
    } else if (window_type[0] == 'ui' && window_type[1] == 'order') {
      this.addOrder(this.getNearCharacter(point_x, point_y, true));

    } else {
      this.windowType = null;
    }

  } else if (character && character.x < 40) {
    this.windowType = [ 'right', 'character', character, 'todo' ];

  } else if (character) {
    this.windowType = [ 'left', 'character', character, 'todo' ];
  }
};

Ponzu.prototype.getNearCharacter = function (point_x, point_y, not_worker) {
  var nearest;
  var min = 10000;
  this.queue.some(function (value) {
    if (value.dead || (not_worker && value.type == 'a worker')) {
      return false;
    }
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

Ponzu.prototype.addOrder = function (character) {
  var window_type = this.windowType;
  //if (window_type[3].length < this.orderMax) {
    window_type[3].push(['move', character.x, character.y]);
  //}
};

Ponzu.isBuildFree = function (pos_x, pos_y, map) {
  var x1 = pos_x - 1, x2 = pos_x, x3 = pos_x + 1;
  var y1 = pos_y - 1, y2 = pos_y, y3 = pos_y + 1;
  x1 = x1 < 0 ? 0 : x1;
  y1 = y1 < 0 ? 0 : y1;
  x3 = 79 < x3 ? 79 : x3;
  y3 = 14 < y3 ? 14 : y3;

  if (map[y1][x1] == '.' && map[y1][x2] == '.' && map[y1][x3] == '.' &&
      map[y2][x1] == '.' && map[y2][x2] == '.' && map[y2][x3] == '.' &&
      map[y3][x1] == '.' && map[y3][x2] == '.' && map[y3][x3] == '.') {
    return true;
  }
};

Ponzu.prototype.build = function (force_index, force_x, force_y) {
  var map = this.map;
  var pos_list = [];
  if (typeof force_x == 'number' && typeof force_y == 'number') {
    pos_list.push([force_x, force_y]);
  } else {
    for (var y = 0; y < 15; ++y) {
      for (var x = 0; x < 80; ++x) {
        if (Ponzu.isBuildFree(x, y, map)) {
          pos_list.push([x, y]);
        }
      }
    }
    if (pos_list.length == 0) {
      return false;
    }
  }
  var pos = pos_list[parseInt(Math.random() * pos_list.length)];
  var pos_x = pos[0], pos_y = pos[1];

  var index = parseInt(Math.random() * this.buildTypeList.length);
  if (typeof force_index == 'number') {
    index = force_index;
  } else {
    while (index == 10) {
      index = parseInt(Math.random() * this.buildTypeList.length); // 10 is base number
    }
  }
  var target_type = this.buildTypeList[index];

  var character = {
    type: target_type[1],
    created: this.turn,
    dead: false,
    name: this.chance.first(),
    group: index,
    items: [ ],
    state: 0,
    x: pos_x,
    y: pos_y
  };
  map[pos_y][pos_x] = target_type[0];
  this.matrix[pos_y][pos_x] = true;
  this.queue.push(character);
  this.makeVisible(pos_x, pos_y, map);
  ++this.unitNum;
  if (typeof force_index != 'number') {
    this.log = "You build " + target_type[1] + ".";
  }
  return character;
};

/**************************************
 * AI methods
 **************************************/

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
  ++this.turn;

  // 1. check game over
  
};

Ponzu.prototype._action = function (character) {
  var actions = this.buildTypeList[character.group][2];
  var action = actions[character.state];
  var map = this.map;
  var matrix = this.matrix;

  if (!action) {
    character.state = 0;
    return;

  } else if (action[0] == 'move') {
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
      if (next_x < 0 || 80 <= next_x || next_y < 0 || 15 <= next_y || map[next_y][next_x] != '.') {
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
    }

  } else if (action[0] == 'brew') {
    ++character.state;

  } else if (action[0] == 'juice') {
    ++character.state;

  } else if (action[0] == 'produce') {
    if (character.items.length < this.inventoryMax) {
      character.items.push(action.slice(1));
      ++character.state;
    }

  } else if (action[0] == 'wait') {
    ++character.state;

  } else {
    throw new Error('Invalid action:' + action[0]);
  }

  if (character.state == actions.length) {
    character.state = 0;
  }

};

// for node.js, not for CommonJS
if (typeof module === "object" && module) {
  module.exports = Ponzu;
}

