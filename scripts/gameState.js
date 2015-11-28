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
		this.stateId = 0;
	}

	GameState.prototype.isFree = function() {
		if(this.socket1 === null || this.socket2 === null)
			return true;
		return false; 
	}

	GameState.prototype.addPlayer = function(socket) {
		
		var gameState = this;
		var socket1 = this.socket1;
		var socket2 = this.socket2;

		if(socket1 === null) {
			socket1 = socket;
			this.socket1 = socket1;
			socket1.on("endturn", function(data) {
				if(gameState.restartMode) {
					GameState.restart(gameState);
					GameState.sendFirstTurn(gameState);
				}
				else 
					GameState.processEndTurn(gameState, socket1, data); //process incoming data and respond appropriately
			});
			socket1.on("restart", function() {
				GameState.handleRestartReq(gameState);
			});

			if(socket2 === null) {
				this.data = GameState.resetData();
				socket.emit("waitPlayer", { message: "Waiting for another player ..." });
			}
			else
				this.ready = true;
		}
		else {
			socket2 = socket;
			this.socket2 = socket2;
			socket2.on("endturn", function(data) {
				if(gameState.restartMode) {
					GameState.restart(gameState);
					GameState.sendFirstTurn(gameState);
				}
				else 
					GameState.processEndTurn(gameState, socket2, data);
			});
			socket2.on("restart", function() {
				GameState.handleRestartReq(gameState);
			});
			this.data = GameState.resetData();
			if(socket1 === null) {
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
		this.timedOut = false;
		var gameState = this;
		this.stateId++;
		
		GameState.setColors(gameState); //call helper function to initialize color for each socket
		GameState.sendFirstTurn(gameState); 
	}

	//helpers
	GameState.handleRestartReq = function(gameState) {
		gameState.restartMode = true;
		if(GameState.solution(gameState, gameState.socket1.color) || 
			GameState.solution(gameState, gameState.socket2.color) || 
			GameState.allFieldsTaken(gameState) ||
			gameState.timedOut) {
			
			GameState.restart(gameState);
			gameState.socket1.emit("restartMode", { message: "restarting ..."});
			gameState.socket2.emit("restartMode", { message: "restarting ..."});
			GameState.sendFirstTurn(gameState);
		}
		else {
			gameState.socket1.emit("restartMode", { message: "restarting ..."});
			gameState.socket2.emit("restartMode", { message: "restarting ..."});
		}

	}

	GameState.processEndTurn = function(gameState, socket, data) {
		if(gameState.started){
			if(data.position === null){
				gameState.timedOut = true;
				gameState.socket1.emit("timedOut", { message : socket.color+" lost to timebank"} ); //send the color of timed out socket
				gameState.socket2.emit("timedOut", { message : socket.color+" lost to timebank"} );
			}
			else {
				gameState.data[parseInt(data.position[0])][parseInt(data.position[1])] = data.color;
				if(GameState.solution(gameState, socket.color)) { //solution is a helper function defined on the constructor
					var solution = GameState.getSolution(gameState, socket.color);
					gameState.socket1.emit("showWinner", { winner: socket.color, fill: data.position, solution: solution });
					gameState.socket2.emit("showWinner", { winner: socket.color, fill: null, solution: solution });
				}
				else {
					if(socket.id === gameState.socket2.id)
						gameState.socket1.emit("turn", { clientColor: gameState.socket1.color, opponent : { position: data.position, color: data.color }, stateId : gameState.stateId} );
					else
						gameState.socket2.emit("turn", { clientColor: gameState.socket2.color, opponent : { position: data.position, color: data.color }, stateId : gameState.stateId} );
				}
			}
		}
	}


	GameState.sendFirstTurn = function(gameState) {
		gameState.socket1.emit("gameStarted", { message: "Game running ..."});
		gameState.socket2.emit("gameStarted", { message: "Game running ..."});
		if(gameState.lastStarted === 1)
			gameState.socket1.emit("turn", { clientColor: gameState.socket1.color, opponent : { position: null, color: null }, stateId : gameState.stateId} );
		else
			gameState.socket2.emit("turn", { clientColor: gameState.socket2.color, opponent : { position: null, color: null }, stateId : gameState.stateId} );
	}

	GameState.restart = function(state) {
		if(state.lastStarted === 1)
			var lastStarted = 2;
		else
			var lastStarted = 1;
		state.data = GameState.resetData();
		state.lastStarted = lastStarted;
		state.restartMode = false;
		state.timedOut = false;
		state.stateId++;
	}

	GameState.allFieldsTaken = function(state) {
		for(var i = 0; i < 10; i++) {
			for(var j = 0; j < 10; j++) {
				if(state.data[i][j] !== "Red" || state.data[i][j] !== "Blue")
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
		state.socket1.color = "Red";
	    state.socket2.color = "Blue";
	}

	module.exports = GameState;
})();
