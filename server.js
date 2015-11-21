var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var gamesControl = require('./scripts/gamesControl')

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname));

io.on('connection', function(socket) {
	gamesControl.findFreeGame(socket);
	gamesControl.startReadyGames();
	socket.on('disconnect', function() {
		gamesControl.removePlayerFromGame(socket.id);
	})
});

server.listen(3000, function() {
	console.log("listening on: 3000");
});


