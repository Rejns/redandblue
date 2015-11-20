require.config({
	paths: {
		socketio: "/socket.io/socket.io",
		jquery: "/node_modules/jquery/dist/jquery",
		board: "/scripts/board"
	}
});

require(["socketio","jquery","board"], function(io, jq, board) {
	
	board.init(10, 10);
	var socket = io.connect("http://localhost:3000");

	socket.on("waitPlayer", function(data) {
		board.reset();
		board.hideWinner();
		board.wait = true;
		$('#message').html(data.message);
		$('#message').show();

	});

	socket.on("restartMode", function(data) {
		board.reset();
		$('#restart').unbind('click');
		board.restart = true;
		$('#message').html(data.message);
		$('#message').show();
	});

	socket.on("gameStarted", function(data){
		board.hideWinner();
		$('#restart').on('click', function() {
			socket.emit("restart");
		});
		$('#message').html(data.message);
		$('#message').show();
	});

	socket.on("turn", function(data){
		board.restart = false;
		board.wait = false;
		board.fillColor(data.opponent.position, data.opponent.color);
		board.addClickListener(data.clientColor); //pass in color of current client (red or blue)
		board.countDown(1000, function() { //function checks if data is set within 10 seconds and sends null otherwise
			socket.emit("endturn", { position: board.data, color: data.clientColor });
			board.removeClickListener();
			board.data = null; //reset data for next turn
			board.hideCounter();
		});
	});
	socket.on("showWinner", function(data) {
		$('#restart').unbind('click');
		board.fillColor(data.fill);
		board.showWinner(data.winner+" wins");
		board.animateSolution(data.solution, function() {
			$('#restart').on('click', function() {
				socket.emit("restart");
			});
		});
	});
});

