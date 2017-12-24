<?php
    
    include("InfoList.php");
    $result = new Informations();
    $result->info = array();
    
    $mysql = mysqli_connect('localhost', 'root', '');
    mysqli_select_db($mysql, "pictures");
    $zresult = mysqli_query($mysql, "SELECT * FROM cus_pictures");
    while ($row = mysqli_fetch_array($zresult)) {
        
        $info= new Data();
        $info->type = "FeatureCollection:MySQL";
        
        $properties = array();
        $array      = array();
        // PHP hack for creating objects.
        // Too lazy to create my own class for this
        array_push($array, array("pointID" => $row["pointID"], "id" => $row["id"], "altitude" => $row["altitude"], "location" => $row["location"], "devicetype" => $row["devicetype"], "date" => $row["date"], "path" => $row["path"], "picture" => $row["picture"], "note" => $row["note"] ));
        $properties = $array[0];
        
        $array      = array();
        array_push($array, array("type" => "feature", "id" => "CUS_Pictures." . $row["id"], "properties" => $properties));
        
        $info->features = $array;
        array_push($result->info, $info);
    }

    echo json_encode($result);
?>

