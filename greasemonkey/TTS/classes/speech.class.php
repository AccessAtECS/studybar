<?php

/**
 * speech class.
 * 
 */
class speech {

	private $rawData;
	private $cleanData;
	private $chunks;
	private $uri;
	private $fileMappings = array();
	
	private $uniqueID;
	private $loadMultiplier = 1;
	private $maxLoad = 2;
	public $encodingState = 0;
	private $averageChunkTime = 4;
	private $splitBy = 400;
	private $maxOffset = 10;
	private $cacheTimeout = 3600; // 1h
	private $scratch_path = "/var/www/projectsportal/htdocs/seb/StudyBar/TTS/cache/";
	private $output_path = "/var/www/projectsportal/htdocs/seb/StudyBar/TTS/cache/";
	private $output_uri = "http://access.ecs.soton.ac.uk/seb/StudyBar/TTS/cache/";

	/**
	 * __construct function.
	 * 
	 * @access public
	 * @param mixed $rawData
	 * @param mixed $uri
	 * @return void
	 */
	public function __construct($rawData, $uri){
		$this->uri = $uri;
	
		$loadAvg = sys_getloadavg();
		
		if($loadAvg[0] > $this->maxLoad){
			// Do not allow encoding, we're over max load.
			$this->encodingState = -1;
		} else {
		
			// Get the ID for this URL.
			$this->generateID();
		
			if( $this->dataIsCached() == true ){
				// Return cached data.
			} else {
				$decoded = base64_decode( str_replace(array("-", "_"), array("/", "+"), $rawData) );
				$this->sanitizeString($decoded);
				$this->writeTranscript();
				//file_put_contents($this->scratch_path . "testing.txt", base64_decode( str_replace(array("-", "_"), array("/", "+"), $rawData) ) );
				//echo strlen($rawData) . " - " . strlen(file_get_contents($this->scratch_path . "testing.txt"));
			}
			
			// Flush any out of date fields.
			$this->flushCache();
		}
	}
	
	/**
	 * sanitizeString function.
	 * 
	 * @access public
	 * @param mixed $data
	 * @return void
	 */
	function sanitizeString($data){
        //$alterations = array('!' => 'exclem', '#' => 'pound', '?' => 'question mark', ';' => 'semicolon', ':' => 'colon', '[' => 'left bracket', '\\' => 'back slash', ']' => 'right bracket', '^' => 'carat', '_' => 'underscore', '`' => 'reverse apostrophe', '|' => 'pipe', '~'=>'tilde', '"' => 'quote', '$' => 'dollar', '%' => 'percent', '&' => 'ampersand', '\'' => 'apostrophe', '(' => 'open paren', ')' => 'close paren', '*' => 'asterisk', '+' => 'plus', ',' => 'comma', '-' => 'dash', '.' => 'dot', '/' => 'slash', '{' => 'open curly bracket', '}' => 'close curly bracket', '"' => 'quote', 'bigham' => 'biggum', 'cse' => 'C S E', 'url' => 'U R L');
        $alterations = array('Ï' => 'oe', '&#156;' => 'oe');
        
        //Strip tags and content that we dont want.
        $data = $this->strip_tags_content($data, "<script><noscript>", TRUE);
        
        // Strip all tags
        $clean = strip_tags( $data, "<a><img><iframe>" );
        
        // Convert tags to what we want to be read out.
		//IMG's
		$clean = preg_replace( "/(<img.*?((alt\s*=\s*(?<q>'|\"))(?<text>.*?)\k<q>.*?)?>)/i", ". Image: $5 ", $clean );
		
		// Links
		/*$clean = preg_replace_callback( "/(<a.*?((href\s*=\s*(?<q>'|\"))(?<text>.*?)\k<q>.*?)?>)/i", "speech::match_links", $clean ); */
		$clean = preg_replace_callback( "/(<a.*?>(.*?)<\/a>)/i", "speech::match_links", $clean );
		
		$clean = preg_replace( "/<.*?>/", " ", $clean );
        
		// Remove all duplicate newlines
        $clean = preg_replace( "/(\r|\n)/", " ", $clean );        
        
        $clean = str_replace( array_keys($alterations), array_values($alterations), $clean );
        
        $clean = html_entity_decode($clean);
        
        $this->sseek($clean);
	}

