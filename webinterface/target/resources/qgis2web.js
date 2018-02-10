// These variables are for keeping track of the current location
// idk if we will use this but I just kept it in here just in case
isTracking = false;
externalGeoLocate = "";

// If we use the location, it will point out a market. This is the
// market image to be used
yourLocation = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 1,
        src: 'assets/gps.png'
    }),
    text: new ol.style.Text({
        font: '15px Calibri,sans-serif',
        fill: new ol.style.Fill({color: '#fff'}),
        stroke: new ol.style.Stroke({
            color: 'red', width: 5
        }),
        text: 'You are here'
    })
});
/******************Location Tracking Initialization*******************/
// Uses the browser's built in Geolocation feature
geolocateControl = function (opt_options) {
    var options = opt_options || {};
    var button = document.createElement('button');
    button.className += ' fa fa-map-marker';
    var handleGeolocate = function () {

        if ((typeof (manualmode) !== "undefined" && manualmode == false) && typeof (geolocation.getPosition()) === "undefined") {
            var result = confirm("Sorry, this functionality will not work because your GPS is either turned off or not working. Would you like to turn on manual mode instead?");
            if (result) {
                manual();
            } else {
                throw "action canceled";
            }
        } else {
            if (isTracking) {
                //map.removeLayer(geolocateOverlay);
                isTracking = false;
            } else if (geolocation.getTracking()) {

                //map.addLayer(geolocateOverlay);
                if (typeof (manualmode) !== "undefined" && manualmode == true) {
                    map.getView().setCenter(manualcoords);
                } else {
                    map.getView().setCenter(geolocation.getPosition());
                }

                isTracking = true;
            } else if (typeof (manualmode) !== "undefined" && manualmode == true) {
                map.addLayer(geolocateOverlay);
                map.getView().setCenter(manualcoords);
                isTracking = true;

            }
        }


    };

    externalGeoLocate = handleGeolocate;
    button.addEventListener('click', handleGeolocate, false);
    button.addEventListener('touchstart', handleGeolocate, false);
    var element = document.createElement('div');
    element.className = 'geolocate ol-unselectable ol-control';
    element.appendChild(button);
    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(geolocateControl, ol.control.Control);

container = document.getElementById('popup');
content = document.getElementById('popup-content');
closer = document.getElementById('popup-closer');
closer.onclick = function () {
    container.style.display = 'none';
    closer.blur();
    return false;
};
overlayPopup = new ol.Overlay({
    element: container
});

expandedAttribution = new ol.control.Attribution({
    collapsible: false
});

/******************Route Tracking*******************/
determinant = false;
blockedGeom = [];
drawMap = function () {
    return determinant;
}

interaction = new ol.interaction.DragBox({
    condition: drawMap,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: [255, 0, 255, 1]
        })
    })
});

