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
// select "StudyBar", and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          StudyBar
// @namespace     http://users.ecs.soton.ac.uk/scs/
// @description   Accessibility toolbar
// @include       *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/spell/core.js
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/jquery.tipsy.js
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/jquery.facebox.js
// @require       http://access.ecs.soton.ac.uk/seb/StudyBar/button.class.js
// ==/UserScript==

var versionString = "0.4.102 pre-beta";

var includeScripts = [];

var disabledSites;

var originalPageSettings = { fontsize: "" };

var settings = {
				stylesheetURL: "presentation/style.css",
				baseURL: "http://access.ecs.soton.ac.uk/seb/StudyBar/",
				aboutBox: "<h2>About StudyBar</h2>Version " + versionString + "<br /><br />Created by Sebastian Skuse under supervision of Mike Wald<br />Learning Societies Lab<br /> &copy; University of Southampton 2009.<br />Icons &copy; {{PLACEHOLDER}} under CC licence.",
				textSizeLevel: 1,
				ttsSplitChunkSize: 700
				};


var toolbarItems = {
		resizeUp: { id: 'resizeUp', ico: 'font_increase.png', act: 'resizeText(0.5);', tip: 'Increase text size', clickEnabled: true },
		resizeDown: { id: 'resizeDown', ico: 'font_decrease.png', act: 'resizeText(-0.5)', tip: 'Decrease text size', clickEnabled: true },
		fontSettings: { id: 'fontSettings', ico: 'font.png', act: 'fontSettingsDialog()', tip: 'Font settings', clickEnabled: true,
				dialogs: {
					main: "<h2>Page font settings</h2><label for=\"sbfontface\">Font Face:</label> <select id=\"sbfontface\"><option value=\"sitespecific\">--Site Specific--</option><option value=\"arial\">Arial</option><option value=\"courier\">Courier</option><option value=\"cursive\">Cursive</option><option value=\"fantasy\">Fantasy</option><option value=\"georgia\">Georgia</option><option value=\"helvetica\">Helvetica</option><option value=\"impact\">Impact</option><option value=\"monaco\">Monaco</option><option value=\"monospace\">Monospace</option><option value=\"sans-serif\">Sans-Serif</option><option value=\"tahoma\">Tahoma</option><option value=\"times new roman\">Times New Roman</option><option value=\"trebuchet ms\">Trebuchet MS</option><option value=\"verdant\">Verdana</option></select><br /><br /> <label for=\"sblinespacing\">Line Spacing:</label> <input type=\"text\" name=\"sblinespacing\" id=\"sblinespacing\" maxlength=\"3\" size=\"3\" value=\"100\">%<br /><br /><div class=\"sbarDialogButton\"><a id=\"sbfontfaceapply\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Apply</a></div>"
				}
		},
		spell: { id: 'spell', ico: 'spell-off.png', act: 'spellCheckPage()', tip: 'Start / Stop spellchecker', clickEnabled: true, checkerEnabled: false },
		TTS: { id: 'tts', ico: 'sound.png', act: 'ttsOptions()', tip: 'Text to Speech options', clickEnabled: true,
				dialogs: {
					options: "<h2>Text to Speech options</h2> <div class=\"sbarDialogButton\"> <a id=\"sbStartTTS\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Get Text-To-Speech for this page</a></div>",
					starting: "<h2>Text To Speech</h2> <center>Text to Speech conversion is taking place. <br /><img src='http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/loadingbig.gif' /><br />Time remaining: <div id='sbttstimeremaining'>calculating</div><br />Please wait... <center>"
				}
		},
		references: { id: 'references', ico: 'book_link.png', act: 'referencesDialog()', tip: 'References', clickEnabled: true,
				dialogs: {
					landingDialog: "<h2>References</h2> <p>You can use this function to find information on this page to make a reference.<br /><br />What type of material are you referencing?</p><select id=\"sbReferenceType\"> </select><br /><br /> <div class=\"sbarDialogButton\"><a id=\"sbScanReferences\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Scan Page</a></div>",
					results: "<h2>Reference Scan Results</h2><p>Below are the results that we've found on this page.</p><br /> <table border=\"0\"><tr><td><b>Author:</b></td><td>{{author}}</td></tr><tr><td><b>Date:</b></td><td>{{date}}</td></tr><tr><td><b>Page Title:</b></td><td>{{ptitle}}</td></tr><tr><td><b>Name of Website:</b></td><td>{{wsname}}</td></tr><tr><td><b>Name of Webpage:</b></td><td>{{wpname}}</td></tr><tr><td><b>Accessed:</b></td><td>{{accessed}}</td></tr><tr><td><b>URL:</b></td><td>{{url}}</td></tr></table>"
				}
		},
		dictionary: { id: 'dictionary', ico: 'book_open.png', act: 'getDictionaryRef()', tip: 'Dictionary', clickEnabled: true },
		CSS: { id: 'changecss', ico: 'palette.png', act: 'changeColours(0)', tip: 'Change Styles', clickEnabled: true, 
				dialogs: { 
					colourDialog: "<h2>Change Colour settings</h2> <div class=\"sbarDialogButton\"> <a id=\"sbColourChange\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Change StudyBar Colour</a></div> <div class=\"sbarDialogButton\"><a id=\"sbChangeSiteColours\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Change Site Colours</a></div> <div class=\"sbarDialogButton\"><a id=\"sbAttachCSSStyle\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Premade page styles</a></div>",
					sbColourDialog: "<h2>Change StudyBar Colour</h2> <label for=\"sbbackgroundcolour\">Background Colour: </label><input type=\"text\" name=\"sbbackgroundcolour\" id=\"sbbackgroundcolour\"> <a id=\"sbSetColour\"><img src=\"" + settings.baseURL + "/presentation/images/accept.png \" /> Set</a> <br /> <a onclick=\"document.getElementById('sbbackgroundcolour').value = 'black';\">Black</a> <a onclick=\"document.getElementById('sbbackgroundcolour').value = 'white';\">White</a> <a onclick=\"document.getElementById('sbbackgroundcolour').value = 'grey';\">Grey</a> <br /> <div class=\"sbarDialogButton\"><a id=\"sbRandomColour\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Random</a></div> <div class=\"sbarDialogButton\"> <a id=\"sbColourReset\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Reset to Default</a></div>",
					sbSiteColours: "<h2>Change this site's colours</h2> <label for=\"sbbackgroundcolour\" style=\"display:block\">Background Colour: </label><input type=\"text\" name=\"sbpagebackgroundcolour\" id=\"sbpagebackgroundcolour\"><br /> <label for=\"sbtextcolour\" style=\"display:block\">Text Colour: </label><input type=\"text\" name=\"sbtextcolour\" id=\"sbtextcolour\"><br /><label for=\"sblinkcolour\" style=\"display:block\">Link Colour: </label><input type=\"text\" name=\"sblinkcolour\" id=\"sblinkcolour\"> <div class=\"sbarDialogButton\"><a id=\"applyPageColours\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Apply</a></div>",
					sbAttachCSS: "<h2>Premade page styles<h2><div class=\"sbarDialogButton\"><a id=\"sbApplyCSS-wb\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Black on White</a></div> <div class=\"sbarDialogButton\"><a id=\"sbApplyCSS-wbw\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> White on Black</a></div> <div class=\"sbarDialogButton\"><a id=\"sbApplyCSS-yb\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Yellow on Black</a></div>"
				} 
		},
		settings: { id: 'settings', ico: 'cog.png', act: 'settingsDialog(0)', tip: 'Settings', styleClass: ' fright', clickEnabled: true,
		 		dialogs: {
					landingDialog: "<h2>StudyBar Settings</h2> <div class=\"sbarDialogButton\"> <a id=\"sbResetDisabled\"><img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Reset Disabled websites</a></div> <div class=\"sbarDialogButton\"> <a href=\"#\" id=\"sbresetAll\"><img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Reset Everything to defaults</a></div>"
				}
		},
		help : { id: 'help', ico: 'information.png', act: 'studybarHelp()', tip: 'Help', styleClass: ' fright', clickEnabled: true,
				dialogs: {
					landingPage: "<h2>StudyBar Help</h2> <h3>Topics</h3>"
				}
		}
	};
	
