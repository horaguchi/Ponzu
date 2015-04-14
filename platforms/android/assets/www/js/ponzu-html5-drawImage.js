Ponzu.NOT_LOADED = 6;
Ponzu.TILE_IMAGE_8x16_white = new Image();
Ponzu.TILE_IMAGE_8x16_white.onload = function () { --Ponzu.NOT_LOADED; };
Ponzu.TILE_IMAGE_8x16_white.src = "img/VGA8x16_white.png";
Ponzu.TILE_IMAGE_8x16_red = new Image();
Ponzu.TILE_IMAGE_8x16_red.onload = function () { --Ponzu.NOT_LOADED; };
Ponzu.TILE_IMAGE_8x16_red.src = "img/VGA8x16_red.png";
Ponzu.TILE_IMAGE_8x16_yellow = new Image();
Ponzu.TILE_IMAGE_8x16_yellow.onload = function () { --Ponzu.NOT_LOADED; };
Ponzu.TILE_IMAGE_8x16_yellow.src = "img/VGA8x16_yellow.png";

Ponzu.TILE_IMAGE_16x32_white = new Image();
Ponzu.TILE_IMAGE_16x32_white.onload = function () { --Ponzu.NOT_LOADED; };
Ponzu.TILE_IMAGE_16x32_white.src = "img/VGA16x32_white.png";
Ponzu.TILE_IMAGE_16x32_red = new Image();
Ponzu.TILE_IMAGE_16x32_red.onload = function () { --Ponzu.NOT_LOADED; };
Ponzu.TILE_IMAGE_16x32_red.src = "img/VGA16x32_red.png";
Ponzu.TILE_IMAGE_16x32_yellow = new Image();
Ponzu.TILE_IMAGE_16x32_yellow.onload = function () { --Ponzu.NOT_LOADED; };
Ponzu.TILE_IMAGE_16x32_yellow.src = "img/VGA16x32_yellow.png";

Ponzu.prototype.resizeCanvas = function () {
  if (this.maxWidth && this.maxWidth == window.innerWidth) {
    return; // nothing to do
  }
  var max_width = window.innerWidth;
  if (max_width - 10 < 1280) {
    this.fontX = 8; this.fontY = 16;
    this.tile = Ponzu.TILE_IMAGE_8x16_white;
    this.tile_white = Ponzu.TILE_IMAGE_8x16_white;
    this.tile_red = Ponzu.TILE_IMAGE_8x16_red;
    this.tile_yellow = Ponzu.TILE_IMAGE_8x16_yellow;
  } else if (1280 <= max_width - 10) {
    this.fontX = 16; this.fontY = 32;
    this.tile = Ponzu.TILE_IMAGE_16x32_white;
    this.tile_white = Ponzu.TILE_IMAGE_16x32_white;
    this.tile_red = Ponzu.TILE_IMAGE_16x32_red;
    this.tile_yellow = Ponzu.TILE_IMAGE_16x32_yellow;
  }
  this.canvasElement.setAttribute('width',  this.fontX * 80);
  this.canvasElement.setAttribute('height', this.fontY * 20);
  this.canvasElement.parentElement.style.width  = (this.fontX * 80) + 'px';
  this.canvasElement.parentElement.style.height = (this.fontY * 20) + 'px';
  this.canvasElement.style.width  = (this.fontX * 80) + 'px';
  this.canvasElement.style.height = (this.fontY * 20) + 'px';
  this.canvasContext = this.canvasElement.getContext("2d");

  // initial drawing
  this.drawLog(true);
  this.drawUI(true);
  this.drawMap(true);
  this.drawStatus(true);

  this.maxWidth = max_width;
};

Ponzu.prototype.addCanvas = function (element) {
  this.canvasElement = document.createElement('canvas');
  element.appendChild(this.canvasElement);
  this.resizeCanvas();

  Ponzu.ins = this;
  var ponzu = this;
  this.canvasElement.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    if (ponzu.point(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top)) {
      ponzu.drawLog();
      ponzu.drawUI();
      ponzu.drawStatus();
      ponzu.drawMap();
    }
  });
  this.canvasElement.addEventListener('mousedown', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    if (ponzu.point(e.clientX - rect.left, e.clientY - rect.top)) {
      ponzu.drawLog();
      ponzu.drawUI();
      ponzu.drawStatus();
      ponzu.drawMap();
    }
  });

  window.addEventListener('resize', function() {
    if (ponzu.resizeTimer) {
      clearTimeout(ponzu.resizeTimer);
    }
    ponzu.resizeTimer = setTimeout(function () {
      ponzu.resizeCanvas();
    }, 300);
  });
};


Ponzu.prototype.drawLog = function (initial) {
  var log = this.log[this.log.length - 1];
  if (!initial && this.oldLog == log) {
    return;
  }
  var context = this.canvasContext;
  var font_x = this.fontX, font_y = this.fontY;
  this.drawTextLine(log, 0, 0); // 1st line
  this.oldLog = log;
};

Ponzu.prototype.drawStatus = function () {
  var context = this.canvasContext;
  var font_x = this.fontX, font_y = this.fontY;
  this.drawTextLine('Turn:' + this.turn + '  $:' + this.gold + '  Units:' + this.unitNum, 0, font_y * 16); // 17th line
};

Ponzu.COLOR_REGEXP = /^\{([^-]+)-fg\}(.*)\{\/\1-fg\}$/;
Ponzu.prototype.drawMap = function (initial) {
  var context = this.canvasContext;
  var map = this.getMap();
  var old_map = initial ? null : this.oldMap;
  var font_x = this.fontX, font_y = this.fontY;

  for (var y = 0; y < 15; ++y) {
    for (var x = 0; x < 80; ++x) {
      var str = map[y][x];
      if (old_map && str == old_map[y][x]) {
        continue;
      }
      var colors = Ponzu.COLOR_REGEXP.exec(str);
      if (colors) {
        if (colors[1] == 'red') {
          this.tile = this.tile_red;
        } else if (colors[1] == 'yellow') {
          this.tile = this.tile_yellow;
        }
        str = colors[2];
      }
      this.drawTextImage(str, font_x * x, font_y * (y + 1)); // + 1 is log line
      if (colors) {
        this.tile = this.tile_white;
      }
    }
  }
  this.oldMap = map.map(function (row) { return row.concat(); });
};

Ponzu.prototype.drawUI = function (initial) {
  var context = this.canvasContext;
  var font_x = this.fontX, font_y = this.fontY;
  var ui = this.getUI();
  var old_ui = initial ? null : this.oldUI;
  for (var y = 0; y < 3; ++y) {
    for (var x = 0; x < 80; ++x) {
      var str = ui[y][x];
      if (old_ui && str == old_ui[y][x]) {
        continue;
      }
      this.drawTextImage(str, font_x * x, font_y * (y + 17)); // bottom 3 lines
    }
  }
  this.oldUI = ui.map(function (row) { return row.concat(); });
};

Ponzu.prototype.drawTextImage = function (str, dx, dy) {
  var dw = this.fontX, dh = this.fontY;
  var context = this.canvasContext;
  var char_code = str.charCodeAt(0);
  var sx = char_code % 16, sy = Math.floor(char_code / 16);
  context.drawImage(this.tile, sx * dw, sy * dh, dw, dh, dx, dy, dw, dh);
};

Ponzu.prototype.drawTextLine = function (str, dx, dy) {
  var dw = this.fontX;
  for (var i = 0; i < str.length; ++i) {
    this.drawTextImage(str.charAt(i), dx + i * dw, dy);
  }
};