interaction.on('boxend', function (evt) {
    var geom = evt.target.getGeometry();
    var vectors = geom.B.slice();
    geom.B = vectors;
    console.log(geom);
    var feat = new ol.Feature({
        geometry: geom
    });

    var vect = [];
    for (var i = 0; i < vectors.length; i += 2) {
        vect.push([vectors[i], vectors[i + 1]]);
    }

    var testLayer = new ol.source.Vector({
        features: collection,
        useSpatialIndex: false // optional, might improve performance
    });

    var polygon = new ol.geom.Polygon([vect]);
    var feat = new ol.Feature({
        geometry: polygon
    });
    testLayer.addFeature(feat);

    // Do not remove this commented code. 
    // What this code does is that it loads the information
    // of the layer IF and only IF it is loaded using WMS.
    // ---- I might need it in the future.. hehe

    var isInside = false;
    layerInfoCallStack = [];
    targetFeature = [];
    $("#editBtn").css("display", "none");
    for (var i = 0; i < layerGeometry.length; i++) {

        if (layerGeometry[i] == "Raster") {
            targetFeature.push([]);
        } else {
            var features = layerGeometry[i].getFeatures();
            var searchRes = [];
            for (var j = 0; j < features.length; j++) {
                var obj = features[j];
                try {
                    var point2 = obj.H.geometry.B;
                    if (testLayer.getFeaturesAtCoordinate(point2).length > 0) {
                        searchRes.push(obj);
                        isInside = true;
                        if (layersConfig[i].type == "MySQL") {
                            $("#editBtn").css("display", "block");
                        }
                    }
                } catch (exception) {
                    console.log(exception);
                }
            }
            targetFeature.push(searchRes);
        }
    }

    testLayer.removeFeature(feat);
    if (isInside) {
        $("#infoContent").html(loadingBar1);
        $("#popupInfo").popup("open", {"transition": "flip"});
    }
    
    var names = [];
    var properties = [];
    var values = [];
    
    for (var i = 0; i < targetFeature.length; i++) {
        var info = targetFeature[i];
        for (var j = 0; j < info.length; j++) {
            var feat = info[j].H;
            names.push(info[j].f);
            var p = [];
            var v = [];
            for (prop in feat) {
                if (feat.hasOwnProperty(prop) && prop != "geometry") {
                    p.push(prop);
                    v.push(feat[prop]);
                }
            }
            properties.push(p);
            values.push(v);
        }
    }
    
    $("#infoContent").html(formatify(names, properties, values, "info"));
    $("#infoContent").enhanceWithin();
    

    //blockedGeom.push(vect);
    determinant = false;
});

hoverInteraction = new ol.interaction.Select({
  condition: ol.events.condition.pointerMove,
  multi: true
});

/******************OpenLayers Initialization*******************/
map = new ol.Map({
    controls: ol.control.defaults({attribution: false}).extend([
        expandedAttribution, new geolocateControl()
    ]),
    projection: 'EPSG:3857',
    target: document.getElementById('map'),
    renderer: 'canvas',
    overlays: [overlayPopup],
    layers: layersList,
    view: new ol.View({
        extent: bounds, maxZoom: 23, minZoom: 3
    })
});

map.addInteraction(interaction);
map.addInteraction(hoverInteraction);
map.getView().fit(bounds, map.getSize());

NO_POPUP = 0
ALL_FIELDS = 1

/**
 * Returns either NO_POPUP, ALL_FIELDS or the name of a single field to use for
 * a given layer
 * @param layerList {Array} List of ol.Layer instances
 * @param layer {ol.Layer} Layer to find field info about
 */
getPopupFields = function (layerList, layer) {
    // Determine the index that the layer will have in the popupLayers Array,
    // if the layersList contains more items than popupLayers then we need to
    // adjust the index to take into account the base maps group
    var idx = layersList.indexOf(layer) - (layersList.length - popupLayers.length);
    return popupLayers[idx];
}

vectorSource = new ol.source.Vector({
    features: collection,
    useSpatialIndex: false // optional, might improve performance
});

collection = new ol.Collection();
featureOverlay = new ol.layer.Vector({
    map: map,
    source: vectorSource,
    style: [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#f00',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.1)'
            }),
        })],
    updateWhileAnimating: true, // optional, for instant visual feedback
    updateWhileInteracting: true // optional, for instant visual feedback
});

doHighlight = false;
doHover = false;

highlight;