var closeDialogs = { landing: "<h2>Studybar is about to exit</h2> <div class=\"sbarDialogButton\"><a id=\"sbCloseThisSite\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Close for this site only</a></div> <div class=\"sbarDialogButton\"><a href=\"#\" id=\"sbCloseAllSites\"> <img src=\"http://access.ecs.soton.ac.uk/seb/StudyBar/presentation/images/dialog/arrow.png\" /> Close for all sites</a></div>" };	
	
var buttons = {};

var XHRMethod;

var head = document.getElementsByTagName('head')[0];

// <Name> loadStudyBar
// <Purpose> Main constructor. Injects the studybar HTML into the DOM of the current page and sets up variables that may be required.
// <ToDo> Nothing.

window.loadStudyBar = function(){
	doc = document;
	head = document.getElementsByTagName('head')[0]; 
	
	// Set the method of XHR that we're going to use.
	setXHRMethod();
	
	// Attatch our new stylesheet.
	attachCSS(settings.baseURL + settings.stylesheetURL, "sBarCSS");
	
	// Create the div for StudyBar.
	bar = doc.createElement('div');
	// Set the ID of the toolbar.
	bar.id = "sbar";
	
	// Insert it as the first node in the body node.
	doc.body.insertBefore(bar, doc.body.firstChild);
	
	// Add logo to studybar.
	$("<a id=\"sbarlogo\"><img src=\"" + settings.baseURL +  "presentation/images/logo.png\" align=\"left\" border=\"0\" style=\"margin-top:6px; float:left !important;\" /></a>").appendTo('#sbar');
	
	// Add items to the toolbar.
	populateBar();
	
	// Save current page settings, so we can reset them later if we need to!
	originalPageSettings.fontsize = document.body.style.fontSize;
	
	if( (typeof GM_setValue) == 'undefined' ) {
	
	} else {
		// Set studybar to load next time we load a page.
		GM_setValue('autoload', true);
		
		if(identifyBrowser() != 'Opera' && identifyBrowser() != 'IE') {		
			if(disabledSites.length > 0){
				for (var i=0; i<disabledSites.length; i++ ){
					if(disabledSites[i] == window.location.hostname) delete disabledSites[i];
				}
			}
		}
	}
	$("#sbarlogo").bind("click", function(e){ jQuery.facebox( settings.aboutBox ); });
}


// <Name> populateBar
// <Purpose> Populate the bar with the different toolbar items defined in object at start.
// <ToDo> Nothing.

