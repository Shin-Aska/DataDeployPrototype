<?php
    header("Cache-Control: no-cache, must-revalidate");
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST");
    header("Access-Control-Allow-Headers: Authorization");
    header('Content-type: application/json');
    
    include ("DataStore.php");
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, "http://localhost:8080/geoserver/rest/workspaces/cite/coveragestores.json");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    
    curl_setopt($ch, CURLOPT_USERPWD, "admin" . ":" . "geoserver");
    
    $txt = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close ($ch);
    
    //echo $result;
    $result = new DataStore();
    $result->dataStores = array();

    $obj = json_decode($txt);
    for($i = 0; $i < count($obj->coverageStores->coverageStore); $i++) {
        $object = new Data();
        $object->name = $obj->coverageStores->coverageStore[$i]->name;
        

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://localhost:8080/geoserver/rest/workspaces/cite/coveragestores/".$object->name."/coverages/".$object->name.".json");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($ch, CURLOPT_USERPWD, "admin" . ":" . "geoserver");
        
        $txt = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close ($ch);

        $targ = json_decode($txt);
        $bounds = array();

        if (is_null($targ) == false) {
            array_push($bounds, $targ->coverage->nativeBoundingBox->minx);
            array_push($bounds, $targ->coverage->nativeBoundingBox->miny);
            array_push($bounds, $targ->coverage->nativeBoundingBox->maxx);
            array_push($bounds, $targ->coverage->nativeBoundingBox->maxy);
            $object->extent = $bounds;
            array_push($result->dataStores, $object);
        }
    }
    
    echo json_encode($result);
?>
