(function() {
	var GameState = require('./gameState');

	var gamesControl = {
		games: [],
		createNewGame: function() {
			var game = new GameState();
			this.games.push(game);
		},
		findFreeGame: function(socket) {
			for(var i = 0; i < this.games.length; i++) {
				if(this.games[i].isFree()) {
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
		},
		removePlayerFromGame: function(socketId) {
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

	module.exports = gamesControl;
})();