window.populateBar = function(){
	// Check to see if tipsy has loaded yet.
	if( (typeof jQuery.fn.tipsy) == 'function'){
		for ( var i in toolbarItems ){
			var item = returnNewButton( toolbarItems[i].id, toolbarItems[i].ico, toolbarItems[i].act, toolbarItems[i].tip, toolbarItems[i].styleClass, settings.baseURL );
		}
		returnNewButton( 'closeSBar', 'cross.png', 'unloadOptions()', 'Exit StudyBar', 'closeButton', settings.baseURL );	
	} else {
		setTimeout('populateBar()', 100);
	}
}


window.attachJS = function(url, id){
	javascriptFile = document.createElement("script");
	javascriptFile.src = url;
	javascriptFile.type = "text/javascript";
	javascriptFile.id = id;
	head.appendChild(javascriptFile);	
}

/////////////////////////////////////////////////
// Functions called from within the bar below  //
/////////////////////////////////////////////////

window.attachCSS = function(url, id){
	stylesheet = document.createElement("link");
	stylesheet.href = url;
	stylesheet.rel = "stylesheet";
	stylesheet.type = "text/css";
	stylesheet.id = id;
	head.appendChild(stylesheet);	
	
	$('#facebox').remove();
}

window.CSStoInline = function(selector){
	var elObject = $(selector).css();
	var outString = "";
	
	for(var property in elObject){
		outString += property +": " + elObject[property] + " !important; ";
	}
	
	outString = outString.replace(/; $/, '');
	$("#sbar").attr('style', outString);
}

// <Name> resizeText
// <Purpose> Size the text on the page up/down.
// <ToDo> very buggy. Resizes studybar text, which we dont want.

window.resizeText = function(multiplier) {

  if (document.body.style.fontSize == "") {
    //document.body.style.fontSize = "10px";
  }
  
  //alert($('body').css('fontSize'));
  
  //var newVal = parseFloat(settings.textSizeLevel) + (multiplier * 0.2) + "em";
  // document.body.style.fontSize = newVal;

//alert("level: " + settings.textSizeLevel);
  
  if(settings.textSizeLevel == 1 && multiplier < 0) {
  	currentLevel = 1;
  } else {
  	currentLevel = 1 + (settings.textSizeLevel * 0.2);
  }

  
  if(multiplier > 0){
  	var newVal = parseFloat( currentLevel ) + 0.2 + "em";
  	settings.textSizeLevel += 1;
  } else {
  	var newVal = parseFloat( currentLevel ) - 0.2 + "em";
  	settings.textSizeLevel -= 1;
  }
  
  if(settings.textSizeLevel == 1){
	//$('div').css('font-size', '');
	//$('p').css('font-size', '');  
	//$('table').css('font-size', ''); 
	document.body.style.fontSize = ''; 
  } else {  
	//$('div').css('font-size', newVal);
	//$('p').css('font-size', newVal);
	//$('table').css('font-size', newVal);
	document.body.style.fontSize = newVal;
  }
}


// <Name> startTTS
// <Purpose> Invoke the Text To Speech engine.

window.startTTS = function(){

	var $sendData = $(document.body).clone();
	
	$sendData.children('#sbar').remove();
	$sendData.children('#facebox').remove();
	$sendData.children('script').remove();
	$sendData.children('style').remove();
	$sendData.children('facebox_overlay').remove();

	// What method of XHR are we using for this?
	if(XHRMethod == 'GM-XHR'){
		jQuery.facebox.changeFaceboxContent( toolbarItems.TTS.dialogs.starting );
		
		GM_xmlhttpRequest({ method: "POST",
				url: "http://access.ecs.soton.ac.uk/seb/StudyBar/TTS/jobController.php", 
				onload: ttsJobSent,
				headers:{'Content-type':'application/x-www-form-urlencoded'},
    			data:"page=" + encodeURIComponent(window.location) + "&data=" + encodeURI( b64($sendData.html()) )
			});
	} else {
		// Another browser. We'll use the custom xmlhttprequest method.

		// Send the data in chunks, as chances are we cant get it all into one request.
		
		var transmitData = b64($sendData.html());
		
		var chunks = Math.ceil(transmitData.length / settings.ttsSplitChunkSize);
		
		var reqID = Math.floor(Math.random() * 5001);
		
		jQuery.facebox.changeFaceboxContent( "<h2>Processing</h2><p>Compacting and transmitting data...<br /><div id='compactStatus'>0 / " + chunks + "</div></p>" );
		
		sendTTSChunk(transmitData, 1, chunks, reqID);
		
	}

}

window.sendTTSChunk = function(fullData, block, totalBlocks, reqID){

	if(block == 1){
		var start = 0;
	} else {
		var start = (settings.ttsSplitChunkSize * block);
	}
	
	if( (start + settings.ttsSplitChunkSize) > fullData.length ){
		var endPoint = fullData.length;
	} else {
		var endPoint = (start + settings.ttsSplitChunkSize);
	}
	
	var dataChunk = fullData.substring(start, endPoint );

	if( block == totalBlocks ){
		var urlString = settings.baseURL + 'xmlhttp/remote.php?rt=tts&id=' + reqID + '&data=' + dataChunk + "&chunkData=" + totalBlocks + "-" + block + "&page=" + encodeURIComponent(window.location);
	} else {
		var urlString = settings.baseURL + 'xmlhttp/remote.php?rt=tts&id=' + reqID + '&data=' + dataChunk + "&chunkData=" + totalBlocks + "-" + block;
	}

	window.attachJS( urlString, 'CS-XHR' );

	this.ttsAjaxInterval = setInterval(function(){
		self.checkCSXHRTTSResponse(fullData, block, totalBlocks, reqID);
	}, 100);	

}

