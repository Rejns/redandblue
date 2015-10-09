define(function() {

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

	function getRLDiagonals(x, y, gameData) {
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
			for(var j = k; j > 0; j--) {
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

	var generateInitialGameData = function(x, y) {
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

	return {
		currentColor: "red",
		data: generateInitialGameData(10, 10),
		resetData: function() {
			this.data = generateInitialGameData(10, 10);
		},
		solution: function() {
			if(checkForSolution(concatArrays(10, 10, this.data), this.currentColor).length == 4)
				return true;
			else 
				return false;
		},
		changeColor: function() {
		if(this.currentColor === "red")
			this.currentColor = "blue";
		else if (this.currentColor === "blue")
			this.currentColor = "red";
		}
	};
});