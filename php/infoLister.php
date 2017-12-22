<?php
    include("InfoList.php");
    $ch = curl_init();
    $urls = json_decode(base64_decode($_POST["data"]));
    $result = new Informations();
    $result->info = array();
    
    for ($i = 0; $i < count($urls); $i++) {
        
        $url = $urls[$i];
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");

        $txt = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        
        $obj = json_decode($txt);
        $info= new Data();
        
        $info->type = $obj->type;
        $info->features = $obj->features;
        array_push($result->info, $info);
    }
    curl_close ($ch);
    echo json_encode($result);
?>