window.checkCSXHRTTSResponse = function(fullData, block, totalBlocks, reqID){
	// Do we have data yet? If so, lets clear the interval and parse the results!
	if( (typeof CSresponseObject) != "undefined" ){
		clearInterval( this.ttsAjaxInterval );
		
		// Copy the response object to a local object.
		var RO = CSresponseObject;
		
		// Remove the response JS.
		$('#CS-XHR').remove();

		$("#compactStatus").html(block + " / " + totalBlocks);

		if(block == totalBlocks){
			// Finished request..
			jQuery.facebox.changeFaceboxContent( toolbarItems.TTS.dialogs.starting );
			
			window.ttsJobSent( RO );
		} else {
			// Send the next block.
			if(RO.data.message == "ChunkSaved"){
				sendTTSChunk(fullData, (block + 1), totalBlocks, reqID);
			} else {
				jQuery.facebox.changeFaceboxContent("<h2>Error</h2><p>An error occurred on the server. Please try again later.</p>");
			}
		}

	}	
}

window.ttsJobSent = function(response){
	
	if(XHRMethod == "GM-XHR"){
		var ro = eval("(" + response.responseText + ")");
	} else {
		var ro = response;
	}
	
	if(ro.status == "encoding" && ro.status != "failure"){
		if(identifyBrowser() == "FF"){
			window.setTimeout(countdownTTS, 0, (ro.est_completion / ro.chunks), ro.ID );
		} else {
			setTimeout(function(){
				window.countdownTTSCB( (ro.est_completion / ro.chunks), ro.ID );
			}, 0);
		}
	} else if(ro.status == "failure" && ro.reason == "overcapacity"){
		jQuery.facebox("<h2>Error</h2> <p>The server is currently over capacity for text to speech conversions. Please try again later.</p>");
	}
	
}

window.countdownTTS = function(){
	if(arguments[0] == 0){
		window.setTimeout(playTTS, 0, arguments[1]);
	} else {
		$('#sbttstimeremaining').html( arguments[0] + " seconds" );
		window.setTimeout(countdownTTS, 1000, (arguments[0] - 1), arguments[1]);
	}
}

window.countdownTTSCB = function(tLeft, id){
	if(tLeft == 0){
		setTimeout(function(){ playTTSCB(id) }, 0);
	} else {
		$('#sbttstimeremaining').html( tLeft + " seconds" );
		setTimeout(function(){ countdownTTSCB( (tLeft - 1), id ) }, 1000);
	}
}

window.playTTSCB = function(id){
	embedPlayer(id);
}

window.playTTS = function(){
	embedPlayer(arguments[0]);
}

window.embedPlayer = function(id){
	$('#sbar').append( $("<OBJECT width=\"200\" height=\"300\"> <PARAM name=\"movie\" value=\"" + settings.baseURL + "TTS/player/player-licensed.swf\"></PARAM> <PARAM name=\"FlashVars\" value=\"file=" + settings.baseURL + "TTS/cache/" + id + ".xml&autostart=true&playlist=bottom&repeat=list\"><EMBED src=\"" + settings.baseURL + "TTS/player/player-licensed.swf\" type=\"application/x-shockwave-flash\" allowscriptaccess=\"always\" allowfullscreen=\"false\" flashvars=\"file=" + settings.baseURL + "TTS/cache/" + id + ".xml&autostart=true&playlist=bottom&repeat=list\" width=\"200\" height=\"300\"> </EMBED> </OBJECT>") );
	$(document).trigger('close.facebox');
}

// <Name> spellCheckPage
// <Purpose> Invoke the modified jQuery spellchecking engine that we're using. Hook onto all textarea and text fields.
// <ToDo> Does not work first invoke for some reason. Possibly to do with xmlhttprequest change for GM?

window.spellCheckPage = function(){
	//if(toolbarItems.spell.checkerEnabled == false){
	
		$("textarea").spellcheck({ useXHRMethod: XHRMethod });
		$('input[type=text]').spellcheck({ useXHRMethod: XHRMethod });
		
		$('#sb-btnico-spell').attr('src', settings.baseURL + "presentation/images/spell.png");
		toolbarItems.spell.checkerEnabled = true;
	/*} else {
		alert('removing spellcheck');
		
		$('textarea').unbind('keypress blur paste');
		$('textarea').removeData('spellchecker');
		
		$('input[type=text]').unbind('keypress blur paste');
		$('input[type=text]').removeData('spellchecker');		
		
		$('#sb-btnico-spell').attr('src', settings.baseURL + "presentation/images/spell-off.png");
		toolbarItems.spell.checkerEnabled = false;
	}*/
}


// <Name> changeColours
// <Purpose> Controls the faceBox menus invoked by the change styles button in the main bar. Levels are sequential, i.e. 1, 11, 12, 121, 2, 21, 22
// <ToDo> Nothing.