/******************OpenLayer Events*******************/
onPointerMove = function (evt) {
    if (!doHover && !doHighlight) {
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupField;
    var popupText = '';
    var currentFeature;
    var currentLayer;
    var currentFeatureKeys;
    
    map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        // We only care about features from layers in the layersList, ignore
        // any other layers which the map might contain such as the vector
        // layer used by the measure tool
        if (layersList.indexOf(layer) === -1) {
            return;
        }
        currentFeature = feature;
        currentLayer = layer;
        currentFeatureKeys = currentFeature.getKeys();
        var doPopup = false;
        for (k in layer.get('fieldImages')) {
            if (layer.get('fieldImages')[k] != "Hidden") {
                doPopup = true;
            }
        }
        if (doPopup) {
            popupText = '<table>';
            for (var i = 0; i < currentFeatureKeys.length; i++) {
                if (currentFeatureKeys[i] != 'geometry') {
                    popupField = '';
                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "inline label") {
                        popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</th><td>';
                    } else {
                        popupField += '<td colspan="2">';
                    }
                    if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "header label") {
                        popupField += '<strong>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + ':</strong><br />';
                    }
                    if (layer.get('fieldImages')[currentFeatureKeys[i]] != "Photo") {
                        popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? Autolinker.link(String(currentFeature.get(currentFeatureKeys[i]))) + '</td>' : '');
                    } else {
                        popupField += (currentFeature.get(currentFeatureKeys[i]) != null ? '<img src="images/' + currentFeature.get(currentFeatureKeys[i]).replace(/[\\\/:]/g, '_').trim() + '" /></td>' : '');
                    }
                    popupText = popupText + '<tr>' + popupField + '</tr>';
                }
            }
            popupText = popupText + '</table>';
        }
    });

    if (doHighlight) {
        if (currentFeature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (currentFeature) {
                var styleDefinition = currentLayer.getStyle().toString();

                if (currentFeature.getGeometry().getType() == 'Point') {
                    var radius = styleDefinition.split('radius')[1].split(' ')[1];

                    highlightStyle = new ol.style.Style({
                        image: new ol.style.Circle({
                            fill: new ol.style.Fill({
                                color: "#ffff00"
                            }),
                            radius: radius
                        })
                    })
                } else if (currentFeature.getGeometry().getType() == 'LineString') {

                    var featureWidth = styleDefinition.split('width')[1].split(' ')[1].replace('})', '');

                    highlightStyle = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#ffff00',
                            lineDash: null,
                            width: featureWidth
                        })
                    });

                } else {
                    highlightStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: '#ffff00'
                        })
                    })
                }
                featureOverlay.getSource().addFeature(currentFeature);
                featureOverlay.setStyle(highlightStyle);
            }
            highlight = currentFeature;
            
        }
    }

    if (doHover) {
        if (popupText) {
            overlayPopup.setPosition(coord);
            content.innerHTML = popupText;
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
            closer.blur();
        }
    }
};

onSingleClick = function (evt) {
    if (doHover) {
        return;
    }
    
    var coord = evt.coordinate;

    // Do not remove this commented code. 
    // What this code does is that it loads the information
    // of the layer IF and only IF it is loaded using WMS.
    // ---- I might need it in the future.. hehe

    var isInside = false;
    layerInfoCallStack = [];
    targetFeature = [];
    $("#editBtn").css("display", "none");
    
    /*for (var i = 0; i < layers.length; i++) {
        var source = layersWMS[i].getSource();
        var url = source.getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, view.getProjection(),
                {'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50});

        if (layerGeometry[i] == "Raster") {
            targetFeature.push([]);
        } else {
            targetFeature.push(doesIntersect([coord[0], coord[1]], layerGeometry[i]));
        }
        if (layerGeometry[i] != "Raster" && doesIntersect([coord[0], coord[1]], layerGeometry[i]).length > 0) {
            isInside = true;
            if (layersConfig[i].type == "Shapefile") {
                layerInfoCallStack.push(url);
            } else if (layersConfig[i].type == "MySQL") {
                layerInfoCallStack.push(url);
                $("#editBtn").css("display", "block");
            }

        }
    }*/
    
    for (var i = 0; i < layerGeometry.length; i++) {
        if (typeof(layerGeometry[i]) !== "string") {
            
            var features = doesIntersect([coord[0], coord[1]], layerGeometry[i]);
            var searchRes = [];
            if (features.length > 0) {
                if (layersConfig[i].type == "MySQL") {
                    $("#editBtn").css("display", "block");
                }
                isInside = true;
            }
            
            targetFeature = targetFeature.concat(features);
        }   
    }

    if (isInside) {
        $("#infoContent").html(loadingBar1);
        $("#popupInfo").popup("open", {"transition": "flip"});
    }

    /*$.post("php/infoLister.php", {"data": btoa(JSON.stringify(layerInfoCallStack))}, function (data) {
        var txtStr = "";
        
        var names = [];
        var properties = [];
        var values = [];
        
        for (var i = 0; i < data.info.length; i++) {
            var info = data.info[i];
            if (typeof (info.features[0]) !== "undefined") {
                if (info.features[0].geometry != null) {
                    names.push(info.features[0].id);
                    var p = [];
                    var v = [];
                    
                    for (prop in info.features[0].properties) {
                        if (info.features[0].properties.hasOwnProperty(prop)) {
                            p.push(prop);
                            v.push(info.features[0].properties[prop]);
                        }
                    }
                    
                    properties.push(p);
                    values.push(v);
                }
            }
        }
        
        //$("#infoContent").html(txtStr);
        $("#infoContent").html(formatify(names, properties, values, "info"));
        $("#infoContent").enhanceWithin();
    }, "JSON");*/
    
    var names = [];
    var properties = [];
    var values = [];
    
    for (var i = 0; i < targetFeature.length; i++) {
        var info = targetFeature[i];
        var feat = info.H;
        names.push(info.f);
        var p = [];
        var v = [];
        for (prop in feat) {
            if (feat.hasOwnProperty(prop) && prop != "geometry") {
                p.push(prop);
                v.push(feat[prop]);
            }
        }
        properties.push(p);
        values.push(v);
    }
    
    $("#infoContent").html(formatify(names, properties, values, "info"));
    $("#infoContent").enhanceWithin();

    if (false) {
        overlayPopup.setPosition(coord);
        content.innerHTML = "WEW";
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        closer.blur();
    }
};



