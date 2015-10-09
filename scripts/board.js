define(["htmlGenerator"], function(hg){
	
	var handler = function(self, el) {
		var self = self;
		return function() {
			if(!el.taken) {
				self.data = el.id;
				el.style.backgroundColor = self.color;
				el.taken = true;
			}
		};
	}

	var addClickListener = function() {
		var fields = document.getElementsByClassName("field");
		for(var i = 0; i < fields.length; i++) {
			fields[i].onclick = handler(this, fields[i]);
		}
	}

	var removeEventListener = function() {
		var fields = document.getElementsByClassName("field");
		for(var i = 0; i < fields.length; i++) {
			fields[i].onclick = null;
		}
	}

	var countDown = function(i, callback) {
		var self = this;
		var intervalId = setInterval(function(){
			document.getElementById("counter").innerHTML = i;
			if(self.data != null)
				clearInterval(intervalId, callback());
			else
			i-- || clearInterval(intervalId, callback());
		},1000);
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

	return {
		color:null,
		data: null,
		countDown: countDown,
		showWinner: function(winner) {
			document.getElementById("winner").innerHTML = winner;
		},
		fillColor: function(position) {
			if(position !== null) {
				el = document.getElementById(position);
				el.taken = true;
				if(this.color === "red")
					el.style.backgroundColor = "blue";
				else
					el.style.backgroundColor = "red";
			}
		},
		init: function(x, y, color) {
			document.getElementsByClassName('container')[0].innerHTML = hg.table(x, y);
			this.color = color;
			this.data = null;
		},
		animateSolution: animateSolution,
		addClickListener: addClickListener,
		removeEventListener: removeEventListener
	};
})