window.changeColours = function(level){
	// Remember to set up any child buttons when loading a dialog, you MUST set onclicks programatically here!
	if(level == 0){
		jQuery.facebox( toolbarItems.CSS.dialogs.colourDialog );
		
		mbEventListener('sbColourChange', "click", function(e){ changeColours(1); } );
		mbEventListener('sbChangeSiteColours', "click", function(e){ changeColours(2); } );
		mbEventListener('sbAttachCSSStyle', "click", function(e){ changeColours(3) } );
	}
	if(level == 1){
		jQuery.facebox.changeFaceboxContent( toolbarItems.CSS.dialogs.sbColourDialog );
		mbEventListener('sbRandomColour', "click", function(e){ setColour("rand"); });
		mbEventListener('sbSetColour', "click", function(e){ setColour( $("#sbbackgroundcolour").val() ); });
		mbEventListener('sbColourReset', "click", function(e){ setColour("white"); });
	}
	if(level == 2){
		// Site colours
		jQuery.facebox.changeFaceboxContent( toolbarItems.CSS.dialogs.sbSiteColours );
		mbEventListener('applyPageColours', "click", function(e){ 
			if( $('#sbpagebackgroundcolour').val() != "undefined"){
				document.body.style.backgroundColor = $('#sbpagebackgroundcolour').val();
			}
			
			if( $('#sbtextcolour').val() != "undefined" ){
				$('body').css('color', $('#sbtextcolour').val());
			}
			
			if( $('#sblinkcolour').val() != "undefined" ){
				$('a').css('color', $('#sblinkcolour').val());
			}
		});
		
	}
	if(level == 3){
		jQuery.facebox.changeFaceboxContent( toolbarItems.CSS.dialogs.sbAttachCSS );
		mbEventListener('sbApplyCSS-yb', "click", function(e){ 
			attachCSS(settings.baseURL + "presentation/stylesheets/highvis-yo.css", "highvis-yo");
			CSStoInline("#sbar");
		});
		
		mbEventListener('sbApplyCSS-wb', "click", function(e){ 
			attachCSS(settings.baseURL + "presentation/stylesheets/highvis-wb.css", "highvis-wb");
			CSStoInline("#sbar");
		});
		
		mbEventListener('sbApplyCSS-wbw', "click", function(e){
			attachCSS(settings.baseURL + "presentation/stylesheets/highvis-bw.css", "highvis-wbw");
			CSStoInline("#sbar");
		});
	}
}


window.getDictionaryRef = function(){
	var data = eval("\"" + getSelectedText() + "\";");

	if(data != ""){
		$("#sb-btnico-dictionary").attr('src', settings.baseURL + "presentation/images/loading.gif");
		
		// Firefox greasemonkey cross domain XMLHTTP.
		if(XHRMethod == 'GM-XHR'){
		
		window.setTimeout(function(){
			GM_xmlhttpRequest({ method: "GET",
				url: "http://en.wiktionary.org/w/api.php?action=query&titles=" + encodeURI(data.toLowerCase()) + "&prop=revisions&rvlimit=1&rvprop=content&format=json", 
				onload: getDictionaryResponse
			});
		}, 0)
		
		} else if(XHRMethod == 'CS-XHR'){

			window.attachJS( settings.baseURL + 'xmlhttp/remote.php?rt=dict&id=' + Math.floor(Math.random() * 5001) + '&action=query&titles=' + encodeURI(data.toLowerCase()) + '&prop=revisions&rvlimit=1&rvprop=content&format=json', 'CS-XHR' );
						
			//alert("XS-XHR/GM-XHR not supported. Switching to " + XHRMethod);
			this.dictAjaxInterval = setInterval(function(){
				self.checkCSXHRDictResponse();
			}, 100);
			
		}
	} else {
		jQuery.facebox("<h2>Dictionary</h2><p>To use the dictionary select a word on the page and click the dictionary button.</p>");
		$("#sb-btnico-dictionary").attr('src', settings.baseURL + "presentation/images/" + toolbarItems.dictionary.ico);
	}
}


window.checkCSXHRDictResponse = function(){
	// Do we have data yet? If so, lets clear the interval and parse the results!
	if( (typeof CSresponseObject) != "undefined" ){
		clearInterval( this.dictAjaxInterval );
		
		// Copy the response object to a local object.
		var RO = CSresponseObject;
		
		// Remove the response JS.
		$('#CS-XHR').remove();

		window.getDictionaryResponse( RO.data );
	}		
}

window.getDictionaryResponse = function(response){

	if(XHRMethod == "GM-XHR"){
		var ro = eval("(" + response.responseText + ")");
	} else {
		var ro = eval("(" + response + ")");
	}
	
	for(var result in ro.query.pages){
		if(result > -1){
			var definition = eval("ro.query.pages[\"" + result + "\"].revisions[0][\"*\"];");
			var title = eval("ro.query.pages[\"" + result + "\"].title;");
			// Format the wikicode into something we can read in HTML.
			//console.log(definition);
			
			// Replace headings.
			definition = parseDictionaryResponse(definition);
		} else {
			var definition = "Unknown word";
			var title = eval("ro.query.pages[\"-1\"].title;");
		}
	}
	
	jQuery.facebox("<h2>Dictionary Definition for \"" + title + "\"</h2><div class=\"constrainContent\">" + definition + "</div>");
	$("#sb-btnico-dictionary").attr('src', settings.baseURL + "presentation/images/" + toolbarItems.dictionary.ico);
}


