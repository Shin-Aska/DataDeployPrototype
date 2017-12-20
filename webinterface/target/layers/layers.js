var layers = [
  new ol.layer.Tile({
    source: new ol.source.OSM()
  })
];

var layerNames = ["OpenStreetMaps"];
var serverString = "http://localhost:8080";
var workspace    = "cite";

var group_newmap = "";
var layersList   = "";

var createTargetLayer = function(ws, ds) {
  return ws + ":" + ds;
}

var loadExternalJavascript = function(dir) {
  $.ajax({
    type: "GET",
    dataType: "text",
    timeout: 30000,
    cache: false,
    url: dir,
    success: function(data){
        eval(data);
    }
  });
}

var layerAction = function(id) {
  var sValue = $("#checkbox-" + id).prop("checked");
  layers[parseInt(id) - 1].setVisible(sValue);
}

var targetContent = -1;
var initializeLayerList = function() {

  var totalString = "";
  for (var i = 0; i < layerNames.length; i++) {
    totalString += "<div id='contentItem" + (i+1) + "'>";
    totalString += "  <div> <!-- item " + (i+1) + " -->"
    totalString += '     <p onclick=\'toggleInfo("item' + (i+1) + '")\' class="infoCircle"><i class="fa fa-info-circle" aria-hidden="true"></i></p>';
    totalString += '     <a id="popupItem'+(i+1)+'" href="#popupMenu" data-rel="popup" data-transition="slideup" class="moreOptions"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>';
    totalString += '     <label for="checkbox-' + (i+1) + '">';
    totalString += '         '+ layerNames[i] + ' ';
    totalString += '      </label>';
    totalString += '     <input onclick="layerAction(' + (i+1) + ')" type="checkbox" name="checkbox-' + (i+1) + '" id="checkbox-' + (i+1) + '" checked>';
    totalString += "  </div>";
    
    totalString += '  <div class="toggler">';
    totalString += '    <div id="item' + (i+1) + '" class="ui-widget-content ui-corner-all hiddenAtFirst">';
    totalString += '      <h3 class="ui-widget-header ui-corner-all">Toggle</h3>';
    totalString += '      <p>';
    totalString += '         Etiam libero neque, luctus a, eleifend nec, semper at, lorem. Sed pede. Nulla lorem metus, adipiscing ut, luctus sed, hendrerit vitae, mi.';
    totalString += '      </p>';
    totalString += '    </div>';
    totalString += '  </div>';
    totalString += '</div>';
  }
  $("#operationalLayer").after(totalString);
  $(".fieldList").enhanceWithin();

  for (var i = 0; i < layerNames.length; i++) {
    $("#popupItem" + (i+1)).click((function(id) {
      return function() {
        setMoveTarget(id);
      }
    }(i)));
  }
}

var setLayerZIndex = function() {
  for (var i = layers.length - 1; i >= 0; i--) {
    layers[i].setZIndex(i+1);
  }
}

var moveLayerDown = function(id) {
  if (id != layers.length - 1) {
    var tmp = layers[id].getZIndex();
    layers[id].setZIndex(layers[id+1].getZIndex());
    layers[id+1].setZIndex(tmp);

    tmp = layerNames[id];
    layerNames[id] = layerNames[id+1];
    layerNames[id+1] = tmp;
  }

  $("#checkbox-" + (id+1)).checkboxradio("destroy");
  $("#checkbox-" + (id+2)).checkboxradio("destroy");

  $("#contentItem" + (id+1)).swapWith("#contentItem" + (id+2));

  $("#checkbox-" + (id+1)).checkboxradio();
  $("#checkbox-" + (id+2)).checkboxradio();

  var tmp = $("#contentItem" + (id+1)).attr("id");

  $("#contentItem" + (id+1)).attr("id", $("#contentItem" + (id+2)).attr("id"));
  $("#contentItem" + (id+2)).attr("id", tmp);

  

  $("#popupItem" + (id+1)).off("click");
  $("#popupItem" + (id+2)).off("click");

  $("#popupItem" + (id+2)).click((function(id){
    return function() {
      setMoveTarget(id);
    }
  }(id)));

  $("#popupItem" + (id+1)).click((function(id){
    return function() {
      setMoveTarget(id);
    }
  }(id+1)));
  
  tmp = $("#popupItem" + (id+1)).attr("id");
  $("#popupItem" + (id+1)).attr("id", $("#popupItem" +(id+2)).attr("id"));
  $("#popupItem" + (id+2)).attr("id", tmp);

}

