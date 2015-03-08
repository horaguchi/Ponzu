
Ponzu.prototype.addCanvas = function (element) {
  var max_width = window.innerWidth;
  if (max_width < 400) {
    this.fontX = 4; this.fontY = 8;
  } else if (400 <= max_width && max_width < 640) {
    this.fontX = 5; this.fontY = 10;
  } else if (640 <= max_width && max_width < 800) {
    this.fontX = 8; this.fontY = 16;
  } else if (800 <= max_width && max_width < 600) {
    this.fontX = 10; this.fontY = 20;
  } else if (1200 <= max_width) {
    this.fontX = 15; this.fontY = 30;
  }
  this.canvasElement = document.createElement('canvas');
  this.canvasElement.setAttribute('width', this.fontX * 80);
  this.canvasElement.setAttribute('height', this.fontY * 20);
  this.canvasContext = this.canvasElement.getContext("2d");
  this.canvasContext.font = this.fontY + "px Monospace";

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
  element.appendChild(this.canvasElement);
};

Ponzu.prototype.drawMap = function () {
  var context = this.canvasContext;
  var map = this.map;
  var old_map = this.old_map;
  var font_x = this.fontX, font_y = this.fontY;
  for (var y = 0; y < 20; ++y) {
    for (var x = 0; x < 80; ++x) {
      var str = map[y][x];
      if (str == old_map[y][x]) {
        continue;
      }
      context.clearRect(font_x * x, font_y * y, font_x, font_y);
      if (str == '+') {
        context.fillStyle = 'red';
      } else {
        context.fillStyle = 'black';
      }
      context.fillText(str, font_x * x, font_y * (y + 1));
    }
  }
  this.old_map = map.map(function (row) { return row.concat(); });
};

Ponzu.prototype.point = function (x, y) {
  var mx = parseInt(x / this.fontX), my = parseInt(y / this.fontY);
  if (mx < 0 || 80 <= mx || my < 0 || 20 <= my) {
    return
  }
  this.map[my][mx] = '+';
  this.drawMap();
};