window.parseDictionaryResponse = function(input){
	
	// Remove translations blocks.
	output = input.replace(/^((?:={2,})+translations(?:={2,})+.*?)((?:={2,}).*?(?:={2,})|(?:-{4}))/ig, '$2');	
	
	// Replace headings.
	var output = output.replace(/(={2,})+(.*?)(?:={2,})+/ig, function(match, g1, g2, position, input) {
    	return "<h" + g1.length + ">" + g2 + "</h" + g1.length + ">";
    });
    
    // Remove comments
    var output = output.replace(/(<!--.*?-->)/ig, '');
	
	// Replace bold / italics.
	output = output.replace(/(('+){1}(.*?)(?:'+){1})/ig, function(match, g1, g2, g3, position, input){
		switch(g2.length){
		
			case 2:
				return "<em>" + g3 + "</em>";
			break;
			
			case 3:
				return "<b>" + g3 + "</b>";
			break;
			
			case 5:
				return "<em><b>" + g3 + "</b></em>";
			break;
		}
	
	});
	
	// Replace text in curley brackets.
	output = output.replace(/(\{\{(?:(.*?)\|)+(.*?)\}\})/ig, function(match, g1, g2, g3, position, input){
		switch(g2.toLowerCase()){
			case 'also':
				return "See also: " + g3;
			break;
			
			case 'ipa':
				return g3;
			break;
			
			case 'audio':
				return "";
			break;
			
			default:
				return g3;	
			break;
		}
	});
	
	// Replace lists.
	output = output.replace(/([#|\*]+(.*?)\n)/ig, '<li>$2</li>');
	
	// Replace unmatched doublebraces.
	output = output.replace(/(\{\{(\w{1,})\}\})/ig, "<i>$2</i>");
	
	output = output.replace(/(\[\[(.*?)\]\])/ig, "$2");
	
	return output;
}

window.getSelectedText = function(){
    var text = '';
     if (window.getSelection){
        text = window.getSelection();
     } else if (document.getSelection){
        text = document.getSelection();
     } else if (document.selection){
        text = document.selection.createRange().text;
     }
	return String(text).replace(/([\s]+)/ig, '');
}

// <Name> setColour
// <Purpose> Sets the colour of studybar, either a random colour, or one specified by the user.
// <ToDo> Nothing.

window.setColour = function(code){
	if(code == "rand"){
		colour = '#'+Math.floor(Math.random()*16777215).toString(16);
		$("#sbbackgroundcolour").val(colour);
	} else {
		colour = code;
	}
	$('#sbar').css('background-color', colour);
	
	//document.getElementById('sbar').style.backgroundColor = colour;
}

// <Name> ttsOptions
// <Purpose> Load the TTS options dialog.

window.ttsOptions = function(){
	jQuery.facebox( toolbarItems.TTS.dialogs.options );
	mbEventListener('sbStartTTS', 'click', function(e){ startTTS() } );
}


window.fontSettingsDialog = function(){
	jQuery.facebox( toolbarItems.fontSettings.dialogs.main );
	mbEventListener('sbfontfaceapply', 'click', function(e){
		if($('#sbfontface').val() != "--Site Specific--") $('body').css('font-family', $('#sbfontface').val());
		$('div').css('line-height', $('#sblinespacing').val() + "%");
		$('#sbar').css('line-height', '0%');
		//$('#sbar').nextAll()
	});
	//sbfontfaceapply
}


window.referencesDialog = function(){
	var htmlData = toolbarItems.references.dialogs.landingDialog;
	var url = String(window.location);
	
	var options = "<option>Webpage</option>";
	
	if( url.match("wiki") != null ) alert("Warning: This source may not be suitable for academic writing.");

	
	if( url.match("news") != null){
		// This may be a news site.
		options += "<option selected=\"selected\">News Article</option>";	
	} else {
		options += "<option>News Article</option>";
	}
	
	htmlData = htmlData.replace(/(<select id=\"sbReferenceType\">)(\s)(<\/select>)/ig, "$1" + options + "$3");
	
	jQuery.facebox( htmlData );

	mbEventListener('sbScanReferences', 'click', function(e){ scanForReferenceMaterial( $('#sbReferenceType').val() ); } );

}

window.scanForReferenceMaterial = function(type){

	var emptySelect = "<select id=\"{{id}}\">{{data}}</select>";
	var outputHTML = toolbarItems.references.dialogs.results;
	var bodyString = $('body').html();

	// Author
	
		// Individual? 
		//By[ :]?([a-zA-Z]{3,}(?:[\s]?[a-zA-Z]{3,}))[.*?]?
		var authMatch = bodyString.match(/By[:]?[\s]{1,}(?:([a-zA-Z]{3,}(?:[\s]?[a-zA-Z]{3,}))|(?:(?:<.*?>)([a-zA-Z]{3,}(?:[\s]?[a-zA-Z]{3,}))(?:<.*?>)))/ig);
		
		if(authMatch == null) {
			// Corporate author, maybe?
			outputHTML = outputHTML.replace('{{author}}', "");
		} else {
			
			var uniqueMatches = authMatch.unique();
			
			if(authMatch.length == 1){
				outputHTML = outputHTML.replace('{{author}}', uniqueMatches.replace(/(By[:]?[\s]{1,})/ig, ''));
			} else {
				// Multiple matches found.
				
				var matchOptions = "";
				
				for(i = 0; i < uniqueMatches.length; i++){
					var thisMatch = uniqueMatches[i];
					matchOptions += "<option>" + thisMatch.replace(/(By[:]?[\s]{1,})/ig, '') + "</option>";
				}
				
				var authorSelect = emptySelect.replace("{{data}}", matchOptions);
				authorSelect = authorSelect.replace("{{id}}", "sbAuthorSelect");
				
				authorSelect += " <a id=\"sbAuthorSelectAccept\"><img src=\"" + settings.baseURL + "/presentation/images/accept.png\" /></a>"
				
				outputHTML = outputHTML.replace('{{author}}', authorSelect);
			}
		}
	
	// Page Title

		


	// Name of webpage
	
	// Name of website
	
	
	
	outputHTML = outputHTML.replace( "{{url}}", window.location );
	outputHTML = outputHTML.replace( "{{accessed}}", Date() );
	
	jQuery.facebox.changeFaceboxContent( outputHTML );
	
	
	
	// Run select box listener attachments.
	if(uniqueMatches != null) {
		if(uniqueMatches.length > 1){
			$('#sbAuthorSelect').bind('change', function(e){
				$('#sbAuthorSelect').replaceWith( $('#sbAuthorSelect').val() );
				$('#sbAuthorSelectAccept').remove();
			});
			
			$('#sbAuthorSelectAccept').bind('click', function(e){
				$('#sbAuthorSelect').replaceWith( $('#sbAuthorSelect').val() );
				$('#sbAuthorSelectAccept').remove();
			});
		}
	}

}

// <Name> settingsDialog
// <Purpose> Load the settings dialog.

window.settingsDialog = function(level){
	if(level == 0){
		jQuery.facebox( toolbarItems.settings.dialogs.landingDialog );
	}
}

// Dialog for closing the bar.
window.unloadOptions = function(){
	jQuery.facebox(closeDialogs.landing);
	mbEventListener('sbCloseAllSites', 'click', function(e){ unloadStudyBar(true) } );
	mbEventListener('sbCloseThisSite', 'click', function(e){ unloadThisSite() } );
}

// <Name> unloadThisSite
// <Purpose> Unload StudyBar for this website.

window.unloadThisSite = function(){
	// Add this site to the array.
	disabledSites[disabledSites.length] = window.location.hostname;
	
	unloadStudyBar(false);
}

// <Name> unloadStudyBar
// <Purpose> Unloads studybar, resets page back to normal and sets studybar not to load next time.
// <ToDo> Save settings to central server? local?

window.unloadStudyBar = function(all){	
	// Closing studybar.
	if( (typeof GM_setValue) == 'undefined' || identifyBrowser() == "Opera" ){
		// No greasemonkey.
		
		// Remove the injected javascript files.
		$('#sb-spell').remove();
		$('sb-tipsy').remove();
		$('sb-facebox').remove();
		$('sb-buttons').remove();
		$('sb-gmcompat').remove();
		
		//Remove last
		$('#sb-jquery').remove();
	} else {
		window.setTimeout(GM_setValue, 0, "blocked", disabledSites);
		if(all == true) window.setTimeout(GM_setValue, 0, "autoload", false);
		console.log(disabledSites);
	}
	
	// Remove the divs for StudyBar from the page.
	$('#facebox').remove();
	$('#sbar').remove();
	$('#sBarCSS').remove();
	$('.tipsy').remove();
	
	document.body.style.fontSize = originalPageSettings.fontsize;
}

window.studybarHelp = function(){
	jQuery.facebox( toolbarItems.help.dialogs.landingPage );

}


// <Name> createIEaddEventListeners
// <Purpose> Wrap addEventListeners to attachEvent for IE.

window.createIEaddEventListeners = function(){
    if (document.addEventListener || !document.attachEvent) return;

    function ieAddEventListener(eventName, handler, capture){
        if (this.attachEvent) this.attachEvent('on' + eventName, handler);
    }

    function attachToAll(){
        var i, l = document.all.length;

        for (i = 0; i < l; i++)
            if (document.all[i].attachEvent)
                document.all[i].addEventListener = ieAddEventListener;
    }

    var originalCreateElement = document.createElement;

    document.createElement = function(tagName){
        var element = originalCreateElement(tagName);
        
        if (element.attachEvent)
            element.addEventListener = ieAddEventListener;

        return element;
    }
    
    window.addEventListener = ieAddEventListener;
    document.addEventListener = ieAddEventListener;

    var body = document.body;
    
    if (body){
        if (body.onload){
            var originalBodyOnload = body.onload;

            body.onload = function(){
                attachToAll();
                originalBodyOnload();
            };
        } else {
            body.onload = attachToAll;
        }
    } else {
        window.addEventListener('load', attachToAll);
    }
}
	
Array.prototype.unique = function () {
	var r = new Array();
	o:for(var i = 0, n = this.length; i < n; i++){
		for(var x = 0, y = r.length; x < y; x++){
			if(r[x]==this[i]) continue o;
		}
		r[r.length] = this[i];
	}
	return r;
}

window.b64 = function(input) {
	// + == _
	// / == -
	var bkeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-=";
	var output = "";
	var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	var i = 0;

	input = utf8_encode(input);

	while (i < input.length) {

		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output +
		bkeys.charAt(enc1) + bkeys.charAt(enc2) +
		bkeys.charAt(enc3) + bkeys.charAt(enc4);

	}

	return output;
}


window.utf8_encode = function(string) {
	string = string.replace(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < string.length; n++) {

		var c = string.charCodeAt(n);

		if (c < 128) {
			utftext += String.fromCharCode(c);
		}
		else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		}
		else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}

	}

	return utftext;
}



// <Name> mbEventListener
// <Purpose> Multiple Browser event listener handler. Handles differences between IE & all other browsers in how they attach events to objects.

window.mbEventListener = function(target, event, fnc){
	 if (identifyBrowser() != "IE"){
	 	// FFX / Opera / Chrome
	 	document.getElementById(target).addEventListener(event, fnc, true);
	 } else {
	 	// IE
	 	document.getElementById(target).attachEvent('on' + event, fnc);
	 }
}

// <Name> identifyBrowser
// <Purpose> Identify the user's current browser, so we can modify how StudyBar behaves in other areas of the script

window.identifyBrowser = function(){
	if(navigator.appName == 'Microsoft Internet Explorer'){
		return "IE";
	} else {
		if (/Firefox/.test(navigator.userAgent)){
		 	return "FF";
		} else {
			return navigator.appName;
		}	
	}	
}

// <Name> setXHRMethod
// <Purpose> Set a global for the XmlHTTPRequest method that we are using, so that it can be used elsewhere in the script.

window.setXHRMethod = function(){
	// Is this firefox with Greasemonkey installed?
	if( identifyBrowser() == "FF" && (typeof GM_registerMenuCommand) ){
		XHRMethod = 'GM-XHR';
	} else {
		// Use the custom method of
		XHRMethod = 'CS-XHR';
	}
}

// Start the loading process. We need jQuery to be loaded before we can do anything else, so check to see if its loaded. If its not, wait another 100ms and try again. Otherwise, load jQuery extensions and then studybar itself.
window.startProcess = function(){
	if ( typeof(jQuery) == 'undefined' ) {
		setTimeout('startProcess()', 100);
	} else {
		loadJQExtensions();
		jQCopyCSS();
		loadStudyBar();
	}

}

function jQCopyCSS(){
		// jQuery by default doesnt support returning all the attributes..
		jQuery.fn.css2 = jQuery.fn.css;
		jQuery.fn.css = function() {
		    if (arguments.length) return jQuery.fn.css2.apply(this, arguments);
		    
		    var attr = ['font-family','font-size','font-weight','font-style','color',
		        'text-transform','text-decoration','letter-spacing','word-spacing',
		        'line-height','text-align','vertical-align','background-color',
		        'background-image','background-repeat','background-position',
		        'background-attachment','opacity','width','height','top','right','bottom',
		        'left','margin-top','margin-right','margin-bottom','margin-left',
		        'padding-top','padding-right','padding-bottom','padding-left',
		        'border-top-width','border-right-width','border-bottom-width',
		        'border-left-width','border-top-color','border-right-color',
		        'border-bottom-color','border-left-color','border-top-style',
		        'border-right-style','border-bottom-style','border-left-style','position',
		        'display','visibility','z-index','overflow-x','overflow-y','white-space',
		        'clip','float','clear','cursor','list-style-image','list-style-position',
		        'list-style-type','marker-offset'];
		        
		    var len = attr.length, obj = {};

			var tmpJson = "";

		    for (var i = 0; i < len; i++){ 
		    	var tmpVal = jQuery.fn.css2.call(this, attr[i]);
		    	
		    	if(tmpVal != 'undefined' && tmpVal != "0px" && tmpVal != "none" && tmpVal != "rgb(0, 0, 0)" && tmpVal != "0%" && tmpVal != "normal" && tmpVal != "auto"){
		       		obj[attr[i]] = tmpVal;
		       		//tmpJson += " '" + attr[i] + "' : '" + tmpVal + "',";
		       		//console.log(attr[i] + ": " + tmpVal);
		        }
		    }
		    
		    //tmpJson = tmpJson.replace(/,$/, ' ');
		    
		    return obj;
		}
}

// <Name> loadJQExtensions
// <Purpose> Load the jQuery extensions required. Load in order, so they do not conflict.

window.loadJQExtensions = function(){
	// Load jQuery extensions in order.
	attachJS( settings.baseURL + 'jquery.tipsy.js', 'sb-tipsy' );
	attachJS( settings.baseURL + 'spell/core.js', 'sb-spell' );
	attachJS( settings.baseURL + 'jquery.facebox.js', 'sb-facebox' );
}

///////////////////////////////////////////////////////////////////////////

// Are we loading in an iframe?
if (window == window.top) {

	// Check to see if we can register a menu item in Greasemonkey. Note: This is only supported in Greasemonkey for Firefox.
	if( (typeof GM_registerMenuCommand) == 'undefined') {
		// No greasemonkey extensions. Load manually.
		
		// IE? Change over our event listeners to its own format.
		createIEaddEventListeners();
		
		// Attach jQuery, our custom button class and the greasemonkey compatibility functions.
		attachJS( 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js', 'sb-jquery' );
		attachJS( settings.baseURL + 'button.class.js', 'sb-buttons' );
		if(identifyBrowser() == 'Opera') attachJS( settings.baseURL + 'gm-compat.js', 'sb-gmcompat' );
		
		startProcess();
	} else {
		
		// If the user had studybar open, reopen it again.
		var autoLoadValue = GM_getValue('autoload', false);
		
		// Register the greasemonkey menu items.
		GM_registerMenuCommand("Load StudyBar Toolbar", function(){ loadStudyBar() });
		
		// Get the blocked sites list
		disabledSites = GM_getValue('blocked', []);
		
		//console.log(disabledSites);
		
		var thisIsBlocked = false;
		
		jQCopyCSS();
		
		if(disabledSites.length > 0){
			for (var i=0; i<disabledSites.length; i++ ){
				if(disabledSites[i] == window.location.hostname) thisIsBlocked = true;
			}
		}
	
	
		if( autoLoadValue == true && thisIsBlocked == false ) {
			$(document).ready(function(){
				loadStudyBar();
			});
		}
	
	}
	
}