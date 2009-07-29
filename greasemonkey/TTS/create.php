<?php

$outString = "";

//$input = file_get_contents( "http://www.cstr.ed.ac.uk/projects/festival/manual/festival_6.html" );

$handle = fopen("http://shakespeare.mit.edu/midsummer/midsummer.4.2.html", "r");
if ($handle) {
    while (!feof($handle)) {
        $buffer = fread($handle, 512);
        
        // Find any orphaned a or img tags.
        
        // Strip all tags
        $clean = strip_tags( $buffer, "<a><img><iframe>" );
        
        //echo $clean;
        
        // Convert tags to what we want to be read out.
		//IMG's
		$clean = preg_replace( "/(<img.*?((alt\s*=\s*(?<q>'|\"))(?<text>.*?)\k<q>.*?)?>)/i", " Image: $5 ", $clean );
		
		// Links
		$clean = preg_replace_callback( "/(<a.*?((href\s*=\s*(?<q>'|\"))(?<text>.*?)\k<q>.*?)?>)(.*?)<\/a>/i", "match_links", $clean ); 
        
		// Remove all duplicate newlines
        $clean = preg_replace( "/(\r|\n)/", " ", $clean );        
        
        $outString .= $clean . "\n";
    }
    fclose($handle);
}

echo $outString;

function match_links($matches){
	//print_r($matches);
	if($matches[5] != ""){
		return " Link to " . $matches[5] . " ";
	} else {
		return $matches[6];
	}
}





file_put_contents("out.txt", $outString);

//$output = shell_exec("/var/scripts/SB_generateAudio.sh /var/www/projectsportal/htdocs/seb/StudyBar/TTS/out.txt mnd awb");

echo $output;

?>