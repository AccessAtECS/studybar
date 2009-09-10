<?php
error_reporting(E_ERROR | E_WARNING);
require("classes/speech.class.php");
	
// Get the data that we're using. Currently Pseudo
//$data = file_get_contents("out.txt");
//$data = file_get_contents("http://absoluteshakespeare.com/poems/phoenix_and_turtle.htm");

//if(@$_GET['page'] && @$_GET['data']){
if(@$_POST['page'] && @$_POST['data']){	

	//$speech = new speech($_GET['data'], $_GET['page']);
	$speech = new speech($_POST['data'], $_POST['page']);
	
	echo $speech->execute()->returnStatus();
}

?>