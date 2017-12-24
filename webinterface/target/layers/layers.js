// The actual openlayers layer
// Do not touch this (such as swapping areas)
// As a lot of functionalities (GUI related) rely on this one
var layers = [
    /*new ol.layer.Tile({
     extent: [-13884991, 2870341, -7455066, 6338219],
     source: new ol.source.OSM()
     })*/
];
// The layers that are all using WMS
// I need this for fetching information to the geoserver
var layersWMS = [

];

// This will be the one responsible for identifying if the layer is
// of MySQL or not
var layersConfig = [
    
];

// The extent (or position) of a particular layer
// The same as above, this should not be touched
// since a lot of functionalities rely on this one
var layerExtents = [/*[-13884991, 2870341, -7455066, 6338219]*/];
var layerGeometry= [];

var layerCalls = [];

// The names of the layers as fetched in the GeoServer
// unlike the other two, this one is interchangeable
var layerNames = [/*"OpenStreetMaps"*/];

// This one obtains the layer info url. It resets everytime the user clicks
var layerInfoCallStack = [];

// The layer group array to be feeded to qgis2web.js
var group_newmap = "";
// The layer group array buffer, this one holds the current groups together
var group_layer_buffer = [];

// The layerList to be feeded to qgis2web
var layersList = [];

// This keeps track of the last image index loaded by coverageStoreList.php
// this is important so that we can ignore displaying information when user
// clicks on an image. Since it doesn't contain important data at all.
var imageLastIndex = -1;

// This fetches the coverages and datastores in the geoserver.
// Once it fetches the data, it will add those into the 3 arrays respectively.
// After that, it will group it using ol.layer.Group and then turn it into an
// array using the layerList which will be feeded into the qgis2web

// You can have many ol.layer.Groups but in my Proof of Concept, I only made
// one.
$.get("php/coverageStoreList.php", function (data) {
    var coverageStores = JSON.parse(data);
    for (var i = 0; i < coverageStores.dataStores.length; i++) {
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
        
        var config = {};
        config["name"] = store.name;
        config["type"] = "Raster";
        layersConfig.push(config);
        layerGeometry.push("Raster");
        layerExtents.push(store.extent);
        layerNames.push(store.name + " [Raster]");
        layers.push(layer);
        layersWMS.push(layer);
        layerCalls.push(serverString + '/geoserver/wms');
        group_layer_buffer.push(layer);
    }
    imageLastIndex = coverageStores.dataStores.length - 1;
    group_newmap = new ol.layer.Group({
        layers: group_layer_buffer,
        title: "Raster Images"
    });
    group_layer_buffer = [];
    layersList.push(group_newmap);
    $.get("php/dataStoreList.php", function (data) {
        var dataStores = JSON.parse(data);
        var stringNameSpace = "";
        
        for (var i = 0; i < dataStores.dataStores.length; i++) {
            var store = dataStores.dataStores[i];
            param = createTargetLayer(workspace, store.name);
            var currentNameSpace = store.name.split("_")[0];
            
            var layerWMS = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: serverString + '/geoserver/wms',
                    params: {'LAYERS': param, 'TILED': true},
                    serverType: 'geoserver',
                    transition: 0
                })
            });

            var layer = new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function (extent, z) {
                    console.log(z);
                    return serverString + '/geoserver/wfs?service=WFS&' +
                            'version=1.1.0&request=GetFeature&typename=' + z + '&' +
                            'outputFormat=application/json&srsname=EPSG:3857&' +
                            'bbox=' + extent.join(',') + ',EPSG:3857';
                }(store.extent, param),
                //strategy: ol.loadingstrategy.bbox
                strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ())
            });
            layerGeometry.push(layer);
            var config = {};
            config["name"] = store.name;
            config["type"] = store.type;
            config["group"]= currentNameSpace;
            
            var tmpVal= 0;
            if (stringNameSpace != currentNameSpace && stringNameSpace != "") {
                tmpVal = 1;
            }
            var urStr = serverString + '/geoserver/wfs?service=WFS&' +
                            'version=1.1.0&request=GetFeature&typename=' + param + '&' +
                            'outputFormat=application/json&srsname=EPSG:3857&' +
                            'bbox=' + bounds.join(',') + ',EPSG:3857';
            var cColor = groupColors[layersList.length + tmpVal - 1];
            var fColor = groupColorsFill[layersList.length + tmpVal - 1];
            
            var vector = new ol.layer.Vector({
                source: layer,
                style: new ol.style.Style({

                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color:cColor
                        }),
                        stroke: new ol.style.Stroke({
                            color: fColor,
                            width: 1
                        }),
                        radius: 5
                    }),

                    stroke: new ol.style.Stroke({
                        color: cColor,
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: fColor
                    }),
                    text: new ol.style.Text({
                        font: '12px Calibri,sans-serif',
                        fill: new ol.style.Fill({
                            color: fColor
                        }),
                        stroke: new ol.style.Stroke({
                            color: cColor,
                            width: 3
                        })
                    })
                })
            });

            layerExtents.push(store.extent);
            layerNames.push(store.name);
            layersConfig.push(config);
            layerCalls.push(urStr);
            layers.push(vector);
            layersWMS.push(layerWMS);
            
            if (stringNameSpace != currentNameSpace && stringNameSpace != "") {
                
                group_newmap = new ol.layer.Group({
                    layers: group_layer_buffer,
                    title: stringNameSpace
                });
                group_layer_buffer = [];
                layersList.push(group_newmap);
                stringNameSpace = currentNameSpace;
                group_layer_buffer.push(vector);
            }
            else if (stringNameSpace == "") {
                stringNameSpace = currentNameSpace;
                group_layer_buffer.push(vector);
            }
            else if (stringNameSpace == currentNameSpace) {
                group_layer_buffer.push(vector);
            }
            
            if (i + 1 == dataStores.dataStores.length) {
                group_newmap = new ol.layer.Group({
                    layers: group_layer_buffer,
                    title: stringNameSpace
                });
                group_layer_buffer = [];
                layersList.push(group_newmap);
            }
        }

        

        loadExternalJavascript("./webinterface/target/resources/qgis2web.js");
        loadExternalJavascript("./webinterface/target/resources/Autolinker.min.js");
        loadExternalJavascript("js/marker.js");
        initializeLayerList();
        setLayerZIndex();
    });
});

