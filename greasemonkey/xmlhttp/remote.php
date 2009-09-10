<?php
$spellURI = "http://access.ecs.soton.ac.uk/seb/StudyBar/spell/spellcheck.php?";

switch($_GET['rt']){

	case "spell":
		$vars = $_GET;
		
		unset($vars['rt'], $vars['id']);
		$remData = file_get_contents( $spellURI . http_build_query($vars) );
		$ro['data'] = $remData;
		echo "var CSresponseObject = " . json_encode($ro) . ";";	
	break;
	
	default:
		$ro['data'] = "test dataset " . rand(0, 999);		
		echo "var CSresponseObject = " . json_encode($ro) . ";";	
	break;



}

//if($vars['test'] == 'remotemessage' ) $ro['message'] = "This is a message from the remote server. Successfully completed cross-domain xmlhttp request!";




?>