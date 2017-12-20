// This .js file is meant for adding markers to
// OpenLayers. I kept it seperated  because whenever
// we change engines, we don't need to re-add each
// markers. Awesome right?

events = [];
_Event = function(name, desc, img, coord, start, end) {
    this.name = name;
    this.desc = desc;
    this.img  = img;
    this.coordinates = coord;
    this.startDate = start;
    this.endDate = end;
}

_EventHandle = function(name, callback) {
    this.name = name;
    this.function = callback;
}

iconEventsList   = [];
wgs84Sphere= new ol.Sphere(6378137);

roadIconStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: 'assets/roadwatch-marker.png'
    }),
    text: new ol.style.Text({
        font: '15px Calibri,sans-serif',
        fill: new ol.style.Fill({ color: '#fff' }),
        stroke: new ol.style.Stroke({
            color: '#044c27', width: 5
        }),
        text: 'Sample Marker'
    })
});

speedStarStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: 'assets/speedstar-marker.png'
    }),
    text: new ol.style.Text({
        font: '15px Calibri,sans-serif',
        fill: new ol.style.Fill({ color: '#fff' }),
        stroke: new ol.style.Stroke({
            color: '#044c27', width: 5
        }),
        text: 'Sample Marker 2'
    })
});

/*
 * This method initMaps() will be called to initialize the markers
 * The geom.Point coordinates are determined from the map.onclick event
 * just below this method. We cannot rely the coordinates from GPS since
 * we are using global gps coordinates that QGIS created for us. Although
 * IDK if there is a way to rechange that to rely on local coordinates
 *
 
  === [ How to add a new marker ] ==
 
  1. Create a new icon style, you can copy paste the roadIconStyle variable above and change the values of
     src (which is the location image of the marker) and text (which is the text of the marker) to their appropriate values
  2. Then add another feature inside the initMaps() method which you can also copypaste the feature variable inside of this method
     As long as that newly created variable is inserted in the vectorSource using the vectorSource.addFeature method!
  3. Then create another event inside the iconEventsList which has the name and function properties 
     (make sure that the name matches the name of the feature text, capitalization matters here!)
  4. Inside the function property, add the appropriate event. In my case, the sampleMarkerEvent() is located in the js/info.js
     script. I provided it for template purposes
*/

initMaps = function() {
	
	// First marker
	
	/*var feature = new ol.Feature(
        new ol.geom.Point([13983527.690297138, 792050.3018172664])
    );
	feature.setStyle(roadIconStyle);
    vectorSource.addFeature(feature);
    
    // Second marker
    
    var feature2 = new ol.Feature(
        new ol.geom.Point([13983527.690297138, 792550.3018172664])
    );
	feature2.setStyle(speedStarStyle);
    vectorSource.addFeature(feature2);
    
    // You can follow the pattern if u want


    iconEventsList = [
        {
            name: "Sample Marker",
            function: function() {
                sampleMarkerEvent();
            }
        },
        
        {
            name: "Sample Marker 2",
            function: function() {
                anotherSampleMarkerEvent();
            }
        }
        
        // Follow the pattern if u want
    ];*/
};

initMaps();

/*
 * This is a modification of the default QGIS module. The codes below is meant for adding support for manual locations.
 * I'm not going to explain anything here since there is no need for modification for this one.
 */

manualselect = false;
manualcoords = false;
manualmode   = false;
selectMode   = false;
selectCoord  = false;


manual = function() {
    $( "#closeArea" ).dialog( "close" );
    alert("Please click on the map for a new location. You will be informed if you set it up properly, If ever you made an incorrect highlight. Please go to the settings menu located on the top left corner of the screen");
    manualselect = true;
}

lastcoords = [0, 0];
locationFeature = null;

compareCoords = function(c1, c2) {

    if (c1[0] == c2[0] && c1[1] == c2[1]) {
        return true;
    }

    return false;
}

getCurrentCoords = function() {
  
  var currentcoords = [0,0];
  
  if (manualmode) {
      currentcoords = manualcoords;
  }
  else {
      currentcoords = geolocation.getPosition();
  }
  
  return currentcoords;
}

circleFeature = null;
drawnFeature  = [];
lastBlockGeomLength = 0;
updatedBox = false;
removeDrawnFeature = function(index) {
  vectorSource.removeFeature(drawnFeature[index]);
  drawnFeature.splice(index, 1);
  blockedGeom.splice(index, 1);
  updatedBox = true;
}

clearDrawnFeature = function(){
  for (var i = blockedGeom.length - 1; i >= 0; i--) {
    try{
      vectorSource.removeFeature(drawnFeature[i]);
      drawnFeature.pop();
    }
    catch(ex){
      
    }
  }
  blockedRoutes = [];
}

