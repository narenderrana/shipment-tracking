CordovaGPS
==========

Cordova plugin for GPS Location using iOS CoreLocation services and Android GPS services 
Works without wi-fi and 3g. Only GPS hardware.


Contains a phonegap project on the folder /src/example/TestForGPS


gps.js
=======

Print GPS information on index.html > #container:


```javascript
var c = document.getElementById("container");
var newParagraph = document.createElement('p');
newParagraph.innerHTML = resp; //response from iOS-Android (latitude,longitude)
c.appendChild(newParagraph);
```

index.html
==========

```html
<div id="container"></div>
```

Contact 
=======

Vitor Venturin


vitorvl@yahoo.com.br


http://vitorventurin.com


VVLTDA 2014