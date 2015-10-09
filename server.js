var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var requirejs = require('requirejs');

server.listen(8080);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.use(express.static(__dirname));

requirejs.config({
	paths: {
		gameState: "scripts/gameState",
	}
});

requirejs(["gameState"],function(gameState){

	io.on('connection', function (socket) {
		if(Object.keys(io.sockets.connected).length === 1){
			socket.color = "red";
			socket.emit("setColor", { color: socket.color });
		}
		else if(Object.keys(io.sockets.connected).length === 2){
			socket.color = "blue";
			socket.emit("setColor", { color: socket.color });
			io.emit("turn", { turn: gameState.currentColor, fill: null } );
		}
		socket.on("endturn", function(data){
			if(data.position === null)
				console.log(socket.color+ "lost to timebank");
			else {
				gameState.data[parseInt(data.position[0])][parseInt(data.position[1])] = socket.color;
				if(gameState.solution()) {
					console.log(socket.color+" wins");
					var solution = gameState.getSolution();
					io.emit("showWinner", { winner: socket.color, fill: data.position, solution: solution });
				}
				else {
					gameState.changeColor();
					io.emit("turn", { turn: gameState.currentColor, fill: data.position });	
				}
			}
		});
	});

});
