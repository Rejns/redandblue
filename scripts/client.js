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

	socket.on("waitPlayer", function() {
		$('#message').html("waiting for another player ...");
	});

	socket.on("turn", function(data){
		$('#message').hide();
		board.fillColor(data.opponent.position, data.opponent.color);
		console.log(data);
		board.addClickListener(data.clientColor); //pass in color of current client (red or blue)
		board.countDown(10, function() { //function checks if data is set within 10 seconds and sends null otherwise
			socket.emit("endturn", { position: board.data, color: data.clientColor });
			board.removeEventListener();
			board.data = null; //reset data for next turn
		});
	});
	socket.on("showWinner", function(data) {
		board.fillColor(data.fill);
		board.showWinner(data.winner+" wins");
		board.animateSolution(data.solution);
	});
});