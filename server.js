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
	createNewGame: function() {
		
		var game = new GameState();
		this.games.push(game);
		console.log("on create game "+this.games);
	},
	findFreeGame: function(socket) {
		for(var i = 0; i < this.games.length; i++) {
			if(this.games[i].isFree()) {
				console.log("found free game");
				this.games[i].addPlayer(socket);
				return;
			}
		}
		this.createNewGame();
		this.findFreeGame(socket);
	},
	startReadyGames: function() {
		for(var i = 0; i < this.games.length; i++) {
			if(this.games[i].ready === true && this.games[i].started === false)
				this.games[i].start();
		}
	},
	deleteGame: function(game) {
		
		var index = this.games.indexOf(game);
		this.games.splice(index, 1);
		console.log("on delete game "+this.games)
	},
	removePlayerFromGames: function(socketId) {
		for(var i = 0; i < this.games.length; i++) {
			if(this.games[i] !== undefined && this.games[i].socket1 !== null && this.games[i].socket1.id === socketId) {
				this.games[i].ready = false;
				this.games[i].started = false;
				this.games[i].socket1 = null;
				this.games[i].data = GameState.resetData();
				if(this.games[i].socket2 !== null)
					this.games[i].socket2.emit("waitPlayer", { message : "Waiting for another player ..." });
				if(this.games[i].socket1 === null && this.games[i].socket2 === null)
					this.deleteGame(this.games[i]);
			}
			if(this.games[i] !== undefined && this.games[i].socket2 !== null && this.games[i].socket2.id === socketId) {
			    this.games[i].ready = false;
				this.games[i].started = false;
				this.games[i].socket2 = null;
				this.games[i].data = GameState.resetData();
				if(this.games[i].socket1 !== null)
					this.games[i].socket1.emit("waitPlayer", { message : "Waiting for another player ..." });
				if(this.games[i].socket1 === null && this.games[i].socket2 === null)
					this.deleteGame(this.games[i]);	
			}
		}
	}
}

io.on('connection', function(socket) {
	gamesControl.findFreeGame(socket);
	gamesControl.startReadyGames();
	socket.on('disconnect', function() {
		gamesControl.removePlayerFromGames(socket.id);
	})
});

server.listen(3000, function() {
	console.log("listening on: 3000");
});


