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
// @match         http://*
// @require       http://code.jquery.com/jquery-latest.js
// ==/UserScript==

javascriptFile = document.createElement("script");
javascriptFile.src = "http://access.ecs.soton.ac.uk/seb/StudyBar/localStudyBar.user.js";
javascriptFile.type = "text/javascript";
javascriptFile.id = "StudyBar";
document.getElementsByTagName('head')[0].appendChild(javascriptFile);