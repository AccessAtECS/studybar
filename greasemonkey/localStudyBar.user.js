// StudyBar Greasemonkey script
// version 0.1 BETA!
// 2009-07-10
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "Hello World", and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          localStudyBar
// @namespace     http://users.ecs.soton.ac.uk/ss1706/
// @description   Accessibility toolbar
// @include       *
// @require       http://code.jquery.com/jquery-latest.js
// ==/UserScript==

//window.setTimeout("helloworld()", 60);

var settings = { stylesheetURL: "http://users.ecs.soton.ac.uk/scs/LSL/StudyBar/greasemonkey/presentation/style.css" };

window.loadStudyBar = function(){
	doc = document;
	head = document.getElementsByTagName('head')[0]; 
	
	// Attatch our new stylesheet.
	stylesheet = document.createElement("link");
	stylesheet.href = settings.stylesheetURL;
	stylesheet.rel = "stylesheet";
	stylesheet.type = "text/css";
	head.appendChild(stylesheet);
	
	
	// Create the div for StudyBar.
	bar = doc.createElement('div');
	// Insert it as the first node in the body node.
	doc.body.insertBefore(bar, doc.body.firstChild);
	
	// Set the ID and the content of the bar.
	bar.id = "sbar";
	bar.innerHTML = '<a href="#" id="resizeUp">Up</a> ~ <a href="#" id="resizeDown">Down</a>';
	doc.getElementById('resizeUp').addEventListener('click', function() {resizeText(1);} , false);
	doc.getElementById('resizeDown').addEventListener('click', function() {resizeText(-1);} , false);
	populateBar();
}


// Populate the bar with the different toolbar items.
window.populateBar = function(){
	alert('populating bar');
}

window.createButton = function(id, ico, act){
	
}


// Functions called from within the bar below
window.changeColour = function(){
	document.getElementById('sbar').style.backgroundColor = '#'+Math.floor(Math.random()*16777215).toString(16);
}


window.resizeText = function(multiplier) {
  if (document.body.style.fontSize == "") {
    document.body.style.fontSize = "1.0em";
  }
  var newVal = parseFloat(document.body.style.fontSize) + (multiplier * 0.2) + "em";
  document.body.style.fontSize = newVal;
  $('div').css('font-size', newVal);
}


// Register the greasemonkey menu items.
GM_registerMenuCommand("Local StudyBar", function(){ loadStudyBar() });