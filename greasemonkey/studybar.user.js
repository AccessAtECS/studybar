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
// @name          StudyBar
// @namespace     http://users.ecs.soton.ac.uk/scs/
// @description   Accessibility toolbar
// @include       *
// @exclude       http://diveintogreasemonkey.org/*
// @exclude       http://www.diveintogreasemonkey.org/*
// ==/UserScript==

window.helloworld = function() {
    alert('Hello world!');
}

//window.setTimeout("helloworld()", 60);

document.body.appendChild(document.createElement('script')).src='http://users.ecs.soton.ac.uk/scs/LSL/StudyBar/greasemonkey/loader.js';


// Register the greasemonkey menu items.
GM_registerMenuCommand("Load StudyBar", function(){ unsafeWindow.loadStudyBar() }, "b", "alt");