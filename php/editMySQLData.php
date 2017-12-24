<?php
	

	$id      = $_POST["id"];
	$alt      = $_POST["alt"];
	$loc      = $_POST["loc"];
	$dev      = $_POST["dev"];
	$dat      = $_POST["dat"];
        $pat      = $_POST["pat"];
        $pic      = $_POST["pic"];
        $not      = $_POST["not"];

	$mysql = mysqli_connect('localhost', 'root', '');
        mysqli_select_db($mysql, "pictures");
	$stmt = mysqli_prepare($mysql, "UPDATE cus_pictures SET altitude=?, location=?, devicetype=?, date=?, path=?, picture=?, note=? WHERE pointID= ?");
	mysqli_stmt_bind_param($stmt, "dssssssi", $alt, $loc, $dev, $dat, $pat, $pic, $not, $id);
	mysqli_stmt_execute($stmt);
        echo mysqli_error($mysql);
	mysqli_close($mysql);
?>