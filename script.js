$(function() {
  var canvas = $("#canvas")[0], ctx = canvas.getContext("2d"), width = height = 0;
  $(window).resize(function() {
    width = canvas.width = $("#canvas").width();
    height = canvas.height = $("#canvas").height();
    $("#title").css("top", height/2-75);
    $("#name").css("top", height/2);
    $("#enter").css({
      top: height/2+75,
      left: (width-$("#enter").width())/2-20
    });
  }).resize();
  $("#name").keydown(function() {
    if(event.which == 13)
      $("#enter").click();
  });
  $("#enter").click(function() {
    $("#name").off();
    $("#cover").animate({opacity: 0}, 500, function() {
      $(this).hide();
    });
    play($(this).val());
    $("#canvas").focus();
  });

  // connect to websocket
  var play = function(playerName) {
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
    socket.on("update", function(mapObject, newScore, newHealth, newX, newY) {
      map = mapObject;
      if(!player) return;
      player.score = newScore;
      player.health = newHealth;
      player.x = newX;
      player.y = newY;
    });
    socket.on("died", function() {
      $("#cover").show();
      $("#cover").animate({opacity: 1}, 500);
      $("#canvas").off();
      keymap = [];
    });
    var draw = function() {
      if(!player || !map) {
        requestAnimationFrame(draw);
        return;
      }
      ctx.fillStyle = "#2c3e50";
      ctx.fillRect(0, 0, width, height);
    
      ctx.fillStyle = "#bdc3c7";
      ctx.fillRect(width/2-player.x-5, height/2-player.y-5, mapWidth+10, mapHeight+10);

      // draw skittles
      for(skittle of map.skittles) {
        if(Math.abs(skittle.x-player.x) > width/2 || Math.abs(skittle.y-player.y) > height/2) {
          continue;
        }
        ctx.fillStyle = skittle.color;
        ctx.beginPath();
        ctx.arc(skittle.x-player.x+width/2, skittle.y-player.y+height/2, 5, 0, Math.PI*2);
        ctx.closePath();
        ctx.fill();
      }

      // draw other players
      ctx.strokeStyle = "#34495e";
      ctx.lineWidth = 5;
      for(otherPlayer of map.players) {
        if(otherPlayer.id == player.id) {
          continue; 
        }
        ctx.fillStyle = otherPlayer.color;
        ctx.beginPath();
        ctx.arc(otherPlayer.x-player.x+width/2, otherPlayer.y-player.y+height/2, otherPlayer.score*10, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#34495e";
        ctx.fillRect(otherPlayer.x-player.x+width/2-10, otherPlayer.y-player.y+height/2-otherPlayer.score*10-15, 20, 8);
        ctx.lineWidth = 1;
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(otherPlayer.x-player.x+width/2-8, otherPlayer.y-player.y+height/2-player.score*10-13, 16*player.health, 4);
      }

      // draw player
      if(player.health < 0) return;
      ctx.fillStyle = player.color;
      ctx.lineWidth=5;
      ctx.strokeStyle = "#f1c40f";
      ctx.beginPath();
      ctx.arc(width/2, height/2, player.score*10, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f1c40f";
      ctx.fillRect(width/2-10, height/2-player.score*10-15, 20, 8);
      ctx.lineWidth = 1;
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(width/2-8, height/2-player.score*10-13, Math.max(16*player.health, 0), 4);

      requestAnimationFrame(draw);
    }
    draw();

    // movement
    var lastDirection = 0;
    $("#canvas").on("mousemove", function(event) {
      var newDirection = (event.pageX > width/2 ? 0 : 180)+Math.atan((event.pageY-height/2)/(event.pageX-width/2)) * 180/Math.PI;
      newDirection = Math.round(newDirection/20)*20;
      if(lastDirection != newDirection) {
        lastDirection = newDirection;
        socket.emit("direction", newDirection);
      }
    });
    /*var keymap = [];
    $("#canvas").on("keydown keyup", function(event) {
      if(event.type == "keydown" && keymap.indexOf(event.which) == -1) {
        keymap.push(event.which);
      } else if(event.type == "keyup") {
        keymap.splice(keymap.indexOf(event.which), 1);
      }
    });
    setInterval(function() {
      if(!player || !map) return;
      //var speed = 3*Math.pow(0.5, player.score-1)+0.5;
      var speed = 2;
      var moved = false;
      if((keymap.indexOf(37) >= 0 || keymap.indexOf(39) >= 0) && (keymap.indexOf(38) >= 0 && keymap.indexOf(40) >= 0)) {
        speed *= Math.sqrt(2)/2;
      }
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
        socket.emit("positionUpdate", player.x, player.y);
      }
    }, 20);*/
  };

});
