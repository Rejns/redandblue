(function() {
function checkForSolution(lines, currentColor) {
	var counter = 0;
	var line;
	var newLocation = [];


	for(var x = 0; x < lines.length; x++) {
		line = lines[x];
		for(var i = 0; i < line.length; i++) {
			if(line[i].color === currentColor ) {
				newLocation.push(line[i].location);
				counter++;
				if(counter === 4) {
					return newLocation;
				}
			}
			else {
				counter = 0;
				newLocation = [];
			}
		}
		counter = 0;
		newLocation = [];
	}
	return newLocation;
}

function getLRDiagonals(x, y, gameData) {
	var LRDiagonals = [];
	var mainDiagonal = [];
	for(var i = 0; i < x; i++) {
		for(var j = 0; j < y; j++) {
			if(i == j) {
				mainDiagonal.push({color: gameData[i][j], location: i.toString()+j});
			}
		}
	}

	LRDiagonals.push(mainDiagonal);
	var one = [];
	var j = 0;

	for(var k = 1; k <= x - 4; k++) {
		for(var i = k; i < x; i++) {
			one.push({color: gameData[i][j], location: i.toString()+j})
			j++;
		}
		j = 0;
		LRDiagonals.push(one);
		one = [];
	}

	var i = 0;
	for(var k = 1; k <= y - 4; k++) {
		for(var j = k; j < y; j++) {
			one.push({color: gameData[i][j], location: i.toString()+j});
			i++;
		}
		i = 0;
		LRDiagonals.push(one);
		one = [];
	}

	return LRDiagonals;
}

function getRLDiagonals(x, y, gameData) { //from upper right to lower left
	var RLDiagonals = [];
	var mainDiagonal = [];
	for(var i = 0; i < x; i++) {
		for(var j = y; j > 0; j--) {
			if(i + j === x - 1) {
				mainDiagonal.push({color: gameData[i][j], location: i.toString()+j});
			}
		}
	}

	var i = 0;
	var one = [];

	for(var k = x - 2; k >= 4 - 1; k--) {
		for(var j = k; j >= 0; j--) {
			one.push({color: gameData[i][j], location: i.toString()+j});
			i++;
		}
		i = 0;
		RLDiagonals.push(one);
		one = [];
	}

	var j = y - 1;

	for(var k = 1; k <= y - 4; k++) {
		for(var i = k; i < x; i++) {
			one.push({color: gameData[i][j], location: i.toString()+j})
			j--;
		}
		RLDiagonals.push(one);
		j = y - 1;
		one = [];
	}


	RLDiagonals.push(mainDiagonal);
	return RLDiagonals;

}

function getRows(x, y, gameData) {
	var rows = [];
	var row = [];
	for(var i = 0; i < x; i++) {
		for(var j = 0; j < y; j++) {
		row.push({color: gameData[i][j], location: i.toString()+j});
		}
		rows.push(row);
	}

	return rows;
}

function getCols(x, y, gameData) {
	var columns = [];
	var col = [];
	for(var i = 0; i < x; i++) {
		for(var j = 0; j < y; j++) {
			col.push({color: gameData[j][i], location: j.toString()+i})
		}
		columns.push(col);
		col = [];
	}
	return columns;
}

function concatArrays(x, y, gameData) {
	var finalArray = []
	finalArray = finalArray.concat(getCols(x,y, gameData));
	finalArray = finalArray.concat(getRows(x,y, gameData));
	finalArray = finalArray.concat(getLRDiagonals(x,y, gameData));
	finalArray = finalArray.concat(getRLDiagonals(x,y, gameData));
	return finalArray;
}

function generateInitialGameData(x, y) {
	var result = [];
	var inner = [];
	for(var i = 0; i < x; i++) {
		for(var j = 0; j < y; j++) {
			inner.push(0);
		}
		result.push(inner);
		inner = [];
	}
	return result;
}

function GameState() {
	this.started = false;
	this.ready = false;
	this.socket1 = null;
	this.socket2 = null;
	this.lastStarted = 1;
}

GameState.prototype.isFree = function() {
	if(this.socket1 === null || this.socket2 === null)
		return true;
	return false; 
}

GameState.prototype.addPlayer = function(socket) {
	if(this.socket1 === null) {
		this.socket1 = socket;
		if(this.socket2 === null) {
			this.data = GameState.resetData();
			socket.emit("waitPlayer", { message: "Waiting for another player ..." });
		}
		else
			this.ready = true;
	}
	else {
		this.socket2 = socket;
		this.data = GameState.resetData();
		if(this.socket1 === null) {
			this.data = GameState.resetData();
			socket.emit("waitPlayer", { message: "Waiting for another player ..." });
		}
		else
			this.ready = true;
	}
}

GameState.prototype.start = function() {

	this.restartMode = false;
	this.started = true;
    var socket1 = this.socket1;
	var socket2 = this.socket2;
	var gameState = this;
	GameState.setColors(gameState); //call helper function to initialize color for each socket

	socket1.emit("gameStarted", { message: "Game running ..."});
	socket2.emit("gameStarted", { message: "Game running ..."});
	if(this.lastStarted === 1)
		socket1.emit("turn", { clientColor: socket1.color, opponent : { position: null, color: null }} );
	else
		socket2.emit("turn", { clientColor: socket2.color, opponent : { position: null, color: null }} );
	
	

	socket1.on("endturn", function(data) {
		if(gameState.restartMode) {
			GameState.restart(gameState);
			socket1.emit("gameStarted", { message: "Game running ..."});
			socket2.emit("gameStarted", { message: "Game running ..."});
			if(gameState.lastStarted === 1)
				socket1.emit("turn", { clientColor: socket1.color, opponent : { position: null, color: null }} );
			else
				socket2.emit("turn", { clientColor: socket2.color, opponent : { position: null, color: null }} );
		}
		else {
		if(gameState.started){
			if(data.position === null){
				console.log(this.color+"lost to timebank");
			}
			else {
				gameState.data[parseInt(data.position[0])][parseInt(data.position[1])] = data.color;
				
				if(GameState.solution(gameState, socket1.color)) {
					console.log(data.color+" wins");
					var solution = GameState.getSolution(gameState, socket1.color);
					socket1.emit("showWinner", { winner: socket1.color, fill: null, solution: solution });
					socket2.emit("showWinner", { winner: socket1.color, fill: data.position, solution: solution });
				}
				else
					socket2.emit("turn", { clientColor: socket2.color, opponent : { position: data.position, color: data.color }} );
			}
		}
		}
	});

	socket2.on("endturn", function(data) {
		if(gameState.restartMode) {
			GameState.restart(gameState);
			socket1.emit("gameStarted", { message: "Game running ..."});
			socket2.emit("gameStarted", { message: "Game running ..."});
			if(gameState.lastStarted === 1)
				socket1.emit("turn", { clientColor: socket1.color, opponent : { position: null, color: null }} );
			else
				socket2.emit("turn", { clientColor: socket2.color, opponent : { position: null, color: null }} );
		}
		else {
		if(gameState.started){
			if(data.position === null){
				console.log(this.color+"lost to timebank");
			}
			else {
				gameState.data[parseInt(data.position[0])][parseInt(data.position[1])] = data.color;
				if(GameState.solution(gameState, socket2.color)) { //solution is a helper function defined on the constructor
					console.log(data.color+" wins");
					var solution = GameState.getSolution(gameState, socket2.color);
					socket1.emit("showWinner", { winner: socket2.color, fill: data.position, solution: solution });
					socket2.emit("showWinner", { winner: socket2.color, fill: null, solution: solution });
				}
				else
					socket1.emit("turn", { clientColor: socket1.color, opponent : { position: data.position, color: data.color }} );
			}
		}
		}
	});

	socket1.on("restart", function() {
		gameState.restartMode = true;
		if(GameState.solution(gameState, socket1.color) || GameState.solution(gameState, socket2.color) || GameState.allFieldsTaken(gameState)) {
			console.log("restart end game");
			GameState.restart(gameState);
			socket1.emit("restartMode", { message: "restarting ..."});
			socket2.emit("restartMode", { message: "restarting ..."});
			socket1.emit("gameStarted", { message: "Game running ..."});
			socket2.emit("gameStarted", { message: "Game running ..."});
			if(gameState.lastStarted === 1)
				socket1.emit("turn", { clientColor: socket1.color, opponent : { position: null, color: null }} );
			else
				socket2.emit("turn", { clientColor: socket2.color, opponent : { position: null, color: null }} );
		}
		else {
			socket1.emit("restartMode", { message: "restarting ..."});
			socket2.emit("restartMode", { message: "restarting ..."});
		}
	});
	socket2.on("restart", function() {
		gameState.restartMode = true;
		if(GameState.solution(gameState, socket2.color) || GameState.solution(gameState, socket1.color) || GameState.allFieldsTaken(gameState)) {
			console.log("restart end game");
			GameState.restart(gameState);
			socket1.emit("restartMode", { message: "restarting ..."});
			socket2.emit("restartMode", { message: "restarting ..."});
			socket1.emit("gameStarted", { message: "Game running ..."});
			socket2.emit("gameStarted", { message: "Game running ..."});
			if(gameState.lastStarted === 1)
				socket1.emit("turn", { clientColor: socket1.color, opponent : { position: null, color: null }} );
			else
				socket2.emit("turn", { clientColor: socket2.color, opponent : { position: null, color: null }} );
		}
		else {
			socket1.emit("restartMode", { message: "restarting ..."});
			socket2.emit("restartMode", { message: "restarting ..."});
		}
	});
}

//helpers
GameState.restart = function(state) {
	if(state.lastStarted === 1)
		var lastStarted = 2;
	else
		var lastStarted = 1;
	state.data = GameState.resetData();
	state.lastStarted = lastStarted;
	state.restartMode = false;
}

GameState.allFieldsTaken = function(state) {
	for(var i = 0; i < 10; i++) {
		for(var j = 0; j < 10; j++) {
			if(state.data[i][j] !== "red" || state.data[i][j] !== "blue")
				return false;
		}
	}
	return true;
}

GameState.resetData = function() {
	return generateInitialGameData(10, 10);
}

GameState.getSolution = function(state, color) {
	var solution = checkForSolution(concatArrays(10, 10, state.data), color);
	return solution;
}

GameState.solution = function(state, color) {
	if(checkForSolution(concatArrays(10, 10, state.data), color).length == 4)
		return true;
	else 
		return false;
}

GameState.setColors = function(state) {
	state.socket1.color = "red";
    state.socket2.color = "blue";
}

module.exports = GameState;
})();
