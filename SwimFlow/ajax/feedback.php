<?php
	$data = json_decode(file_get_contents('php://input'), true);

	$feedback_filename = "../../SwimFlow/results/feedback.csv";
	$exists = file_exists($feedback_filename);
	$feedback_file = fopen($feedback_filename, "a+");

	if (!$exists){
    	fwrite($feedback_file, "timestamp, participant_id, feedback");
  	}

  	fwrite($feedback_file,
	    PHP_EOL .
	    date(DateTime::ISO8601) . ',' .
	    $data["participant_id"] . ',' .
	    $data["feedback"]
	);

	fclose($feedback_file);
	exit;
?>