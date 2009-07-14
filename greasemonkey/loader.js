//alert("script loaded on " + document.domain);
//javascript:(function(){document.body.appendChild(document.createElement('script')).src='http://users.ecs.soton.ac.uk/scs/LSL/StudyBar/loader.js';})()

var stylesheetURL = "http://users.ecs.soton.ac.uk/scs/LSL/StudyBar/greasemonkey/presentation/style.css";

function loadStudyBar(){
	doc = document;
	head = document.getElementsByTagName('head')[0]; 
	
	// Attatch our new stylesheet.
	stylesheet = document.createElement("link");
	stylesheet.href = stylesheetURL;
	stylesheet.rel = "stylesheet";
	stylesheet.type = "text/css";
	head.appendChild(stylesheet);
	
	
	// OK, document is set up. Let's start building what we want to show.
	
	bar = doc.createElement('div');
	doc.body.insertBefore(bar, doc.body.firstChild);
	
	bar.id = "sbar";
	bar.innerHTML = '<a href="#" onclick="resizeText(4);">test</a>';
	
}


function changeColour(){
	document.getElementById('sbar').style.backgroundColor = '#'+Math.floor(Math.random()*16777215).toString(16);
}

function resizeText(multiplier) {
  if (document.body.style.fontSize == "") {
    document.body.style.fontSize = "1.0em";
  }
  document.body.style.fontSize = parseFloat(document.body.style.fontSize) + (multiplier * 0.2) + "em";
}
