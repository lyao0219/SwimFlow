<?php

// file path
$file_bbox = "../csv/Tracking data/2021_CF_Montpellier_brasse_dames_100_finaleA_bbox.csv";
// $file_point = file("../csv/Tracking data/2021_CF_Montpellier_brasse_dames_100_finaleA_Espadon.csv");

// $data_bbox = array(), $data_point = array();

if($handle = fopen($file_bbox, "r") !== FALSE) {

	echo "opened \n";

	while( ! feof($handle)) {
		print_r(fgetcsv($handle));
	}

	fclose($handle);

} else {
	echo "unable to open";
}

?>


