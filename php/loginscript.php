<?php
    $username = $_POST["u"];
	$password = $_POST["p"];
	$mysql = mysqli_connect('localhost', 'root', '');
    mysqli_select_db($mysql, "pictures");
    $stmt = mysqli_prepare($mysql, "SELECT * FROM user WHERE username = ? AND password = ?");
    mysqli_stmt_bind_param($stmt, "ss", $username, $password);
	mysqli_stmt_execute($stmt);
	
    while ($row = mysqli_stmt_fetch($stmt)) {
        session_start();
        $_SESSION["username"] = $username;
    }

    header('Location: ../map.php');
?>