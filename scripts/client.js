require.config({
	paths: {
		socketio: "/socket.io/socket.io",
		jquery: "/node_modules/jquery/dist/jquery",
		board: "/scripts/board"
	}
});

require(["socketio","jquery","board"], function(io, jq, board) {
	var socket = io.connect("http://localhost:8080");

	socket.on("setColor",function(data){
		board.init(10,10, data.color);
	});
	socket.on("turn", function(data){
		if(board.color === data.turn) {	
			board.fillColor(data.fill);
			board.addClickListener();
			board.countDown(10, function() {
				socket.emit("endturn", { position: board.data });
				board.removeEventListener();
				board.data = null;
			});
		}
	});
	socket.on("showWinner", function(data) {
		if(board.color !== data.winner)
			board.fillColor(data.fill);
		board.showWinner(data.winner+" wins");
		board.animateSolution(data.solution);
	});
});