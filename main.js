var map;
var WIDTH  = 12;
var HEIGHT = 12;
var houkouX = [-1, 0, 1, 0];
var houkouY = [0, -1, 0, 1];
var select;
var startTimer;
var time;
var timer;
var CHIP_SIZE = 64;
var loader;
var reiSrc = {
  lv1: 'images/rei.png',
  lv2: 'images/rei.png',
  lv3: 'images/rei.png',
  lv4: 'images/rei.png',
  lv5: 'images/rei.png',
};
var shinjiSrc = {
/*
  lv1: 'images/lv1.png',
  lv2: 'images/lv2.png',
  lv3: 'images/lv3.png',
  lv4: 'images/lv4.png',
  lv5: 'images/lv5.png'
*/
  lv1: 'images/chair.png',
  lv2: 'images/bored.png',
  lv3: 'images/happy.png',
  lv4: 'images/groceries.png',
  lv5: 'images/mug.png',
};
var imgSrc = shinjiSrc;
var img = {};
var move;
var maxChipCount;

/**
 * init
 */
function init() {
  loader = new Loader(imgSrc, {}, ready);
}

function change_mode(mode) {
    if (mode == "rei") {
        imgSrc = reiSrc;
    } else if (mode == "shinji") {
        imgSrc = shinjiSrc;
    }
    init();
    ready();
}

/**
 * ready
 */
function ready() {
  img = loader.image;
  // 初期化
  startTimer = null;
  time = 0;
  move = 0;
  $('#time').html('Time:' + time + ' Move:' + move);
  map = [];
  var points = [];
  for (var i = 0; i < WIDTH; i++) {
    var line = [];
    for (var j = 0; j < HEIGHT; j++) {
      line.push(0);
      points.push(new Point(j, i));
    }
    map.push(line);
  }
  // 配置
  maxChipCount = Math.ceil(WIDTH * HEIGHT / 2);
  for (var i = 0; i < maxChipCount; i++) {
    var index = Math.floor(Math.random() * points.length);
    var point = points[index];
    map[point.y][point.x] = 1;
    points.splice(index, 1);
  }
  reWeight();
  drawMap();
  $(canvas).mousedown(onMouseDown);
}

/**
 * onMouseDown
 */
function onMouseDown(e) {
  if (!startTimer) {
    startTimer = true;
    timer = setInterval(function() {
      time ++;
      $('#time').html('Time:' + time + ' Move:' + move);
    }, 1000);
  }
  var off = $(this).offset();
  var mousex = e.pageX - off.left;
  var mousey = e.pageY - off.top;
  var xx = Math.floor(mousex / CHIP_SIZE);
  var yy = Math.floor(mousey / CHIP_SIZE);
  if (select == null) {
    if (map[yy][xx] != 3) return;
    ctx.strokeStyle = '#FF00CC';
    ctx.lineWidth = 3;
    ctx.strokeRect(xx * CHIP_SIZE, yy * CHIP_SIZE, CHIP_SIZE, CHIP_SIZE);
    select = new Point(xx, yy);
  } else {
    if (select.x == xx && select.y == yy) {
      select = null;
      drawMap();
      return;
    }
    if (map[yy][xx] != 0) return;
    map[yy][xx] = 1;
    map[select.y][select.x] = 0;
    select = null;
    reWeight();
    drawMap();
    move ++;
    $('#time').html('Time:' + time + ' Move:' + move);
    checkEnd();
  }
}

function reWeight() {
  // 重み付け
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      if (map[i][j] == 0) continue;
      var weight = 0;
      for (var k = 0; k < 4; k++) {
        var xx = j + houkouX[k];
        var yy = i + houkouY[k];
        if (xx < 0 || xx >= WIDTH || yy < 0 || yy >= HEIGHT) continue;
        if (map[yy][xx] != 0) weight ++;
      }
      map[i][j] = weight + 1;
    }
  }
}

function drawMap() {
  var image;
  // 表示
  ctx.clearRect(0, 0, CHIP_SIZE * WIDTH, CHIP_SIZE * HEIGHT);
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      var color = '#000000';
      if ((i + j) % 2 == 0) {
        var color = '#333333';
      }
      ctx.fillStyle = color;
      ctx.fillRect(j * CHIP_SIZE, i * CHIP_SIZE, CHIP_SIZE, CHIP_SIZE);
      if (map[i][j] == 0) continue;
      var color;
      switch (map[i][j]) {
        case 1:
          image = img.lv1;
          break;
        case 2:
          image = img.lv2;
          break;
        case 3:
          image = img.lv3;
          break;
        case 4:
          image = img.lv4;
          break;
        case 5:
          image = img.lv5;
          break;
      }
      ctx.drawImage(image, j * CHIP_SIZE, i * CHIP_SIZE);
    }
  }
}

function checkEnd() {
  var sleepCount = 0;
  var activeCount = 0;
  for (var i = 0; i < HEIGHT; i++) {
    for (var j = 0; j < WIDTH; j++) {
      var chip = map[i][j];
      if (chip == 1) sleepCount ++;
      if (chip == 3) activeCount ++;
    }
  }
  if (sleepCount == maxChipCount) {
    gameClear();
    return;
  }
  if (activeCount == 0) gameOver();
}

function gameClear() {
  $('#gameover_buttons').css('display', 'block');
  clearInterval(timer);
  $(canvas).unbind();
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var alpha = 0.0;
  ctx.fillStyle = '#000000';
  timer = setInterval(function() {
    ctx.globalAlpha = 1;
    ctx.putImageData(imageData, 0, 0);
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    alpha += 0.01;
    if (alpha >= 1.0) {
      finishFadeout();
    }
  }, 33);

  function finishFadeout() {
    clearInterval(timer);
    ctx.font = '50px serif';
    ctx.textAlign = 'center';
    ctx.textBaseLine = 'top';
    ctx.fillStyle = '#ffffff';
    var alpha = 0.0;
    timer = setInterval(function() {
      ctx.globalAlpha = 1.0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = alpha;
      ctx.fillText("It's so silent...", canvas.width/2, canvas.height/2);
      alpha += 0.05;
      if (alpha >= 1.0) {
        clearInterval(timer);
      }
    }, 33);
  }
}

function gameOver() {
  $('#gameover_buttons').css('display', 'block');
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.font = '68px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseLine = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
  clearInterval(timer);
  $(canvas).unbind();
}

function clickRetry() {
  $('#buttons').css('display', 'none');
  $('#gameover_buttons').css('display', 'none');
  ready();
}
