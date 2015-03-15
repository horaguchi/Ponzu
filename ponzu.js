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
  this.soldItems = {};
  this.log = [];
  this.unitNum = 0;
  this.characters = [];
  this.commandMax = 4;
  this.inventoryMax = 4;
  this.rerollMax = 1;
  this.buildTypeList = [
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['@', 'a worker', []],
    ['<', 'a base', []], // base, not chosen
    ['#', 'a soybean field', [ ['produce', 'a bag of soybeans'], ['wait'], ['wait'] ]],
    ['#', 'a sudachi field', [ ['produce', 'a sudachi'], ['wait'], ['wait'], ['wait'], ['wait'] ]],
    ['#', 'a rice paddy field', [ ['produce', 'a bag of sticky rice'], ['wait'], ['wait'], ['wait'] ]],
    ['[', 'a box', [ ]],
    ['(', 'a juicer', [ ['juice'], ['wait'], ['wait'] ]],
    ['{', 'a brewery', [ ['brew'], ['wait'], ['wait'], ['wait'], ['wait'] ]],
    ['&', 'a mixer', [ ['mix'], ['wait'], ['wait'], ['wait'], ['wait'] ]],
    ['g', 'a goblin', [ ['steal'] ]],
    ['D', 'a dragon', [ ['slay'], ['wait'] ]],
    ['G', 'a gnome', [ ['move'] ]],
    ['^', 'a stone', [ ['stop'] ]],
    ['#', 'a soybean field', [ ['produce', 'a bag of soybeans'], ['wait'], ['wait'] ]],
    ['#', 'a sudachi field', [ ['produce', 'a sudachi'], ['wait'], ['wait'], ['wait'], ['wait'] ]],
    ['#', 'a rice paddy field', [ ['produce', 'a bag of sticky rice'], ['wait'], ['wait'], ['wait'] ]],
    ['_', 'an altar', [ ['wait'], ['wait'], ['wait'], ['wait'], ['wait'], ['bless'], ['stop'] ]]
  ];

  // initial map
  this.map = this.newMap();
  this.matrix = this.map.map(function (row) {
    return row.map(function (tile) { return tile == '.' ? false : true; });
  });
  var base_x = parseInt(Math.random() * 80), base_y = parseInt(Math.random() * 15);
  this.build(10, base_x, base_y); // build a base
  this.build(1); // build a worker
  this.build(11); // build a soybean field

  this.event();
};

Ponzu.EVENT_LIST = [
  function () {
    this.log.push('Welcome to Ponzu 7DRL 2015 Ver.');
    this.log.push('----');
    this.log.push('Mission 1:');
    this.log.push('  Sell 10 bags of soybeans');
    this.log.push('');
    this.log.push('Hint:');
    this.log.push('  You can command to workers.');
    this.log.push('----');
    this.log.push('');
    this.windowType = [ 'center', 'log' ];
    return true;
  },
  function () {
    if (this.soldItems['a bag of soybeans'] >= 10) {
      this.build(1); // build a worker
      this.log.push('----');
      this.log.push('Bonus: You got one more worker.');
      this.log.push('');
      this.log.push('Mission 2:');
      this.log.push('  Increase the number of units to 5');
      this.log.push('');
      this.log.push('Hint:');
      this.log.push('  You can build a unit by "Build" ');
      this.log.push('  button. ');
      this.log.push('----');
      this.log.push('');
      this.windowType = [ 'center', 'log' ];
      return true;
    } else {
      return false;
    }
  },
  function () {
    if (this.unitNum >= 5) {
      this.build(16); // build a brewery
      this.log.push('----');
      this.log.push('Bonus: You got a brewery.');
      this.log.push('');
      this.log.push('Mission 3:');
      this.log.push('  Sell 10 potions of soy sauce');
      this.log.push('');
      this.log.push('Hint:');
      this.log.push('  A brewery creates it from soybeans');
      this.log.push('  that is it in the inventory.');
      this.log.push('----');
      this.log.push('');
      this.windowType = [ 'center', 'log' ];
      return true;
    } else {
      return false;
    }
  },
  function () {
    if (this.soldItems['a potion of soy sauce'] >= 10) {
      this.build(15); // build a juicer
      this.log.push('----');
      this.log.push('Bonus: You got a juicer.');
      this.log.push('');
      this.log.push('Mission 4:');
      this.log.push('  Sell 10 potions of sudachi juice');
      this.log.push('  Sell 10 potions of mirin');
      this.log.push('----');
      this.log.push('');
      this.windowType = [ 'center', 'log' ];
      return true;
    } else {
      return false;
    }
  },
  function () {
    if (this.soldItems['a potion of sudachi juice'] >= 10 &&
        this.soldItems['a potion of mirin'] >= 10) {
      this.gold += 1000;
      this.log.push('----');
      this.log.push('Bonus: You got 1000 Golds.');
      this.log.push('');
      this.log.push('Mission 5:');
      this.log.push('  Sell 10 potions of ponzu');
      this.log.push('');
      this.log.push('Hint:');
      this.log.push('  ponzu=7 shoyu:5 sudachi:3 mirin');
      this.log.push('----');
      this.log.push('');
      this.windowType = [ 'center', 'log' ];
      return true;
    } else {
      return false;
    }
  },
  function () {
    if (this.soldItems['a potion of ponzu'] >= 10) {
      this.log.push('----');
      this.log.push('You Win! Turn = ' + this.turn);
      this.windowType = [ 'center', 'log' ];
      return true;
    } else {
      return false;
    }
  }
];

