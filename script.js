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
    $("#cover").animate({opacity: 0}, 500, function() {
      $(this).hide();
    });
    play($("#name").val());
    $("#canvas").focus();
  });

  // connect to websocket
  var play = function(playerName) {
    var socket = io.connect("https://agario-ripoff-server.herokuapp.com/", {"forceNew": true});

    var player, mapWidth, mapHeight, map;
    socket.emit("name", playerName);
    socket.on("player", function(playerObject) {
      player = playerObject;
    });
    socket.on("mapDimensions", function(width, height) {
      mapWidth = width;
      mapHeight = height;
    });
    socket.on("update", function(mapObject, newPlayer) {
      map = mapObject;
      if(!player) return;
      player = newPlayer;
    });
    socket.on("died", function() {
      $("#cover").show();
      $("#cover").animate({opacity: 1}, 500);
      $("#canvas").off();
      keymap = [];
      $("#name").val(player.name).focus();
    });
    ctx.font = "16px Verdana";
    var draw = function() {
      if(!player || !map) {
        requestAnimationFrame(draw);
        return;
      }
      ctx.fillStyle = "#95a5a6";
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
      ctx.textAlign = "center";
      ctx.font = "bold 16px Verdana";
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
        ctx.fillText(otherPlayer.name, otherPlayer.x-player.x+width/2, otherPlayer.y-player.y+height/2-player.score*10-23);
        ctx.fillStyle = "#34495e";
        ctx.fillRect(otherPlayer.x-player.x+width/2-10, otherPlayer.y-player.y+height/2-otherPlayer.score*10-15, 20, 8);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(otherPlayer.x-player.x+width/2-8, otherPlayer.y-player.y+height/2-otherPlayer.score*10-13, 16*otherPlayer.health, 4);
      }
      ctx.textAlign = "start";
      ctx.font = "16px Verdana";

      // draw player
      if(player.health <= 0) return;
      ctx.fillStyle = player.color;
      ctx.lineWidth = 5;
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
      ctx.fillStyle = "#2c3e50";
      ctx.fillText(player.name, 50, height-160);

      // write money and upgrades
      ctx.fillStyle = "rgba(52, 73, 94, 0.2)";
      ctx.fillRect(50, 76, 300, 100);
      ctx.fillStyle = "#2c3e50";
      ctx.fillText("Money: " + player.money, 50, 66);
      ctx.fillText("Health (1): " + player.upgrades.health + " | Cost: " + (player.upgrades.health+1), 65, 102);
      ctx.fillText("Speed (2): " + player.upgrades.speed + " | Cost: " + (player.upgrades.speed+1), 65,  122);
      ctx.fillText("Damage (3): " + player.upgrades.damage + " | Cost: " + (player.upgrades.damage+1), 65, 142);
      ctx.fillText("Regen (4): " + player.upgrades.regen + " | Cost: " + (player.upgrades.regen+1), 65, 162);

      // minimap
      ctx.fillStyle = "rgba(52, 73, 94, 0.2)";
      ctx.fillRect(50, height-150, 100, 100);
      ctx.fillStyle = "#f1c40f";
      ctx.beginPath()
      ctx.arc(50+player.x/mapWidth*100, height-150+player.y/mapHeight*100, 2, 0, Math.PI*2);
      ctx.closePath();
      ctx.fill();

      // leaderboard
      var players = map.players;
      players.sort(function(a, b) {
        return b.score - a.score;
      }); 
      ctx.fillStyle = "rgba(52, 73, 94, 0.2)";
      ctx.fillRect(width-350, 50, 300, (players.length+1) * 20);
      ctx.fillStyle = "#2c3e50";
      for(var playerObject in players) {
        ctx.fillText((parseInt(playerObject)+1) + ". " + players[playerObject].name, width-335, 76+20*playerObject);
        ctx.textAlign = "end";
        ctx.fillText(Math.round((players[playerObject].score-1)*200), width-65, 76+20*playerObject);
        ctx.textAlign = "start";
      }

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
    $("#canvas").on("keydown", function(event) {
      if(event.which == 97 || event.which == 49)
        socket.emit("upgrade", "health");
      else if(event.which == 98 || event.which == 50)
        socket.emit("upgrade", "speed");
      else if(event.which == 99 || event.which == 51) 
        socket.emit("upgrade", "damage");
      else if(event.which == 100 || event.which == 52)
        socket.emit("upgrade", "regen");
    });

  };

});
