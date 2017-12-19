var layers = [
    
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
      ];

var group_newmap = new ol.layer.Group({
                                //layers: [lyr_1,lyr_7,lyr_2,lyr_3,lyr_4,lyr_5,lyr_6,lyr_8,lyr_9,lyr_10,lyr_11,lyr_12,lyr_13,lyr_14],
                                layers: layers,
                                title: "newmap"});

lyr_1.setVisible(true);lyr_7.setVisible(true);lyr_2.setVisible(true);lyr_3.setVisible(true);lyr_4.setVisible(true);lyr_5.setVisible(true);lyr_6.setVisible(true);lyr_8.setVisible(true);lyr_9.setVisible(true);lyr_10.setVisible(true);lyr_11.setVisible(true);lyr_12.setVisible(true);lyr_13.setVisible(true);lyr_14.setVisible(true);
var layersList = [group_newmap];
