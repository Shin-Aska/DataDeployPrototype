<?php
    session_start();
    if (!isset($_SESSION["username"])) {
        header('Location: login.php');
    }
    else {
        header('Location: map.php');
    }
?>