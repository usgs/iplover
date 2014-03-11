<?php

	//--- Global variables to set access to database ---
	$hostName = ":3306";
	$userName = "";
	$password = "";
	$databaseName = "rtnotes";

$values = "site=site&location=unknown&setting=lowduneforedune&vegcover=moderate&toMOSH=1&toHighTideLine=-55&notes=notes&operator=sfadsd&form-name=newnestsite&location-timestamp=&location-lat=&location-lon=&location-accuracy=&location-z=&location-zaccuracy=";


	// ---Connect to the database using credentials located in the db.php file ---
	if (!$connection = @ mysql_connect($hostName, $userName, $password))
		die('Could not connect');
	mysql_selectdb($databaseName, $connection);


	$site = filter_input(INPUT_GET,'site',FILTER_SANITIZE_STRING);
	$location= filter_input(INPUT_GET,'location',FILTER_SANITIZE_STRING);
	$setting = filter_input(INPUT_GET,'setting',FILTER_SANITIZE_STRING);
	$vegcover = filter_input(INPUT_GET,'vegcover',FILTER_SANITIZE_STRING);
	$toMOSH = filter_input(INPUT_GET,'toMOSH',FILTER_SANITIZE_STRING);
	$toHighTideLine = filter_input(INPUT_GET,'toHighTideLine',FILTER_SANITIZE_STRING);
	$notes = filter_input(INPUT_GET,'notes',FILTER_SANITIZE_STRING);
	$operator = filter_input(INPUT_GET,'operator',FILTER_SANITIZE_STRING);
	$form = filter_input(INPUT_GET,'form-name',FILTER_SANITIZE_STRING);
	$timestamp = filter_input(INPUT_GET,'location-timestamp',FILTER_SANITIZE_STRING);
	$lat = filter_input(INPUT_GET,'location-lat',FILTER_SANITIZE_STRING);
	$lon = filter_input(INPUT_GET,'location-lon',FILTER_SANITIZE_STRING);
	$accuracy = filter_input(INPUT_GET,'location-accuracy',FILTER_SANITIZE_STRING);
	$z = filter_input(INPUT_GET,'location-z',FILTER_SANITIZE_STRING);
	$zaccuracy = filter_input(INPUT_GET,'location-zaccuracy',FILTER_SANITIZE_STRING);


	// ---Execute the query looking for the field activities that occur between the star and end dates ---
	$result1 = @ mysql_query ("INSERT INTO entries (observer,date,latitude,longitude,accuracy,z,zaccuracy,site,setting, vegcover,toMOSH,toHighTideLine, location, notes) VALUES (\"$operator\",NOW(),\"$lat\",\"$lon\",\"$accuracy\",\"$z\",\"$zaccuracy\",\"$site\",\"$setting\", \"$vegcover\",\"$toMOSH\",\"$toHighTideLine\",\"$location\",\"$notes\") ", $connection);	
//	if (!$result1)
//		die('Could not update: ' . mysql_error());



?>