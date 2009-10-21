<?php
$data = file_get_contents("localStudyBar.user.js");

preg_match("/versionString = \"(.*?)\";/i", $data, $matches);

if(count($matches) == 2){
	$info = array("ver" => $matches[1], "updateURL" => "http://access.ecs.soton.ac.uk/seb/StudyBar/localStudyBar.user.js");
	echo json_encode($info);
}
?>