<?php
	// $data = json_decode(file_get_contents('php://input'), true);

	// $design_filename = "../../Paper2-VisPrototype/design/".$data["participant_id"]."_v".$data["design_version"].".json";
	// $jsonString = json_encode($data, JSON_PRETTY_PRINT);
	// $design_file = fopen($design_filename, "a+");
	
	// fwrite($design_file, $jsonString);
	// fclose($design_file);
	// exit;

	/* -------------------------------- */ 
	$data = json_decode(file_get_contents('php://input'), true);
	$design_filename = "../../SwimFlow/design/".$data[0]["participant_id"]."_V".$data[0]["design_version"].".json";
	$json_string = json_encode($data, JSON_PRETTY_PRINT);	
	
	file_put_contents($design_filename, $json_string);
?>