setInterval(function(){
    
    var currentcoords;
    if (manualmode) {
        currentcoords = manualcoords;
    }
    else {
        currentcoords = geolocation.getPosition();
    }
    
    if (blockedGeom.length != lastBlockGeomLength || updatedBox) {
      lastBlockGeomLength = blockedGeom.length;
      updatedBox = false;
      clearDrawnFeature();
      for (var i = 0; i < blockedGeom.length; i++) {
        var obj = blockedGeom[i].slice();
        for (var j = 0; j < obj.length; j++) {
          obj[j] = utils.to4326(obj[j]);
        }
        blockedRoutes.push([obj]);
        var polygon = new ol.geom.Polygon([blockedGeom[i]]);
        var feat = new ol.Feature({
            geometry: polygon
        });
        vectorSource.addFeature(feat);
        drawnFeature.push(feat);
      }
    }

    if (!compareCoords(currentcoords, lastcoords)) {
        
        if (circleFeature != null) {
          vectorSource.removeFeature(circleFeature);
        }
        var circle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 180,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'rgba(255,0,0,0.6)',
                    width: 3
                })
            })
        });
        
        circleFeature = new ol.Feature(
            new ol.geom.Point(currentcoords)
        );
        circleFeature.setStyle(circle);
        vectorSource.addFeature(circleFeature);
        
        if (locationFeature != null) {
            vectorSource.removeFeature(locationFeature);
        }

        locationFeature = new ol.Feature(
            new ol.geom.Point(currentcoords)
        );
        locationFeature.setStyle(yourLocation);
        vectorSource.addFeature(locationFeature);

        lastcoords = currentcoords;
        
    }

}, 2000);

points = [],
    url_osrm_nearest = '//router.project-osrm.org/nearest/v1/driving/',
    url_osrm_route = '//router.project-osrm.org/route/v1/driving/',
    icon_url = 'assets/marker.png',
    vectorLayer = new ol.layer.Vector({
      source: 		vectorSource
    }),
    styles = {
      route: new ol.style.Style({
        stroke: new ol.style.Stroke({
          width: 6, color: [40, 40, 40, 0.8]
        })
      }),
      icon: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: icon_url
        })
      })
    };
    
routeFeature = null;
    
utils = {
  getNearest: function(coord1, coord2){
    var coord4326 = utils.to4326(coord1);    
    return new Promise(function(resolve, reject) {
      //make sure the coord is on street
      fetch(url_osrm_nearest + coord4326.join()).then(function(response) { 
        // Convert to JSON
        return response.json();
      }).then(function(json) {
        if (json.code === 'Ok') resolve(json.waypoints[0].location);
        else reject();
      });
    });
  },
  createFeature: function(coord) {
    var feature = new ol.Feature({
      type: 'place',
      geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
    });
    feature.setStyle(styles.icon);
    //vectorSource.addFeature(feature);
  },
  createRoute: function(polyline) {
    
    // route is ol.geom.LineString
    
    var route = new ol.format.Polyline({
      factor: 1e5
    }).readGeometry(polyline, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    
    if (routeFeature != null) {
      vectorSource.removeFeature(routeFeature);
    }
    
    routeFeature = new ol.Feature({
      type: 'route',
      geometry: route
    });
    
    routeFeature.setStyle(styles.route);
    vectorSource.addFeature(routeFeature);
    
  },
  to4326: function(coord) {
    return ol.proj.transform([
      parseFloat(coord[0]), parseFloat(coord[1])
    ], 'EPSG:3857', 'EPSG:4326');
  }
};

createRoute = function(p1, p2) {
  p1 = utils.to4326(p1);
  p2 = utils.to4326(p2);
  
  var point1 = p1.join();
  var point2 = p2.join();
  
  fetch(url_osrm_route + point1 + ';' + point2).then(function(r) { 
    return r.json();
  }).then(function(json) {
    if(json.code !== 'Ok') {
      //msg_el.innerHTML = 'No route found.';
      return;
    }
    //msg_el.innerHTML = 'Route added';
    //points.length = 0;
    utils.createRoute(json.routes[0].geometry);
  });
}



map.on('click', function(evt){
    console.log(utils.to4326(evt.coordinate));
    if (manualselect) {
        manualselect = false;
        manualcoords = evt.coordinate;
        manualmode   = true;
        alert("I have now set that location as the base location for my search");
    }

    if (selectMode) {
        selectCoord = evt.coordinate;
        selectMode = false;
        dialog.showModal();
        //$("#eventCoord").html("Coordinate:<h5>Longitude:</h5> " + evt.coordinate[0] + "<h5>Latitude:</h5> " + evt.coordinate[1]);
        $("#eventCoord").html("Coordinate: " + evt.coordinate[0].toFixed(2) + ", " + evt.coordinate[1].toFixed(2));
    }

    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        for (var i = 0; i < iconEventsList.length; i++) {
            if (feature.getStyle().getText().H == iconEventsList[i].name) {
                iconEventsList[i].function();
                break;
            }
        }
    })
})

