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
}
