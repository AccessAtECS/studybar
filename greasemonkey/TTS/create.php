<?php

$avg_time = 4; // Average time to process per chunk
$parts = 0;
//$data = file_get_contents("http://shakespeare.mit.edu/midsummer/midsummer.4.2.html");

$data = file_get_contents("out.txt");

$clean = sanitizeString( $data );

//echo $clean;

// Write data out to temporary file.
//file_put_contents("out.txt", $clean['data']);

echo json_encode( array("chunks" => $clean['parts'], "est_completion" => round($avg_time * $clean['parts'])) );

//shell_exec("/var/scripts/SB_generateAudio.sh /var/www/projectsportal/htdocs/seb/StudyBar/TTS/out.txt mnd awb > /dev/null &");





function sanitizeString($data){
        //$alterations = array('!' => 'exclem', '#' => 'pound', '?' => 'question mark', ';' => 'semicolon', ':' => 'colon', '[' => 'left bracket', '\\' => 'back slash', ']' => 'right bracket', '^' => 'carat', '_' => 'underscore', '`' => 'reverse apostrophe', '|' => 'pipe', '~'=>'tilde', '"' => 'quote', '$' => 'dollar', '%' => 'percent', '&' => 'ampersand', '\'' => 'apostrophe', '(' => 'open paren', ')' => 'close paren', '*' => 'asterisk', '+' => 'plus', ',' => 'comma', '-' => 'dash', '.' => 'dot', '/' => 'slash', '{' => 'open curly bracket', '}' => 'close curly bracket', '"' => 'quote', 'bigham' => 'biggum', 'cse' => 'C S E', 'url' => 'U R L');
        
        // Strip all tags
        $clean = strip_tags( $data, "<a><img><iframe>" );
        
        //echo $clean;
        
        // Convert tags to what we want to be read out.
		//IMG's
		$clean = preg_replace( "/(<img.*?((alt\s*=\s*(?<q>'|\"))(?<text>.*?)\k<q>.*?)?>)/i", " Image: $5 ", $clean );
		
		// Links
		$clean = preg_replace_callback( "/(<a.*?((href\s*=\s*(?<q>'|\"))(?<text>.*?)\k<q>.*?)?>)/i", "match_links", $clean ); 
		$clean = preg_replace( "/<.*?>/", " ", $clean );
        
		// Remove all duplicate newlines
        $clean = preg_replace( "/(\r|\n)/", " ", $clean );        
        
        //$clean = str_replace( array_keys($alterations), array_values($alterations), $clean );
        
        return sseek($clean);
}

function sseek($data){
	$outString = "";
	$splitBy = 400;
	$chunks = round(strlen($data) / $splitBy);
	
	$start = 0;
	
	for($i=1; $i <= $chunks; $i++){
		$chunk = substr ( $data, $start, $splitBy );
		$start = $i * $splitBy;
		$outString .= $chunk . "\n";
	}
	
	return array("data" => $outString, "parts" => $chunks);
}

function match_links($matches){
	//print_r($matches);
	if(count($matches) < 5) return " ";
	
	if($matches[5] != ""){
		return " Link to " . $matches[5] . " ";
	} else {
		return " ";
	}
}



?>