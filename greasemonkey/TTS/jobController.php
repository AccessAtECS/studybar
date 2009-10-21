<?php
error_reporting(E_ERROR | E_WARNING);
require("classes/speech.class.php");

if(@$_POST['page'] && @$_POST['data']){	

	$speech = new speech($_POST['data'], $_POST['page']);
	
	echo $speech->execute()->returnStatus();
}

?>