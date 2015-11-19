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
		data: null,
		countDown: countDown,
		showWinner: function(winner) {
			document.getElementById("winner").innerHTML = winner;
		},
		fillColor: function(position, color) {
			if(position !== null) {
				el = document.getElementById(position);
				el.taken = true;
				el.style.backgroundColor = color;
			}
		},
		init: function(x, y) {
			console.log(document.getElementsByClassName('container')[0]);
			document.getElementsByClassName('container')[0].innerHTML = hg.table(x, y);
			this.data = null;
		},
		animateSolution: animateSolution,
		addClickListener: addClickListener,
		removeEventListener: removeEventListener
	};
})