	/**
	 * sseek string seeking function. Split a block of text up into chunks. Try and do it intelligently i.e. find where near spaces are rather than just splitting in the middle of a word.
	 * 
	 * @access private
	 * @param mixed $data
	 * @return void
	 */
	private function sseek($data){		
		$outString = "";
		$start = 0;
		$previousOffset = 0;
		$chunks = ceil(strlen($data) / $this->splitBy);		
		
		if(strlen($data) > $this->splitBy){
			
			for($i=1; $i <= $chunks; $i++){
				$chunk = trim( substr( $data, ($start  + $previousOffset), $this->splitBy ), ".");
				$chunk = preg_replace("/ [ \r\n\v\f]+/", " ", $chunk);
				
				// Find the closest space at the end of the string within offset distance.
				// Where is the location of the last space?
				$loc = strrpos($chunk, " ");
				$diff = strlen($chunk) - $loc;
				
				// Is there a space within the offset distance inside this part of the string?
				if($diff < $this->maxOffset && $i != $chunks){
					// Yes, take up to that point, alter the offset for the next run.
					$chunk = substr($chunk, 0, $loc);
					$previousOffset = 0 - $diff;
				} else {
					// No. We're going to have to take some of the next string up to maxoffset. Go grab it.
					$forwardChunk = substr( $data, $start + ($this->splitBy + $previousOffset), $this->maxOffset );
					$forwardChunk = preg_replace("/ [ \r\n\v\f]+/", " ", $forwardChunk);
					
					$fwloc = strrpos($forwardChunk, " ");
					
					if($fwloc !== FALSE){
						$chunk .= substr($forwardChunk, 0, $fwloc);
						$previousOffset = $fwloc;
					} else {
						// Plan B, we're going to have to leave it as it is.
					}
				}
				
				$start = $i * $this->splitBy;
				$outString .= $chunk . "\n";
				$this->addMapping($chunk);
			}
		} else {
			$outString = $data;
			$this->addMapping($data);
		}
		
		$this->cleanData = $outString;
		$this->chunks = $chunks;
	}

	/**
	 * match_links function.
	 * 
	 * @access private
	 * @static
	 * @param mixed $matches
	 * @return void
	 */
	private static function match_links($matches){
		if(count($matches) < 2) return " ";
		
		if($matches[2] != ""){
			//return ". Link to " . $matches[5] . " ";
			return ". Link " . $matches[2] . " ";
		} else {
			return " ";
		}
	}
	
	/**
	 * writeTranscript function.
	 * 
	 * @access private
	 * @return void
	 */
	private function writeTranscript(){
		file_put_contents("{$this->scratch_path}/{$this->uniqueID}.txt", $this->cleanData);
		touch("{$this->scratch_path}/{$this->uniqueID}.txt");
	}

	/**
	 * writePlaylist function.
	 * 
	 * @access private
	 * @return void
	 */
	private function writePlaylist(){
		$playlist = new DOMDocument();
		
		$root = $playlist->createElement('playlist');
		$root_el = $playlist->appendChild($root);
		$root_el->setAttribute("version", "1");
		
		$tl = $playlist->createElement("trackList");
		$tracks = $root_el->appendChild($tl);
		
		for($i=0; $i <= $this->chunks; $i++){
		
			$track = $playlist->createElement("track");
			
			$tracks->appendChild($track);
			
			$title = $playlist->createElement("title");
			$title_el = $track->appendChild($title);
			$title_el->appendChild($playlist->createTextNode($i));

			$location = $playlist->createElement("location");
			$location_el = $track->appendChild($location);
			$location_el->appendChild($playlist->createTextNode($this->output_uri . "TTS-" . $this->uniqueID . "-" . $i . ".mp3"));
			
			$meta = $playlist->createElement("meta");
			$meta_el = $track->appendChild($meta);
			$meta_el->setAttribute("rel", "type");
			$meta_el->appendChild($playlist->createTextNode("sound"));
		
		}
		
		$playlist->save($this->output_path . $this->uniqueID . ".xml");
		touch($this->output_path . $this->uniqueID . ".xml");
		
	}
	
	/**
	 * generateID function.
	 * 
	 * @access private
	 * @return void
	 */
	private function generateID(){
		$components = parse_url( $this->uri );
		$this->uniqueID = substr(md5(substr(md5($components['host']), 0, 5) . substr(md5($components['path'] . $components['query']), -5, 5)), 0, 5) . substr(time(), -4, 4);
	}
	
