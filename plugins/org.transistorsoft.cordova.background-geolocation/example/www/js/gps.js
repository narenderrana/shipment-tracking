var exec = require('cordova/exec');

var gps = {
    echoGPS: function() {  
    	var success = function(resp) { 
    		var c = document.getElementById("container")
            var newParagraph = document.createElement('p');
            // newParagraph.innerHTML = '('+ resp[0] + ',' + resp[1] + ')';
            newParagraph.innerHTML = resp;
            c.appendChild(newParagraph);
    	};
        var error = function(message) { alert("Oopsie! " + message); };
        cordova.exec(success, error, "GPS", "escrever", []);
    }   
}

module.exports = gps;
