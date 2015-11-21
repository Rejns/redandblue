define(["htmlGenerator"], function(hg){
	
	var handler = function(self, el, color) {
		var self = self;
		return function() {
			if(!el.taken) {
				self.data = el.id;
				el.style.backgroundColor = color;
				el.taken = true;
			}
		};
	}

	var addClickListener = function(color) {
		var fields = document.getElementsByClassName("field");
		for(var i = 0; i < fields.length; i++) {
			fields[i].onclick = handler(this, fields[i], color);
		}
	}


	var removeClickListener = function() {
		var fields = document.getElementsByClassName("field");
		for(var i = 0; i < fields.length; i++) {
			fields[i].onclick = null;
		}
	}

	var countDown = function(i, callback) {
		var self = this;
		var intervalId = setInterval(function(){
			document.getElementById("counter").innerHTML = i;
			if(self.data !== null || self.wait || self.restart || self.winner)
				clearInterval(intervalId, callback());
			else
			i-- || clearInterval(intervalId, callback());
		},1000);
	}

	function delay(coords, i, callback) {
		setTimeout(function() {
			var el = document.getElementById(coords[i]);
			el.style.backgroundColor = "yellow";
			if(i === 4 - 1) {
				callback();
			}
		},i*1000);
	}

	function animateSolution(coords, callback) {
		for(var i = 0; i < coords.length; i++) {
			delay(coords, i, callback);
		}
	}

	return {
		data: null,
		countDown: countDown,
		showWinner: function(winner) {
			document.getElementById("message").innerHTML = winner;
		},
		hideWinner: function() {
			document.getElementById("message").innerHTML = "";
		},
		fillColor: function(position, color) {
			if(position !== null) {
				el = document.getElementById(position);
				el.taken = true;
				el.style.backgroundColor = color;
			}
		},
		reset: function() {
			var fields = document.getElementsByClassName("field");
			for(var i = 0; i < fields.length; i++) {
				fields[i].style.backgroundColor = "white";
				fields[i].taken = false;
			}
		},
		init: function(x, y) {
			document.getElementsByClassName('container')[0].innerHTML = hg.table(x, y);
			this.data = null;
		},
		hideCounter: function() {
			document.getElementById('counter').innerHTML = "";
		},
		animateSolution: animateSolution,
		addClickListener: addClickListener,
		removeClickListener: removeClickListener
	};
})