Ponzu.ITEM_LIST = {
  'a bag of soybeans':         ['%', 'bags of soybeans', 2],
  'a sudachi':                 ['%', 'sudachi', 4],
  'a bag of sticky rice':      ['%', 'bags of sticky rice', 3],
  'a potion of soy sauce':     ['!', 'potions of soy sauce', 20],
  'a potion of sudachi juice': ['!', 'potions of sudachi juice', 16],
  'a potion of mirin':         ['!', 'potions of mirin', 30],
  'a potion of ponzu':         ['!', 'potions of ponzu', 500]
};

Ponzu.ITEM_RECIPE = {
  'brew': {
    'a bag of soybeans': 'a potion of soy sauce',
    'a bag of sticky rice': 'a potion of mirin'
  },
  'juice': {
    'a sudachi': 'a potion of sudachi juice'
  },
  'mix': {
    'a potion of ponzu': {
      'a potion of soy sauce': 7,
      'a potion of sudachi juice': 5,
      'a potion of mirin': 3
    }
  }
};

Ponzu.prototype.event = function () {
  var event = (Ponzu.EVENT_LIST[0] || function () { }).call(this);
  if (event) {
    Ponzu.EVENT_LIST.shift();
  }
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
  var window_type = this.windowType;
  if (!window_type) {
    return this.map;
  }
  var window_map = this.getWindowMap();
  var tmp_map = this.map.map(function (row) { return row.concat(); });

  if (window_type[0] == 'left') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 2] = window_map[y] && window_map[y][x] || ' ';
      }
    }
  } else if (window_type[0] == 'right') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 42] = window_map[y] && window_map[y][x] || ' ';
      }
    }
  } else if (window_type[0] == 'center') {
    for (var y = 0; y < 13; ++y) {
      for (var x = 0; x < 36; ++x) {
        tmp_map[y + 1][x + 22] = window_map[y] && window_map[y][x] || ' ';
      }
    }
  } else if (window_type[0] == 'ui') {
    // nothing

  } else {
    throw new Error('Invalid windowType' + this.windowType);
  }

  // color
  if (window_type[1] == 'character' || (window_type[1] == 'build' && window_type[2])) {
    tmp_map[window_type[2].y][window_type[2].x] = '{yellow-fg}' + tmp_map[window_type[2].y][window_type[2].x] + '{/yellow-fg}';

  } else if (window_type[0] == 'ui' && window_type[1] == 'command') {
    tmp_map[window_type[2].y][window_type[2].x] = '{yellow-fg}' + tmp_map[window_type[2].y][window_type[2].x] + '{/yellow-fg}';

    window_type[3].forEach(function (action) {
      if (tmp_map[action[2]][action[1]].length == 1) {
        tmp_map[action[2]][action[1]] = '{red-fg}' + tmp_map[action[2]][action[1]] + '{/red-fg}';
      }
    });
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

  } else if (window_type[1] == 'character') {
    return this.getCharacterWindowMap();

  } else if (window_type[1] == 'log') {
    return this.getLogWindowMap();

  } else if (window_type[1] == 'command') {
    return null; // UI only

  } else if (window_type[1] == 'build') {
    return this.getBuildWindowMap();

  } else {
    throw new Error('Invalid windowType' + window_type);
  }
};

