// The actual openlayers layer
// Do not touch this (such as swapping areas)
// As a lot of functionalities (GUI related) rely on this one
var layers = [
  /*new ol.layer.Tile({
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ol.source.OSM()
  })*/
];

// The extent (or position) of a particular layer
// The same as above, this should not be touched
// since a lot of functionalities rely on this one
var layerExtents = [/*[-13884991, 2870341, -7455066, 6338219]*/];

// The names of the layers as fetched in the GeoServer
// unlike the other two, this one is interchangeable
var layerNames = [/*"OpenStreetMaps"*/];

// This one obtains the layer info url. It resets everytime the user clicks
var layerInfoCallStack = [];

// The layer group array to be feeded to qgis2web.js
var group_newmap = "";

// The layerList to be feeded to qgis2web
var layersList   = "";

// This fetches the coverages and datastores in the geoserver.
// Once it fetches the data, it will add those into the 3 arrays respectively.
// After that, it will group it using ol.layer.Group and then turn it into an
// array using the layerList which will be feeded into the qgis2web

// You can have many ol.layer.Groups but in my Proof of Concept, I only made
// one.
$.get( "php/coverageStoreList.php", function( data ) {
  var coverageStores = JSON.parse(data);
  for(var i = 0; i < coverageStores.dataStores.length; i++) {
    var store = coverageStores.dataStores[i];
    var param = createTargetLayer(workspace, store.name);

    var layer = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: serverString + '/geoserver/wms',
        params: {'LAYERS': param, 'TILED': true},
        serverType: 'geoserver',
        transition: 0
      })
    });
    layerExtents.push(store.extent);
    layerNames.push(store.name);
    layers.push(layer);
  }

  $.get( "php/dataStoreList.php", function( data ) {
    var dataStores = JSON.parse(data);
    for(var i = 0; i < dataStores.dataStores.length; i++) {
      var store = dataStores.dataStores[i];
      var param = createTargetLayer(workspace, store.name);

      var layer = new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: serverString + '/geoserver/wms',
          params: {'LAYERS': param, 'TILED': true},
          serverType: 'geoserver',
          transition: 0
        })
      });
      layerExtents.push(store.extent);
      layerNames.push(store.name);
      layers.push(layer);
    }

    group_newmap = new ol.layer.Group({
      layers: layers,
      title: "newmap"
    });
    
    layersList = [group_newmap];

    loadExternalJavascript("./webinterface/target/resources/qgis2web.js");
    loadExternalJavascript("./webinterface/target/resources/Autolinker.min.js");
    loadExternalJavascript("js/marker.js");
    initializeLayerList();
    setLayerZIndex();
  });
});

