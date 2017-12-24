<?php
	

	$lon      = $_POST["lon"];
	$lat      = $_POST["lat"];
	$alt      = $_POST["alt"];
	$loc      = $_POST["loc"];
	$dev      = $_POST["dev"];
	$dat      = $_POST["dat"];
        $pat      = $_POST["pat"];
        $pic      = $_POST["pic"];
        $not      = $_POST["not"];
        $point    = $lon . " " . $lat;

	$mysql = mysqli_connect('localhost', 'root', '');
        mysqli_select_db($mysql, "pictures");
	$stmt = mysqli_prepare($mysql, "INSERT INTO cus_pictures(position, altitude, location, devicetype, date, path, picture, note) VALUES(ST_GeomFromText('POINT(". $point . ")'), ?, ?, ?, ?, ?, ?, ?)");
	mysqli_stmt_bind_param($stmt, "dssssss", $alt, $loc, $dev, $dat, $pat, $pic, $not);
	mysqli_stmt_execute($stmt);
	mysqli_close($mysql);
?>