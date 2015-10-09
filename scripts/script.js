function generateFieldsHTML(x, y) {
	var table = "<table class=\"board\"><tbody>"
	for(var i = 0; i < x; i++) {
		table += "<tr>";
		for(var j = 0; j < y; j++) {
			table += "<td><div id=\""+i+j+"\" class=\"field\"></div></td>"
		} 
		table += "</tr>"
	}
	table += "</tbody></table>"
	return table;
}

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

function delay(coords, i) {
	setTimeout(function() {
		var el = document.getElementById(coords[i]);
		el.style.backgroundColor = "yellow";
	},i*1000);
}

function animateSolution(coords) {
	for(var i = 0; i < coords.length; i++) {
		delay(coords, i);
	}
}


function handleClick(event) {
	var el = event.target;
    var solution = [];
    if (el.className == "field" && el.nodeName == "DIV" && !el.taken) {
        el.style.backgroundColor = colorHolder.color;
        el.taken = true;
        gameData[parseInt(el.id[0])][parseInt(el.id[1])] = colorHolder.color;
        if(checkForSolution(getRLDiagonals(10,10,gameData), colorHolder.color).length == 4 || 
           checkForSolution(getLRDiagonals(10,10, gameData), colorHolder.color).length == 4 ||
           checkForSolution(getRows(10, 10, gameData), colorHolder.color).length == 4 || 
           checkForSolution(getCols(10, 10, gameData), colorHolder.color).length == 4) {
           console.log(colorHolder.color+" WINS");
       	   document.onclick = null;

       		if(checkForSolution(getRLDiagonals(10,10,gameData), colorHolder.color).length == 4) {
       			solution = checkForSolution(getRLDiagonals(10,10,gameData), colorHolder.color);
       			animateSolution(solution);
       		}
       		if(checkForSolution(getLRDiagonals(10,10,gameData), colorHolder.color).length == 4) {
       			solution = checkForSolution(getLRDiagonals(10,10,gameData), colorHolder.color);
       			animateSolution(solution);
       		}
       		if(checkForSolution(getRows(10,10,gameData), colorHolder.color).length == 4) {
       			solution = checkForSolution(getRows(10,10,gameData), colorHolder.color);
       			animateSolution(solution);
       		}
       		if(checkForSolution(getCols(10,10,gameData), colorHolder.color).length == 4) {
       			solution = checkForSolution(getCols(10,10,gameData), colorHolder.color);
       			animateSolution(solution);
       		}
        }
        	
		colorHolder.changeColor();
    }
}

var colorHolder = {
	color: "red",
	changeColor: function() {
		if(this.color === "red")
			this.color = "blue";
		else if (this.color === "blue")
			this.color = "red";
	}
}

var x = 10;
var y = 10;

var gameData = generateInitialGameData(x, y);
var field = generateFieldsHTML(x, y);
document.write(field);

document.onclick = handleClick;






