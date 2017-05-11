var mapWidth = 1000;
var mapHeight = 1000;
var map = {skittles: [], players: []};

var colors = ["red", "green", "blue"];
var Skittle = function() {
  this.x = Math.random()*mapWidth;
  this.y = Math.random()*mapHeight;
  this.color = colors[Math.floor(Math.random()*colors.length)];
}
var Player = function() {
  this.x = Math.random()*mapWidth;
  this.y = Math.random()*mapHeight;
  this.color = colors[Math.floor(Math.random()*colors.length)];
  this.score = 1;
};

var createSkittles = function() {
  while(map.skittles.length < 400) {
    map.skittles.push(new Skittle());
  }
};
setInterval(createSkittles, 500);
var createPlayer = function(playerName) {
  var newPlayer = new Player(playerName);
  map.players.push(newPlayer);
  return newPlayer;
};
var getMap = function() {
  return map;
};
var updatePosition = function(player) {
  var player = map.players[map.players.indexOf(player)];
  player.x = player.x;
  player.y = player.y;
};
var checkSkittles = function() {
  console.log(map.skittles.length, map.players.length);
  for(var skittle of map.skittles) {
    for(var player of map.players) {
      var xDiff = player.x - skittle.x;
      var yDiff = player.y - skittle.y;
      var distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
      if(distance < 10) {
	console.log(player.x, skittle.x, player.y, skittle.y, player.score);
        player.score += 0.1;
        map.skittles.splice(map.skittles.indexOf(skittle), 1);
        break;
      }
    }
  }
}
setInterval(checkSkittles, 10);
