<?php
$spellURI = "http://access.ecs.soton.ac.uk/seb/StudyBar/spell/spellcheck.php?";
$dictURI = "http://en.wiktionary.org/w/api.php?";
$ttsURI = "http://access.ecs.soton.ac.uk/seb/StudyBar/TTS/chunkCoordinator.php?";
$updateURI = "http://access.ecs.soton.ac.uk/seb/StudyBar/update.php";

switch($_GET['rt']){

	case "spell":
		$vars = $_GET;
		
		unset($vars['rt'], $vars['id']);
		$remData = file_get_contents( $spellURI . http_build_query($vars) );
		$ro['data'] = $remData;
		echo "var CSresponseObject = " . json_encode($ro) . ";";	
	break;
	
	case "dict":
		$vars = $_GET;
		unset($vars['rt'], $vars['id']);
		$remData = file_get_contents( $dictURI . http_build_query($vars) );
		$ro['data'] = $remData;
		echo "var CSresponseObject = " . json_encode($ro) . ";";
	break;
	
	case "tts":
	
		$vars = $_GET;

		list($chunkTotal, $currentChunk) = explode('-', $_GET['chunkData']);

		unset($vars['rt'], $vars['chunkData'], $vars['page']);
		
		file_put_contents( "../TTS/cache/chunks/" . $vars['id'] . ".txt", $vars['data'], FILE_APPEND);

		if($currentChunk == $chunkTotal){
			require("../TTS/classes/speech.class.php");
			
			//file_put_contents("../TTS/cache/chunks/tmpOutput.txt", base64_decode( str_replace(array("-", "_"), array("/", "+"), file_get_contents("../TTS/cache/chunks/" . $vars['id'] . ".txt") ) ) );
			
			$speech = new speech( file_get_contents("../TTS/cache/chunks/" . $vars['id'] . ".txt"), $_GET['page']);
			echo "var CSresponseObject = " . $speech->execute()->returnStatus() . ";";
			
		} else {
			$ro['data'] = array('message' => "ChunkSaved", "debugID" => $currentChunk . "-" . $chunkTotal);
			echo "var CSresponseObject = " . json_encode($ro) . ";";		
		}

	break;
	
	case "update":
		$remData = file_get_contents( $updateURI );
	break;
	
	default:
		$ro['data'] = "test dataset " . rand(0, 999);		
		echo "var CSresponseObject = " . json_encode($ro) . ";";	
	break;


}



?>