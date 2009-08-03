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
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/spell/core.js
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/jquery.tipsy.js
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/jquery.facebox.js
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/button.class.js
// ==/UserScript==

//window.setTimeout("helloworld()", 60);

var settings = { 	stylesheetURL: "http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/style.css",
					baseURL: "http://access.ecs.soton.ac.uk/seb/StudyBar/",
					aboutBox: "<h2>About StudyBar</h2>Version 0.1.322a<br />Some information about StudyBar here." };
var originalPageSettings = { fontsize: "" };

var toolbarItems = {
		resizeUp: { id: 'resizeUp', ico: 'font_increase.png', act: 'resizeText(0.5);', tip: 'Increase text size' },
		resizeDown: { id: 'resizeDown', ico: 'font_decrease.png', act: 'resizeText(-0.5)', tip: 'Decrease text size' },
		spell: { id: 'spell', ico: 'spell.png', act: 'spellCheckPage()', tip: 'Activate spellchecker' },
		color: { id: 'color', ico: 'color_wheel.png', act: 'colorWheelMenu()', tip: 'Colour Options' },
		TTS: { id: 'tts', ico: 'sound.png', act: 'startTTS()', tip: 'Start Text to Speech' },
		CSS: { id: 'css', ico: 'palette.png', act: 'changeCSS()', tip: 'Change Styles' }
	};
var buttons = {};


window.loadStudyBar = function(){
	doc = document;
	head = document.getElementsByTagName('head')[0]; 
	
	// Attatch our new stylesheet.
	stylesheet = document.createElement("link");
	stylesheet.href = settings.stylesheetURL;
	stylesheet.rel = "stylesheet";
	stylesheet.type = "text/css";
	stylesheet.id = "sBarCSS";
	head.appendChild(stylesheet);
	
	
	// Create the div for StudyBar.
	bar = doc.createElement('div');
	// Insert it as the first node in the body node.
	doc.body.insertBefore(bar, doc.body.firstChild);
	
	// Set the ID of the toolbar.
	bar.id = "sbar";
	
	// Add logo to studybar.
	$("<a href=\"#\" id=\"sbarlogo\"><img src=\"" + settings.baseURL +  "presentation/images/logo.png\" align=\"left\" border=\"0\" style=\"margin-top:6px\" /></a>").appendTo('#sbar');
	
	// Add items to the toolbar.
	populateBar();
	
	// Save current page settings, so we can reset them later if we need to!
	originalPageSettings.fontsize = document.body.style.fontSize;
	
	// Set studybar to load next time we load a page.
	GM_setValue('autoload', true);

	jQuery('a[rel*=facebox]').facebox();
	
	$("#sbarlogo").bind("click", function(e){ jQuery.facebox( settings.aboutBox ); });
}


// Populate the bar with the different toolbar items defined in object at start.
window.populateBar = function(){
	for ( var i in toolbarItems ){
		var item = returnNewButton( toolbarItems[i].id, toolbarItems[i].ico, toolbarItems[i].act, toolbarItems[i].tip, '' );
	}
	
	returnNewButton( 'closeSBar', 'cross.png', 'unloadStudyBar()', 'Exit StudyBar', 'closeButton' );	
}

window.hoverButton = function(id){
	
}


// Functions called from within the bar below
window.randomColour = function(){
	document.getElementById('sbar').style.backgroundColor = '#'+Math.floor(Math.random()*16777215).toString(16);
}

window.colorWheelMenu = function(){
	randomColour();
}

window.resizeText = function(multiplier) {
  if (document.body.style.fontSize == "") {
    document.body.style.fontSize = "1.0em";
  }
  var newVal = parseFloat(document.body.style.fontSize) + (multiplier * 0.2) + "em";
  document.body.style.fontSize = newVal;
  $('div').css('font-size', newVal);
}

window.spellCheckPage = function(){
	console.log("spellchecker activated");
	$("textarea").spellcheck();
	$('input[type=text]').spellcheck();
}

window.unloadStudyBar = function(){
	
	// Closing studybar.
	window.setTimeout(GM_setValue, 0, "autoload", false);
	
	$('#sbar').remove();
	$('#sBarCSS').remove();
	$('.tipsy').remove();
	
	document.body.style.fontSize = originalPageSettings.fontsize;
}

window.saveSettings = function(){
	
	
}


// Register the greasemonkey menu items.
GM_registerMenuCommand("Local StudyBar", function(){ loadStudyBar() });


// If the user had studybar open, reopen it again.
var autoLoadValue = GM_getValue('autoload', false);

if( autoLoadValue == true ) {
	$(document).ready(function(){
		loadStudyBar();
	});
}