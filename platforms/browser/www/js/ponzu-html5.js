
Ponzu.prototype.addCanvas = function (element) {
  var max_width = window.innerWidth;
  if (max_width < 400) {
    this.fontX = 4; this.fontY = 8;
  } else if (400 <= max_width - 10 && max_width - 10  < 480) {
    this.fontX = 5; this.fontY = 10;
  } else if (480 <= max_width - 10 && max_width - 10  < 560) {
    this.fontX = 6; this.fontY = 12;
  } else if (560 <= max_width - 10 && max_width - 10  < 640) {
    this.fontX = 7; this.fontY = 14;
  } else if (640 <= max_width - 10 && max_width - 10  < 800) {
    this.fontX = 8; this.fontY = 16;
  } else if (800 <= max_width - 10 && max_width - 10  < 960) {
    this.fontX = 10; this.fontY = 20;
  } else if (960 <= max_width - 10 && max_width - 10  < 1200) {
    this.fontX = 12; this.fontY = 24;
  } else if (1200 <= max_width) {
    this.fontX = 15; this.fontY = 30;
  }
  this.canvasElement = document.createElement('canvas');
  this.canvasElement.setAttribute('width',  this.fontX * 80);
  this.canvasElement.setAttribute('height', this.fontY * 20);
  element.appendChild(this.canvasElement);
  element.style.width  = (this.fontX * 80) + 'px';
  element.style.height = (this.fontY * 20) + 'px';
  this.canvasElement.style.width  = (this.fontX * 80) + 'px';
  this.canvasElement.style.height = (this.fontY * 20) + 'px';
  this.canvasContext = this.canvasElement.getContext("2d");
  this.canvasContext.font = (this.fontY - 2) + "px Monospace"; // for adjustment
  this.canvasContext.textBaseline = "ideographic";

  var ponzu = this;
  this.canvasElement.addEventListener('touchstart', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    ponzu.point(e.changedTouches[0].clientX - rect.left, e.changedTouches[0].clientY - rect.top);
  });
  this.canvasElement.addEventListener('mousedown', function (e) {
    e.preventDefault();
    var rect = e.target.getBoundingClientRect();
    ponzu.point(e.clientX - rect.left, e.clientY - rect.top);
  });

  // initial drawing
  this.drawLog();
  this.drawUI();
  this.drawMap();
  this.drawStatus();
};

Ponzu.prototype.drawUI = function () {
  var context = this.canvasContext;
  var font_x = this.fontX, font_y = this.fontY;
  var ui_map = Ponzu.UIMap;
  for (var y = 0; y < 3; ++y) {
    for (var x = 0; x < 80; ++x) {
      var str = ui_map[y][x];
      context.fillStyle = 'black';
      context.fillText(str, font_x * x, font_y * (y + 18)); // bottom 3 lines
    }
  }
};

Ponzu.prototype.drawLog = function () {
  var context = this.canvasContext;
  var font_x = this.fontX, font_y = this.fontY;
  context.clearRect(0, font_y * 0, font_x * 80, font_y);
  context.fillStyle = 'black';
  context.fillText(this.log, 0, font_y * 1); // 1st line
};

Ponzu.prototype.drawStatus = function () {
  var context = this.canvasContext;
  var font_x = this.fontX, font_y = this.fontY;
  context.clearRect(0, font_y * 16, font_x * 80, font_y);
  context.fillStyle = 'black';
  context.fillText('Turn:' + this.turn + '  $:' + this.gold + '  @:' + this.playerNum, 0, font_y * 17); // 17th line
};

Ponzu.prototype.drawMap = function () {
  var context = this.canvasContext;
  var map = this.getMap();
  var old_map = this.oldMap;
  var font_x = this.fontX, font_y = this.fontY;

  for (var y = 0; y < 15; ++y) {
    for (var x = 0; x < 80; ++x) {
      var str = map[y][x];
      if (old_map && str == old_map[y][x]) {
        continue;
      }
      context.clearRect(font_x * x, font_y * (y + 1), font_x, font_y);
      if (str == '+') {
        context.fillStyle = 'red';
      } else {
        context.fillStyle = 'black';
      }
      context.fillText(str, font_x * x, font_y * (y + 2)); // + 1 is log line
    }
  }
  this.oldMap = map.map(function (row) { return row.concat(); });
};



Ponzu.prototype.point = function (x, y) {
  var mx = parseInt(x / this.fontX), my = parseInt(y / this.fontY);
  if (mx < 0 || 80 <= mx || my < 0 || 20 <= my) {
    return
  }
  if (my == 0) {
    // nothing
  } else if (1 <= my && my <= 16) { 
    this.pointMap(mx, my - 1);

  } else if (16 < my) {
    if (17 <= mx && mx <= 30) {
      this.build();
      this.drawLog();
      this.drawStatus();

    } else if (65 <= mx && mx <= 78) {
      this.next();
      this.drawLog();
      this.drawStatus();
    }
  }
  this.drawMap();
};
