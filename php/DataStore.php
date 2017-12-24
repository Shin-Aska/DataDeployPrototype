<?php
class DataStore {
	
	var $dataStores;
}

class Data {
	
	var $name;
	var $extent;
        var $type;
        public function setType($t) {
            $this->type = $t;
        }
}
?>