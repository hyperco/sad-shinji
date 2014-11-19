var canvas;
var ctx;

$(document).ready(function() {
  canvas = $('#canvas').get(0);
  ctx = canvas.getContext('2d');
  init();
});

function init() {}; // for override

//***********************************
// Key class
//***********************************
function Key() {
  this.keys = [];
  this.oldKeys = [];
  var me = this;
  $(window).keydown(function(e) {
    e.preventDefault();
    if (me.keys.indexOf(e.keyCode) == -1) {
      me.keys.push(e.keyCode);
    }
  });
  $(window).keyup(function(e) {
    e.preventDefault();
    var index = me.keys.indexOf(e.keyCode);
    if (index > -1) {
      me.keys.splice(index, 1);
    }
  });
}
Key.prototype = {
  // isDown
  isDown: function(chr) {
    return (this.keys.indexOf(chr) > -1);
  },
  isJustDown: function(chr) {
    return (this.keys.indexOf(chr) > -1 && this.oldKeys.indexOf(chr) == -1);
  },
  update: function() {
    this.oldKeys = this.keys.slice(0);
  }
}
Key.SPACE = 32;
Key.ENTER = 13;
Key.ESC   = 27;
Key.LEFT  = 37;
Key.RIGHT = 39;
Key.UP    = 38;
Key.DOWN  = 40;

//***********************************
// Mouse class
//***********************************
function Mouse() {
  this.x = 0;
  this.y = 0;
  this.leftButton = false;
  var me = this;
  $(canvas).mousemove(function(e) {
    me.x = e.offsetX;
    me.y = e.offsetY;
  });
  $(canvas).mousedown(function() {
    me.leftButton = true;
  });
  $(canvas).mouseup(function() {
    me.leftButton = false;
  });
  $(canvas).mouseout(function() {
    me.leftButton = false;
  });
}

//***********************************
// Loader class
//***********************************
// imgSource = {
//   player: 'images/player.png',
//   enemy: 'images/enemy.png',
//   :
//   :
// }
// soundSource = {
//   bgm: 'bgm',
//   se1: 'se1',
//   :
//   :
// }
function Loader(imgSource, soundSource, readyFunc) {
  var size = 0;
  this.image = {};
  this.sound = {};
  for (var key in imgSource) {
    this.image[key] = new Image();
    $(this.image[key]).bind('load', checkSize);
    this.image[key].src = imgSource[key];
  }
  for (var key in soundSource) {
    this.sound[key] = new Audio();
    $(this.sound[key]).bind('canplay', checkSize);
    if (this.sound[key].canPlayType("audio/ogg")) {
      this.sound[key].src = soundSource[key] + '.ogg';
    } else if (this.sound[key].canPlayType("audio/mpeg")) {
      this.sound[key].src = soundSource[key] + '.mp3';
    }
  }
  function checkSize() {
    size ++;
    if (size >= Object.keys(imgSource).length + Object.keys(soundSource).length) {
      readyFunc();
    }
  }
}

//***********************************
// Point class
//***********************************
function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}
Point.prototype = {
  set: function(x, y) {
    this.x = x;
    this.y = y;
  },
  distance: function(point) {
    return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
  }
};
//***********************************
// Rect class
//***********************************
function Rect(x, y, w, h) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = w || 0;
  this.height = h || 0;
}
Rect.prototype = {
  // isHitPoint
  isHitPoint: function(point) {
    var p1 = new Point(this.x, this.y);
    var p2 = new Point(this.x + this.width - 1, this.y + this.height - 1);
    if (point.x >= p1.x && point.x <= p2.x &&
        point.y >= p1.y && point.y <= p2.y) {
      return true;
    } else {
      return false;
    }
  },
  // isHitRect
  isHitRect: function(rect) {
    var p1 = new Point(rect.x, rect.y);
    var p2 = new Point(rect.x + rect.width - 1, rect.y);
    var p3 = new Point(rect.x, rect.y + rect.height - 1);
    var p4 = new Point(rect.x + rect.width - 1, rect.y + rect.height - 1);
    if (this.isHitPoint(p1) || this.isHitRect(p2) ||
        this.isHitPoint(p3) || this.isHitRect(p4)) {
      return true;
    } else {
      return false;
    }
  },
  // points
  points: function() {
    return [this.p1(), this.p2(), this.p3(), this.p4()];
  },
  // p1
  p1: function() {
    return new Point(this.x, this.y);
  },
  // p2
  p2: function() {
    return new Point(this.x + this.width - 1, this.y);
  },
  // p3
  p3: function() {
    return new Point(this.x, this.y + this.height - 1);
  },
  // p4
  p4: function() {
    return new Point(this.x + this.width - 1, this.y + this.height - 1);
  }
}
