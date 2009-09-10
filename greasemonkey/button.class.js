window.returnNewButton = function(id, ico, act, tip, sClass, baseURL){

	var buttonItem = {
		conf : { 
			id: id, icon: ico, action: act, tooltip: tip, HTML: "", styleClass: sClass,
			template: "<div class=\"sb-btn(CLASS)\"><a title=\"(TITLE)\" id=\"(ID)\"><img src=\"(URL)\" border=\"0\" /></a></div> " 
		},
		
		addListener: function(){
			$("#" + buttonItem.conf.id).bind("click", function(e){ eval(act) });
		},
		
		writeHTML: function(){
			var output = buttonItem.buildHTML();
			
			if( buttonItem.conf.id == "closeSBar" ){
				$( $("#sbar .fright").get(0) ).before(output);
			} else {
				$(output).appendTo('#sbar');
			}
			
			//alert( $('#' + buttonItem.conf.id) );
			
			$('#' + buttonItem.conf.id).tipsy({gravity: 'n'});
			buttonItem.addListener();
		},
		
		buildHTML: function(){
			tmpHTML = buttonItem.conf.template.replace("(TITLE)", buttonItem.conf.tooltip);
			tmpHTML = tmpHTML.replace("(ID)", buttonItem.conf.id);
			tmpHTML = tmpHTML.replace("(URL)", baseURL + "presentation/images/" + buttonItem.conf.icon);

			if( buttonItem.conf.styleClass != "" && (typeof buttonItem.conf.styleClass) == "string" ){
				tmpHTML = tmpHTML.replace("(CLASS)", " " + buttonItem.conf.styleClass);
			} else {
				tmpHTML = tmpHTML.replace("(CLASS)", "");
			}

			buttonItem.conf.HTML = tmpHTML;
			return buttonItem.conf.HTML;
		}
	
	}
	
	buttonItem.writeHTML();
	return buttonItem;

}