map.on('pointermove', function (evt) {
    onPointerMove(evt);
    var coord = evt.coordinate;
    var doPopup = false;
    var targetFeature = [];
    var contStr = "";
    
    for (var i = 0; i < layerGeometry.length; i++) {
        if (typeof(layerGeometry[i]) !== "string") {
            
            var features = doesIntersect([coord[0], coord[1]], layerGeometry[i]);
            var searchRes = [];
            if (features.length > 0) {
                doPopup = true;
            }
            
            targetFeature = targetFeature.concat(features);
        }   
    }
    
    contStr += "<p>Feature Count: " + targetFeature.length + "</p>\n";
    contStr += "<ul>\n";
    for (var i = 0; i < targetFeature.length; i++) {
        var info = targetFeature[i];
        var feat = info.H;
        var name = info.f;
        contStr += "\t<li>" + name + "</li>\n";
    }
    contStr += "</ul>";
    
    if (doPopup) {
        overlayPopup.setPosition(coord);
        content.innerHTML = contStr;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        closer.blur();
    }
});
map.on('singleclick', function (evt) {
    onSingleClick(evt);
});



geolocation = new ol.Geolocation({
    projection: map.getView().getProjection()
});


accuracyFeature = new ol.Feature();
geolocation.on('change:accuracyGeometry', function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
            color: '#3399CC'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
        })
    })
}));

geolocation.on('change:position', function () {
    var coordinates = null;
    if (typeof (manualmode) !== "undefined" && manualmode == true) {
        coordinates = manualcoords;
    } else {
        coordinates = geolocation.getPosition();
    }

    positionFeature.setGeometry(new ol.geom.Point(coordinates));
});

geolocateOverlay = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [accuracyFeature, positionFeature]
    })
});

geolocation.setTracking(true);

if ($.urlParam("settings") != null) {
    var settings = JSON.parse(atob($.urlParam("settings")));
    map.getView().setCenter(settings.coords);
    map.getView().setZoom(settings.zoomLvl);
}

/*
 * This part of over here can be edited to change the text display on the bottom right corner
 of the app.
 */

var attribution = document.getElementsByClassName('ol-attribution')[0];
var attributionList = attribution.getElementsByTagName('ul')[0];
var firstLayerAttribution = attributionList.getElementsByTagName('li')[0];
var qgis2webAttribution = document.createElement('li');
qgis2webAttribution.innerHTML = '<p>Datadeploy Prototype Alpha (Phase 2)</p>';
attributionList.insertBefore(qgis2webAttribution, firstLayerAttribution);
$(".loadModal").css("display", "none")
