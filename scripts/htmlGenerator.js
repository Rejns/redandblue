define(function() {
	return {
		table: function(x, y)  {	
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
	}
});