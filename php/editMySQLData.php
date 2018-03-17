<?php
    header("Cache-Control: no-cache, must-revalidate");
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST");
    header("Access-Control-Allow-Headers: Authorization");
    header('Content-type: application/text');

    $id = $_POST["id"];
    $alt = $_POST["alt"];
    $loc = $_POST["loc"];
    $dev = $_POST["dev"];
    $dat = $_POST["dat"];
    $pat = $_POST["pat"];
    $pic = $_POST["pic"];
    $not = $_POST["not"];

    include("config/mysql.php");
    mysqli_select_db($mysql, "pictures");
    $stmt = mysqli_prepare($mysql, "UPDATE cus_pictures SET altitude=?, location=?, devicetype=?, date=?, path=?, picture=?, note=? WHERE pointID= ?");
    mysqli_stmt_bind_param($stmt, "dssssssi", $alt, $loc, $dev, $dat, $pat, $pic, $not, $id);
    mysqli_stmt_execute($stmt);
    echo mysqli_error($mysql);
    mysqli_close($mysql);
?>