	/**
	 * addMapping function.
	 * 
	 * @access private
	 * @param mixed $line
	 * @return void
	 */
	private function addMapping($line){
		$components = explode(" ", $line);
		//print_r($components);
		$this->fileMappings[] = array(	$components[0] . " " . $components[1] . " " . $components[2],
										$components[count($components)-2] . " " . $components[count($components)-1] . " " . $components[count($components)]);
	}
	
	/**
	 * dataIsCached function.
	 * 
	 * @access private
	 * @return void
	 */
	private function dataIsCached() {
		$this->checkCache();
		return false;
	}
	
	/**
	 * checkCache function.
	 * 
	 * @access private
	 * @return void
	 */
	private function checkCache(){
	
	}
	
	/**
	 * flushCache function.
	 * 
	 * @access public
	 * @return void
	 */
	public function flushCache(){

		$cacheDir = dir($this->output_path);
		
		//echo "Handle: " . $cacheDir->handle . "\n";
		//echo "Path: " . $cacheDir->path . "\n";
		while (false !== ($entry = $cacheDir->read())) {
			if($entry !== "." && $entry !== ".."){
				$statData = stat($cacheDir->path);
		   		//echo date('l jS \of F Y h:i:s A', $statData['atime']) . "<br />\n";
		   		// If the file was modified after the max cache time...
		   		if( ($statDate['atime'] + $this->cacheTimeout) < time() ) {
		   			//echo "File is older than cache time. <br />";
		   			//$this->deleteFile($cacheDir->path);
		   		}
		   	}
		}
		$cacheDir->close();
	
	}
	
	private function deleteFile($path){
		if(file_exists($path)){
			//$status = unlink($path);
			
		}
	} 
	
	/**
	 * checkLoad function.
	 * 
	 * @access private
	 * @return void
	 */
	private function checkLoad(){
	
	}
	
	/**
	 * execute function.
	 * 
	 * @access public
	 * @return this object
	 */
	public function execute(){
		if($this->encodingState > -1){
			$this->writePlaylist();
			shell_exec("nice -n 19 /var/scripts/SB_generateAudio.sh {$this->scratch_path}/{$this->uniqueID}.txt {$this->uniqueID} awb > /dev/null &");
			//echo $output;
			//echo "Execution string: /var/scripts/SB_generateAudio.sh {$this->scratch_path}/{$this->uniqueID}.txt {$this->uniqueID} awb";
		}
		return $this;
	}
	
	/**
	 * returnStatus function.
	 * 
	 * @access public
	 * @return void
	 */
	public function returnStatus(){
		if($this->encodingState > -1 && $this->encodingState < 1){
			return json_encode( array("status" => "encoding", "ID" => $this->uniqueID, "chunks" => $this->chunks, "est_completion" => round(($this->averageChunkTime * $this->chunks) * $this->loadMultiplier), "map" => $this->fileMappings) );
		} else {
			return json_encode( array("status" => "failure", "reason" => "overcapacity") );
		}
	}
	
	/**
	 * returnClean function.
	 * 
	 * @access public
	 * @return void
	 */
	public function returnClean(){
		return $this->cleanData;
	}

	/**
	 * strip_tags_content function.
	 * 
	 * @access private
	 * @param mixed $text
	 * @param string $tags. (default: '')
	 * @param mixed $invert. (default: FALSE)
	 * @return void
	 */
	private function strip_tags_content($text, $tags = '', $invert = FALSE) {
	
		preg_match_all('/<(.+?)[\s]*\/?[\s]*>/si', trim($tags), $tags);
		$tags = array_unique($tags[1]);
		
		if(is_array($tags) && count($tags) > 0) {
			if($invert == FALSE) {
			  return preg_replace('@<(?!(?:'. implode('|', $tags) .')\b)(\w+)\b.*?>.*?</\1>@si', '', $text);
			}else {
			  return preg_replace('@<('. implode('|', $tags) .')\b.*?>.*?</\1>@si', '', $text);
			}
		} elseif($invert == FALSE) {
			return preg_replace('@<(\w+)\b.*?>.*?</\1>@si', '', $text);
		}
		return $text;
	}

}
?>