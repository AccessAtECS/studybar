/*! Copyright (c) 2008 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version 0.2-pre
 */
(function($){

/**
 * Creates an instance of a SpellChecker for each matched element.
 * The SpellChecker has several configurable options.
 *  - lang: the 2 letter language code, defaults to en for english
 *  - events: a space separated string of events to use, default is 'keypress blur paste'
 *  - autocheck: number of milliseconds to check spelling after a key event, default is 750.
 *  - url: url of the spellcheck service on your server, default is spellcheck.php
 *  - ignorecaps: 1 to ignore words with all caps, 0 to check them
 *  - ignoredigits: 1 to ignore digits, 0 to check them
 */
$.fn.spellcheck = function(options) {
	return this.each(function() {
		var $this = $(this);
		if ( !$this.is('[type=password]') && !$(this).data('spellchecker') )
			$(this).data('spellchecker', new $.SpellChecker(this, options));
	});
};

/**
 * Forces a spell check on an element that has an instance of SpellChecker.
 */
$.fn.checkspelling = function() {
	return this.each(function() {
		var spellchecker = $(this).data('spellchecker');
		spellchecker && spellchecker.checkSpelling();
	});
};


$.SpellChecker = function(element, options) {
	this.$element = $(element);
	this.options = $.extend({
		lang: 'en',
		autocheck: 750,
		events: 'keypress blur paste',
		url: 'spellcheck.php',
		ignorecaps: 1,
		ignoredigits: 1
	}, options);
	this.bindEvents();
};

$.SpellChecker.prototype = {
	bindEvents: function() {
		if ( !this.options.events ) return;
		var self = this, timeout;
		this.$element.bind(this.options.events, function(event) {
			if ( /^key[press|up|down]/.test(event.type) ) {
				if ( timeout ) clearTimeout(timeout);
				timeout = setTimeout(function() { self.checkSpelling(); }, self.options.autocheck);
			} else
				self.checkSpelling(); 
		});
		// set recievedData here?
	},
	
	checkSpelling: function() {
		var prevText = this.text, text = this.$element.val(), self = this;
		if ( prevText === text ) return;
		this.text = this.$element.val();
		
		
		if(window.XHRMethod == "GM-XHR"){
			window.recievedData = "";
			GM_xmlhttpRequest({ method: "GET",
				url: "http://access.ecs.soton.ac.uk/seb/StudyBar/spell/spellcheck.php?lang=en&ignoredigits=1&ignorecaps=1&text=" + encodeURIComponent(this.text), 
				onload: self.writeData,
				onreadystatechange: self.checkStatus });
			// This is to check that we've recieved the data. GM times out otherwise, so we have to use a timer to keep it alive.
			this.ajaxInterval = setInterval(function(){
				self.checkDataResult();
			}, 100);
		} else {
			window.attachJS( settings.baseURL + 'xmlhttp/remote.php?rt=spell&id=' + Math.floor(Math.random() * 5001) + '&lang=en&ignoredigits=1&ignorecaps=1&text=' + encodeURIComponent(this.text), 'CS-XHR' );
			//alert("XS-XHR/GM-XHR not supported. Switching to " + XHRMethod);
			this.ajaxInterval = setInterval(function(){
				self.checkCSXHRResponse();
			}, 100);
		}
    
	},
	
	writeData: function(response){
		// Write the data out to a variable, as response is going to disapear!
		self.recievedData = response.responseText;
		//console.log("writing data:" + self.recievedData);
	},
	
	checkStatus: function(response){
		//alert(response.readyState);
	},
	
	checkDataResult: function(){
		// Do we have data yet? If so, lets clear the interval and parse the results!
		
		if( window.recievedData != "" ){
			clearInterval( this.ajaxInterval );
			//console.log("Recieved: " + self.recievedData);
			
			this.parseResults( window.recievedData );
			
			// Reset the storage variable for the xmlhttprequest'd data
			window.recievedData = "";
		}
	},
	
	checkCSXHRResponse: function(){
		// Do we have data yet? If so, lets clear the interval and parse the results!
		if( (typeof CSresponseObject) != "undefined" ){
			clearInterval( this.ajaxInterval );
			//console.log("Recieved: " + self.recievedData);
			
			// Copy the response object to a local object.
			var RO = CSresponseObject;
			
			// Remove the response JS.
			$('#CS-XHR').remove();

			this.parseResults( RO.data );
		}		
	},
	
	parseResults: function(results) {
		var self = this;
		this.results = [];
		$(results).find('c').each(function() {
			var $this = $(this),
				offset = $this.attr('o'),
				length = $this.attr('l');
			self.results.push({
				word: self.text.substr(offset, length),
				suggestions: $this.text().split(/\s/)
			});
		});
		this.displayResults();
	},

	
	displayResults: function() {
		$('#spellcheckresults').remove();
		if ( !this.results.length ) return;
		var $container = $('<div id="spellcheckresults"></div>').appendTo('body'),
			dl = [], self = this, offset = this.$element.offset(), height = this.$element[0].offsetHeight, i, k;
		for ( i=0; i<this.results.length; i++ ) {
			var result = this.results[i], suggestions = result.suggestions;
			dl.push('<dl><dt>'+result.word+'</dt>');
			for ( k=0; k<suggestions.length; k++ )
				dl.push('<dd>'+suggestions[k]+'</dd>');
			dl.push('<dd class="ignore">ignore</dd></dl>');
		}
		$container.append(dl.join('')).find('dd').bind('click', function(event) {
			var $this = $(this), $parent = $this.parent();
			if ( !$this.is('.ignore') )
				self.$element.val( self.$element.val().replace( $parent.find('dt').text(), $this.text() ) );
			$parent.remove();
			if ( $('#spellcheckresults').is(':empty') )
				$('#spellcheckresults').remove();
			this.blur();
		}).end().css({ top: offset.top + height, left: offset.left });
	}
	
};

})(jQuery);