Ponzu.COMMAND_BUTTON = [
  ["+","-","-","-","-","-","-","-","+"],
  ["|","C","o","m","m","a","n","d","|"],
  ["+","-","-","-","-","-","-","-","+"]
];

Ponzu.prototype.getCharacterWindowMap = function () {
  var window_type = this.windowType;
  var character = window_type[2];
  var actions = character.actions || this.buildTypeList[character.group][2];
  var list = '';
  if (window_type[3] == 'todo') {
    list = ' Todo (' + (actions.length && character.state + 1) + '/' + actions.length + '):\n';
    for (var i = 0; i < 8; ++i) {
      var action = actions[ (character.state + i) % actions.length ];
      list += (action ? '   ' + action[0] + '(' + action.slice(1).join(',') + ')': '') + '\n';
    }
  } else {
    list = ' Inventory (' + character.items.length + '/' + this.inventoryMax + '):\n';
    var item_num = {};
    var item_keys = [];
    character.items.forEach(function (item) {
      if (item_num[item]) {
        ++item_num[item];
      } else {
        item_num[item] = 1;
        item_keys.push(item);
      }
    });
    for (var i = 0; i < 8; ++i) {
      var item = item_keys[i];
      list += (item
        ? '   ' + Ponzu.ITEM_LIST[item][0] + ' - ' +
          (item_num[item] == 1
            ? item
            : item_num[item] + ' ' + Ponzu.ITEM_LIST[item][1])
        : '') + '\n';
    }
  }
  var window_str = '\n' +
    ' ' + this.map[character.y][character.x] + '                Location: (' + character.x + ', ' + character.y + ')\n' +
    (character.symbol == '@' ? ' Name: ' + character.name : ' Type: ' + character.type) + '\n' +
    list + '\n';
  var window_map = window_str.split("\n").map(function (row_str) { return row_str.split(""); });

  if (character.symbol != '@') {
    return window_map;
  }

  for (var y = 0; y < 3; ++y) {
    for (var x = 0; x < 9; ++x) {
      window_map[y + 9] = window_map[y + 9] || [];
      window_map[y + 9][x + 26] = Ponzu.COMMAND_BUTTON[y][x];
    }
  }
  return window_map;
};

