<?php
    header("Cache-Control: no-cache, must-revalidate");
    header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST");
    header("Access-Control-Allow-Headers: Authorization");
    header('Content-type: application/json');
    include ("DataStore.php");
    // Generated by curl-to-PHP: http://incarnate.github.io/curl-to-php/
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, "http://localhost:8080/geoserver/rest/workspaces/cite/datastores.json");
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
    for($i = 0; $i < count($obj->dataStores->dataStore); $i++) {
        $object = new Data();
        $object->name = $obj->dataStores->dataStore[$i]->name;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://localhost:8080/geoserver/rest/workspaces/cite/datastores/" . $object->name . ".json");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($ch, CURLOPT_USERPWD, "admin" . ":" . "geoserver");
        
        $txt = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close ($ch);

        $dats = json_decode($txt);
        $object->setType($dats->dataStore->type);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://localhost:8080/geoserver/rest/workspaces/cite/datastores/" . $object->name . "/featuretypes/". $object->name . ".json");
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
            array_push($bounds, $targ->featureType->nativeBoundingBox->minx);
            array_push($bounds, $targ->featureType->nativeBoundingBox->miny);
            array_push($bounds, $targ->featureType->nativeBoundingBox->maxx);
            array_push($bounds, $targ->featureType->nativeBoundingBox->maxy);
            $object->extent = $bounds;
            array_push($result->dataStores, $object);
        }
        
    }
    
    echo json_encode($result);
?>