var moveLayerUp = function(id) {
  if (id != 0) {
    var tmp = layers[id].getZIndex();
    layers[id].setZIndex(layers[id-1].getZIndex());
    layers[id-1].setZIndex(tmp);
    
    tmp = layerNames[id];
    layerNames[id] = layerNames[id-1];
    layerNames[id-1] = tmp;
  }

  $("#checkbox-" + (id)).checkboxradio("destroy");
  $("#checkbox-" + (id+1)).checkboxradio("destroy");

  $("#contentItem" + (id+1)).swapWith("#contentItem" + (id));

  $("#checkbox-" + (id)).checkboxradio();
  $("#checkbox-" + (id+1)).checkboxradio();

  var tmp = $("#contentItem" + (id)).attr("id");

  $("#contentItem" + id).attr("id", $("#contentItem" + (id+1)).attr("id"));
  $("#contentItem" + (id+1)).attr("id", tmp);

  $("#popupItem" + (id)).off("click");
  $("#popupItem" + (id+1)).off("click");

  $("#popupItem" + (id)).click((function(id){
    return function() {
      setMoveTarget(id);
    }
  }(id)));

  $("#popupItem" + (id+1)).click((function(id){
    return function() {
      setMoveTarget(id);
    }
  }(id-1)));

  
  
  tmp = $("#popupItem" + (id)).attr("id");
  $("#popupItem" + (id)).attr("id", $("#popupItem" +(id+1)).attr("id"));
  $("#popupItem" + (id+1)).attr("id", tmp);
}

var setMoveTarget = function(id) {
  targetContent = id;
  if (id == 0) {
    $("#actUp").css("display", "none");
    $("#actDown").css("display", "block");
  }
  else if (id == layers.length - 1) {
    $("#actUp").css("display", "block");
    $("#actDown").css("display", "none");
  }
  else {
    $("#actUp").css("display", "block");
    $("#actDown").css("display", "block");
  }
}

var moveItemDown = function() {
  if (targetContent != -1) {
    moveLayerDown(targetContent);
  }
}

var moveItemUp = function() {
  if (targetContent != -1) {
    moveLayerUp(targetContent);
  }
}

$.get( "php/coverageStoreList.php", function( data ) {
  var coverageStores = JSON.parse(data).coverageStores;
  for(var i = 0; i < coverageStores.coverageStore.length; i++) {
    var store = coverageStores.coverageStore[i];
    var param = createTargetLayer(workspace, store.name);

    var layer = new ol.layer.Tile({
      extent: [-13884991, 2870341, -7455066, 6338219],
      source: new ol.source.TileWMS({
        url: serverString + '/geoserver/wms',
        params: {'LAYERS': param, 'TILED': true},
        serverType: 'geoserver',
        // Countries have transparency, so do not fade tiles:
        transition: 0
      })
    });

    layerNames.push(store.name);
    layers.push(layer);
  }

  $.get( "php/dataStoreList.php", function( data ) {
    var dataStores = JSON.parse(data).dataStores;
    for(var i = 0; i < dataStores.dataStore.length; i++) {
      var store = dataStores.dataStore[i];
      var param = createTargetLayer(workspace, store.name);

      var layer = new ol.layer.Tile({
        extent: [-13884991, 2870341, -7455066, 6338219],
        source: new ol.source.TileWMS({
          url: serverString + '/geoserver/wms',
          params: {'LAYERS': param, 'TILED': true},
          serverType: 'geoserver',
          // Countries have transparency, so do not fade tiles:
          transition: 0
        })
      });

      layerNames.push(store.name);
      layers.push(layer);
    }

    group_newmap = new ol.layer.Group({
      layers: layers,
      title: "newmap"
    });
    
    layersList = [group_newmap];

    /*
      <script src="./webinterface/target/resources/qgis2web.js"></script>
      <script src="./webinterface/target/resources/Autolinker.min.js"></script>
    */
    loadExternalJavascript("./webinterface/target/resources/qgis2web.js");
    loadExternalJavascript("./webinterface/target/resources/Autolinker.min.js");
    loadExternalJavascript("js/marker.js");
    initializeLayerList();
    setLayerZIndex();
  });
});

  

/*var layers = [
    
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        
        new ol.layer.Tile({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: new ol.source.TileWMS({
            url: 'http://localhost:8080/geoserver/wms',
            params: {'LAYERS': 'cite:B16_Mosaic', 'TILED': true},
            serverType: 'geoserver',
            // Countries have transparency, so do not fade tiles:
            transition: 0
          })
        }),

        new ol.layer.Tile({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: new ol.source.TileWMS({
            url: 'http://localhost:8080/geoserver/wms',
            params: {'LAYERS': 'cite:DOW_Building', 'TILED': true, tilesOrigin: "435251.24377000006,4384832.80069"},
            serverType: 'geoserver',
            // Countries have transparency, so do not fade tiles:
            transition: 0
          })
        })
];*/