Ponzu.prototype.getLogWindowMap = function () {
  var window_str = [ '\n' ].concat(this.log.slice(-11)).concat('\n');
  return window_str.map(function (row_str) { return row_str.split(""); });
};

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
  [" ","|"," "," "," "," "," "," "," ","B","u","i","l","d"," ","a"," ","u","n","i","t"," ","(","$","5","0",")"," "," "," "," "," "," "," ","|"," "],
  [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "],
  [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "]
];

Ponzu.prototype.getBuildWindowMap = function () {
  var window_type = this.windowType;
  var character = window_type[2];
  if (!character) {
    return Ponzu.FIRST_BUILD_WINDOW;
  }
  var window_str = '\n' +
    ' ' + this.map[character.y][character.x] + '                Location: (' + character.x + ', ' + character.y + ')\n' +
    (character.symbol == '@' ? ' Name: ' + character.name : ' Type: ' + character.type) +
    '\n\n\n\n\n\n\n\n\n\n\n';
  var window_map = window_str.split("\n").map(function (row_str) { return row_str.split(""); });
  window_map[ 9] = [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "];
  window_map[10] = [" ","|"," "," "," "," "," ","R","e","r","o","l","l"," ","t","h","i","s"," ","u","n","i","t"," ","(","$","1","0",")"," "," "," "," "," ","|"," "];
  window_map[11] = [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "];
  window_map[12] = [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","R","e","s","t",":",String(this.rerollMax - window_type[3])," "," "];
  return window_map;
};

/**************************************
 * UI (buttons) methods
 **************************************/
Ponzu.UI = [
  [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "],
  [" ","|"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","B","u","i","l","d"," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","|"," "," ","|"," "," "," "," "," "," "," "," "," "," "," "," "," "," ","N","e","x","t"," ","T","u","r","n"," "," "," "," "," "," "," "," "," "," "," "," "," ","|"," "],
  [" ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "," ","+","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","+"," "]
];

Ponzu.prototype.getUI = function () {
  var window_type = this.windowType;
  if (window_type && window_type[0] == 'ui' && window_type[1] == 'command') {
    return this.getCommandUI();
  } else {
    return Ponzu.UI;
  }
};

Ponzu.ACTION_ABBR = {
  'move': 'mv',
  'sell': 'sl',
  'pickup': 'pu',
  'drop': 'drp'
};

Ponzu.prototype.getCommandUI = function () {
  var window_type = this.windowType;
  var actions = window_type[3];
  var actions_ui = [ '' ];
  var latest_line = '';
  for (var i = 0; i < actions.length; ++i) {
    var action = actions[i];
    var word = Ponzu.ACTION_ABBR[action[0]] + '(' + action.slice(1).join(',') + ')';
    if ((latest_line + word).length <= 53) {
      actions_ui[actions_ui.length - 1] += word;
      latest_line = actions_ui[actions_ui.length - 1];
    } else {
      actions_ui.push(word);
      latest_line = word;
    }
  }
  word = '(' + actions.length + '/' + this.commandMax + ')';
  if ((latest_line + word).length <= 53) {
    actions_ui[actions_ui.length - 1] += word;
  } else {
    actions_ui.push(word);
  }
  actions_ui = actions_ui.map(function (line) { return line.split(""); }).slice(-3);

  var out = [
    [" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," "," ","+","-","-","-","-","+"," ","+","-","-","-","-","-","-","+"," ","+","-","-","-","-","-","-","+"," "],
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

  } else if (my === 0) { // log line
    this.windowType = [ 'center', 'log' ];

  } else if (1 <= my && my <= 16) { 
    this.pointMap(mx, my - 1);

  } else if (16 < my) { // UI button
    if (window_type && window_type[0] == 'ui' && window_type[1] == 'command') {
      if (55 <= mx && mx <= 60) { // Save
        window_type[2].state = 0;
        window_type[2].actions = this.windowType[3];
        this.log.push("You have commanded to " + window_type[2].name + '.');
        this.windowType = null;

      } else if (62 <= mx && mx <= 69) { // Delete
        this.windowType[3] = [];

      } else if (71 <= mx && mx <= 78) { // Cancel
        this.windowType = null;

      }
    } else {
      if (1 <= mx && mx <= 38) { // Build
        this.windowType = [ 'center', 'build', null, 0 ];

      } else if (41 <= mx && mx <= 78) { // Next Turn
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
        if (window_type[2].symbol == '@' && 26 <= window_x && window_x <= 34 && 9 <= window_y && window_y <= 11) {
          this.windowType = [ 'ui', 'command', window_type[2], (window_type[2].actions || []).concat() ];

        } else {
          window_type[3] = window_type[3] == 'todo' ? 'inventory' : 'todo';
        }

      // build window
      } else if (window_type[1] == 'build') {
        if (1 <= window_x && window_x <= 34 && 9 <= window_y && window_y <= 11) {
          if (this.rerollMax == window_type[3]) {
            this.log.push('You can not rerolling anymore this unit.');
            return; // reroll max
          }
          var created_character = window_type[2];
          if (created_character ? this.gold < 10 : this.gold < 50) {
            this.log.push('You don\'t have enough golds.');
            return; // no golds
          }
          if (created_character) { // reroll
            this.map[created_character.y][created_character.x] = '.';
            this.matrix[created_character.y][created_character.x] = false;
            created_character.dead = true;
            --this.unitNum;
            ++window_type[3];
            this.gold -= 10;

          } else {
            this.gold -= 50;
          }
          created_character = this.build();
          if (created_character) {
            window_type[0] = created_character.x < 40 ? 'right' : 'left';
            window_type[2] = created_character;
          }
        }
      }
    // command UI
    } else if (window_type[0] == 'ui' && window_type[1] == 'command') {
      this.addCommand(this.getNearCharacter(point_x, point_y, true));

    } else {
      this.windowType = null;
    }

  } else if (character && character.x < 40) {
    this.windowType = [ 'right', 'character', character, 'todo' ];

  } else if (character) {
    this.windowType = [ 'left', 'character', character, 'todo' ];
  }
};

Ponzu.prototype.getNearCharacter = function (point_x, point_y, not_worker, not_me) {
  var nearest;
  var min = 10000;
  this.characters.some(function (value) {
    if (value.dead || (not_worker && value.type == 'a worker')) {
      return false;
    }
    if (value.x == point_x && value.y == point_y) {
      if (not_me) {
        return false;
      } else {
        nearest = value;
        return true;
      }
    }
    var d = Math.abs(point_x - value.x) + Math.abs(point_y - value.y);
    if (d < min) {
      nearest = value;
      min = d;
    }
  });
  return nearest;
};

Ponzu.prototype.addCommand = function (character) {
  var window_type = this.windowType;
  var actions = window_type[3];
  if (actions.length < this.commandMax) {
    if (actions.length === 0) {
      return actions.push(['move', character.x, character.y]);
    }
    var last = actions[actions.length - 1];
    if (last[1] != character.x || last[2] != character.y) {
      return actions.push(['move', character.x, character.y]);
    }
    if (character.symbol == '<') {
      return actions.push(['sell', character.x, character.y]);
    } else if (character.symbol == '#') {
      return actions.push(['pickup', character.x, character.y]);
    } else if (character.symbol != '(' && character.symbol != '{') {
      return; // no additional action
    }

    // ( mv -> mv drp -> mv pu -> mv drp drp -> mv pu pu -> mv drp drp drp -> ... )
    // { mv -> mv drp -> mv pu -> mv drp drp -> mv pu pu -> mv drp drp drp -> ... }
    var target = actions.length;
    for (var i = actions.length - 1; 0 < i; --i) {
      var action = actions[i];
      if (action[0] != 'move' && action[1] == character.x && action[2] == character.y) {
        target = i;
      }
    }
    var next_action_name = target == actions.length ? 'drop' : actions[target][0] == 'drop' ? 'pickup' : 'drop';
    for (var i = target; i < actions.length; ++i) {
      var action = actions[i];
      action[0] = next_action_name;
    }
    if (next_action_name == 'drop') {
      actions.push(['drop', character.x, character.y]);
    }
    return;

  } else {
    var last = actions[actions.length - 1];
    if (last[1] != character.x || last[2] != character.y) {
      return;
    } else if (character.symbol != '(' && character.symbol != '{') {
      return;
    }

    // ( mv -> mv drp -> mv pu -> mv drp drp -> mv pu pu -> mv drp drp drp -> ... )
    // { mv -> mv drp -> mv pu -> mv drp drp -> mv pu pu -> mv drp drp drp -> ... }
    var target = actions.length;
    for (var i = actions.length - 1; 0 < i; --i) {
      var action = actions[i];
      if (action[0] != 'move' && action[1] == character.x && action[2] == character.y) {
        target = i;
      }
    }
    var next_action_name = target == actions.length ? 'drop' : actions[target][0] == 'drop' ? 'pickup' : 'drop';
    if (next_action_name == 'pickup') { // change only (no add action)
      for (var i = target; i < actions.length; ++i) {
        var action = actions[i];
        action[0] = next_action_name;
      }
    }
  }
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
    if (pos_list.length === 0) {
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
    symbol: target_type[0],
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
  this.characters.push(character);
  this.makeVisible(pos_x, pos_y, map);
  ++this.unitNum;
  if (typeof force_index != 'number') {
    this.log.push("You built " + target_type[1] + ".");
  }
  return character;
};

/**************************************
 * AI methods
 **************************************/

// called after 2. user input
Ponzu.prototype.next = function () {
  // 3. character action
  this.characters = this.characters.filter(function (character) {
    if (!character.dead) {
      this._action(character);
      return true;
    }
  }, this);

  // next turn
  ++this.turn;

  // 1. check game over
  this.event();
};

Ponzu.prototype._action = function (character) {
  var actions = character.actions || this.buildTypeList[character.group][2];
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
    var path;
    if (typeof to_x == 'number' && typeof to_y == 'number') {
      var grid = new PF.Grid(80, 15, matrix);
      grid.setWalkableAt(to_x, to_y, true);
      path = this.finder.findPath(from_x, from_y, to_x, to_y, grid);
    } else { // force random walk
      to_x = from_x; to_y = from_y;
      path = [];
    }

    if (path.length > 2) { // path found
      next_x = path[1][0];
      next_y = path[1][1];

    } else if (path.length == 2) { // adjacent, no move required
      next_x = from_x;
      next_y = from_y;

    } else { // random walk if not 
      next_x = from_x + Math.floor( Math.random() * 3 ) - 1;
      next_y = from_y + Math.floor( Math.random() * 3 ) - 1;
      if (next_x < 0 || 80 <= next_x || next_y < 0 || 15 <= next_y || map[next_y][next_x] != '.') {
        return;
      }
    }
    map[character.y][character.x] = '.';
    matrix[character.y][character.x] = false;
    character.x = next_x; character.y = next_y;
    map[next_y][next_x] = character.symbol;
    matrix[next_y][next_x] = true;

    // change state
    if (Math.abs(to_x - next_x) <= 1 && Math.abs(to_y - next_y) <= 1) {
      ++character.state;
    }

  } else if (action[0] == 'pickup') {
    var from_x = character.x, from_y = character.y;
    var to_x = action[1], to_y = action[2];
    var from_character = this.characters.filter(function (c) { return !c.dead && c.x == to_x && c.y == to_y; })[0];
    if (Math.abs(from_x - to_x) <= 1 && Math.abs(from_y - to_y) <= 1 &&
      from_character && from_character.items.length > 0 &&
      character.items.length < this.inventoryMax) {
      var pickup_item = from_character.items.pop();
      character.items.push(pickup_item);
      this.log.push(character.name + ' picked up ' + pickup_item + ' from ' + from_character.type + '.');
      ++character.state;
    } else {
      this.log.push(character.name + ' can not pick up anything.');
    }

  } else if (action[0] == 'drop') {
    var from_x = character.x, from_y = character.y;
    var to_x = action[1], to_y = action[2];
    var to_character = this.characters.filter(function (c) { return !c.dead && c.x == to_x && c.y == to_y; })[0];
    if (Math.abs(from_x - to_x) <= 1 && Math.abs(from_y - to_y) <= 1 &&
      character.items.length > 0 &&
      to_character && to_character.items.length < this.inventoryMax) {
      var drop_item = character.items.pop();
      to_character.items.push(drop_item);
      this.log.push(character.name + ' drop ' + drop_item + ' to ' + to_character.type + '.');
      ++character.state;
    } else {
      this.log.push(character.name + ' can not drop anything.');
    }

  } else if (action[0] == 'sell') {
    var from_x = character.x, from_y = character.y;
    var to_x = action[1], to_y = action[2];
    if (Math.abs(from_x - to_x) <= 1 && Math.abs(from_y - to_y) <= 1 && character.items.length > 0) {
      var sold_item = character.items.pop();
      this.soldItems[sold_item] = this.soldItems[sold_item] ? this.soldItems[sold_item] + 1 : 1;
      this.gold += Ponzu.ITEM_LIST[sold_item][2];
      this.log.push(character.name + ' sold ' + sold_item + ' for ' + Ponzu.ITEM_LIST[sold_item][2] + ' golds.');
      ++character.state;
    } else {
      this.log.push(character.name + ' can not sell anything.');
    }

  } else if (action[0] == 'produce') {
    if (character.items.length < this.inventoryMax) {
      character.items.push(action[1]);
      ++character.state;
    }

  } else if (action[0] == 'mix') {
    var item_num = {};
    var item_keys = [];
    character.items.forEach(function (item) {
      if (item_num[item]) {
        ++item_num[item];
      } else {
        item_num[item] = 1;
        item_keys.push(item);
      }
    });
    var mixed_item;
    for (var recipe_item in Ponzu.ITEM_RECIPE.mix) {
      var recipe = Ponzu.ITEM_RECIPE.mix[recipe_item];
      var mixable = true;
      for (var required_item in recipe) {
        if (!item_num[required_item] || item_num[required_item] < recipe[required_item]) {
          mixable = false;
          break;
        }
      }
      if (mixable) {
        mixed_item = recipe_item;
        break;
      }
    }
    if (mixed_item) {
      var recipe = Ponzu.ITEM_RECIPE.mix[mixed_item];
      var used_item = {};
      character.items = character.items.filter(function (item) {
        if (recipe[item]) {
          if (used_item[item] == recipe[item]) {
            return true;
          } else {
            used_item[item] = used_item[item] ? used_item[item] + 1 : 1;
            return false;
          }
        } else {
          return true;
        }
      });
      character.items.push(mixed_item);
      ++character.state;
    }

  } else if (action[0] == 'brew') {
    var brewable_index;
    character.items.some(function (item, key) {
      if (Ponzu.ITEM_RECIPE.brew[item]) {
        brewable_index = key;
        return true;
      }
    });
    if (typeof brewable_index == 'number') {
      character.items.splice(brewable_index, 1, Ponzu.ITEM_RECIPE.brew[character.items[brewable_index]]);
      ++character.state;
    }

  } else if (action[0] == 'juice') {
    var juiceable_index;
    character.items.some(function (item, key) {
      if (Ponzu.ITEM_RECIPE.juice[item]) {
        juiceable_index = key;
        return true;
      }
    });
    if (typeof juiceable_index == 'number') {
      character.items.splice(juiceable_index, 1, Ponzu.ITEM_RECIPE.juice[character.items[juiceable_index]]);
      ++character.state;
    }
  } else if (action[0] == 'steal') {
    var from_x = character.x, from_y = character.y;
    var to_character = this.getNearCharacter(character.x, character.y, null, true);
    if (to_character && Math.abs(from_x - to_character.x) <= 1 && Math.abs(from_y - to_character.y) <= 1 &&
      to_character.symbol == '@' && to_character.items.length > 0) {
      var stolen_item = to_character.items.pop();
      this.log.push(to_character.name + ' had ' + stolen_item + ' stolen by ' + character.type + '.');
      ++character.state;
    }

  } else if (action[0] == 'slay') {
    var from_x = character.x, from_y = character.y;
    var to_character = this.getNearCharacter(character.x, character.y, null, true);
    if (to_character && Math.abs(from_x - to_character.x) <= 1 && Math.abs(from_y - to_character.y) <= 1 &&
      to_character.symbol == '@') {
      this.map[to_character.y][to_character.x] = '.';
      this.matrix[to_character.y][to_character.x] = false;
      to_character.dead = true;
      this.log.push(to_character.name + ' was slayed by ' + character.type + '.');
      ++character.state;
    }

  } else if (action[0] == 'bless') {
    var choise = parseInt(Math.random() * 3);
    if (choise === 0) {
      this.log.push('Maximum value of your commands has risen.');
      this.commandMax += 2;
    } else if (choise == 1) {
      this.log.push('Maximum value of all inventories has risen.');
      this.inventoryMax += 4;
    } else if (choise == 2) {
      this.log.push('Maximum value of your rerolls has risen.');
      this.rerollMax += 1;
    }
    ++character.state;

  } else if (action[0] == 'wait') {
    ++character.state;

  } else if (action[0] == 'stop') {

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

