var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var requirejs = require('requirejs');
var GameState = require('./scripts/gameState');

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname));


var gamesControl = {
	games: [],
	createNewGame: function(socket) {
		console.log("create new");
		var game = new GameState(socket);
		this.games.push(game);
	},
	findFreeGame: function(socket) {
		for(var i = 0; i < this.games.length; i++) {
			if(this.games[i].isFree()) {
				this.games[i].addPlayer(socket);
				return;
			}
		}
		this.createNewGame(socket);
	},
	startReadyGames: function() {
		for(var i = 0; i < this.games.length; i++) {
			if(this.games[i].ready === true && this.games[i].started === false)
				this.games[i].start();
		}
	}
}

io.on('connection', function(socket) {
	gamesControl.findFreeGame(socket);
	gamesControl.startReadyGames();
});

server.listen(3000, function() {
	console.log("listening on: 3000");
});


