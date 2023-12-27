<?php
	$data = json_decode(file_get_contents('php://input'), true);

	$feedback_filename = "../../SwimFlow/results/actionsFlow_".$data["participantId"]."_V".$data["designVersion"].".csv";
	$exists = file_exists($feedback_filename);
	$feedback_file = fopen($feedback_filename, "a+");

	if (!$exists){
    	fwrite($feedback_file, "timestamp, participantId, designVersion, elementId, videoCurrentTime, currentFrameId, videoPlayStatus");
  	}

  	fwrite($feedback_file,
	    PHP_EOL .
	    date(DateTime::ISO8601) . ',' .
	    $data["participantId"] . ',' .
	    $data["designVersion"] . ',' .
	    $data["elementId"]. ',' .
	    $data["videoCurrentTime"]. ',' .
	    $data["currentFrameId"]. ',' .
	    $data["videoPlayStatus"]
	);

	fclose($feedback_file);
	exit;
?>