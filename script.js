$(function() {
  var canvas = $("#canvas")[0], ctx = canvas.getContext("2d"), width = height = 0;
  $(window).resize(function() {
    width = canvas.width = $("#canvas").width();
    height = canvas.height = $("#canvas").height();
  }).resize();

  // connect to websocket
  var socket = io.connect("https://agario-ripoff-server.herokuapp.com/");

  var player, mapWidth, mapHeight, map;
  socket.emit("name", "Jonathan");
  socket.on("player", function(playerObject) {
    player = playerObject;
  });
  socket.on("mapDimensions", function(width, height) {
    mapWidth = width;
    mapHeight = height;
  });
  socket.on("map", function(mapObject) {
    map = mapObject;
  });
  var draw = function() {
    if(!player || !map) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  
    ctx.fillStyle = "white";
    ctx.fillRect(width/2-player.x-5, height/2-player.y-5, 1010, 1010);

    // draw skittles
    for(skittle of map.skittles) {
      ctx.fillStyle = skittle.color;
      ctx.beginPath();
      ctx.arc(skittle.x-player.x+width/2, skittle.y-player.y+height/2, 5, 0, Math.PI*2);
      ctx.closePath();
      ctx.fill();
    }

    // draw player
    ctx.strokeStyle = "black";
    ctx.fillStyle = "turquoise";
    ctx.beginPath();
    ctx.arc(width/2, height/2, player.score*10, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    requestAnimationFrame(draw);
  }
  draw();

  // movement
  var keymap = [];
  $("#canvas").on("keydown keyup", function(event) {
    if(event.type == "keydown" && keymap.indexOf(event.which) == -1) {
      keymap.push(event.which);
    } else if(event.type == "keyup") {
      keymap.splice(keymap.indexOf(event.which), 1);
    }
  });
  setInterval(function() {
    if(!player || !map) return;
    //var speed = 10/player.score;
    var speed = 4*Math.pow(0.5, player.score-1)+1;
    var moved = false;
    if(keymap.indexOf(37) >= 0) {
      player.x = Math.max(player.x-speed, 0);
      moved = true;
    } else if(keymap.indexOf(39) >= 0) {
      player.x = Math.min(player.x+speed, mapWidth);
      moved = true;
    }
    if(keymap.indexOf(38) >= 0) {
      player.y = Math.max(player.y-speed, 0);
      moved = true;
    } else if(keymap.indexOf(40) >= 0) {
      player.y = Math.min(player.y+speed, mapHeight);
      moved = true;
    }
    
    if(moved) {
      socket.emit("update", player.x, player.y);
    }
  }, 10);

  $("#canvas").focus();

});
