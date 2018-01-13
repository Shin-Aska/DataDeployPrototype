/* 	Functionalities is where I put all of the UI functionalities, such as manipulating the OpenLayers, loading data from
 a Geoserver, Zooming to.. so on and so forth   
 */

/*
 Configuration parameters here
 */
var serverString = "http://localhost:8080";
var hostString = "http://localhost/DataDeployPrototype";
var workspace = "cite";

var createTargetLayer = function (ws, ds) {
    return ws + ":" + ds;
}

// Needed to load javascript files on the fly
// since certain elements need to be dynamically loaded

var loadExternalJavascript = function (dir) {
    $.ajax({
        type: "GET",
        dataType: "text",
        timeout: 30000,
        cache: false,
        url: dir,
        success: function (data) {
            eval(data);
        }
    });
}

var doesIntersect = function (coord, geometry) {
    var iResult = geometry.getFeaturesAtCoordinate(coord);
    if (iResult.length == 0) {
        var features = geometry.getFeatures();
        iResult = [];
        for (var i = 0; i < features.length; i++) {
            var obj = features[i];
            var point2 = obj.H.geometry.B;

            var diffx = coord[0] - point2[0];
            var diffy = coord[1] - point2[1];
            diffx *= diffx;
            diffy *= diffy;
            var diff = Math.sqrt(diffx + diffy);
            if (diff <= 10) {
                iResult.push(obj);
            }
        }
    }
    return iResult;
}

/***************--OpenLayers Functionalities--*********************/


// This adds a new layer to the app. This is a bit different
// than layers.js which adds layers along with our PHP code
var addNewLayer = function(url, mode, ws, datastore, extStr) {
    var buffer = [];
    var newGroup = "";
    var totalString = "";
    if (mode == "WMS") {
        var param = createTargetLayer(ws, datastore);
        
        var layer = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: url,
                params: {'LAYERS': param, 'TILED': true},
                serverType: 'geoserver',
                transition: 0
            })
        });
        
        var config = {};
        config["name"] = datastore;
        config["type"] = "WFS Raster";
        layersConfig.push(config);
        layerGeometry.push("Raster");
        layerExtents.push(JSON.parse(extStr));
        layerNames.push(datastore + " [External Raster]");
        layers.push(layer);
        layersWMS.push(layer);
        layerCalls.push(url);
        buffer.push(layer);
        
        newGroup = new ol.layer.Group({
            layers: buffer,
            title: param + " [WMS - EXTERNAL]"
        });
        
        var i = layerNames.length - 1;
        totalString += "<div id='contentItem" + (i + 1) + "'>";
        totalString += "  <div> <!-- item " + (i + 1) + " -->";
        totalString += '     <input class="originalValue" type="text" value="' + (i) + '" style="display: none;"  readonly></input>';
        totalString += '     <p onclick=\'toggleInfo("item' + (i + 1) + '")\' class="infoCircle"><i class="fa fa-info-circle" aria-hidden="true"></i></p>';
        totalString += '     <a id="popupItem' + (i + 1) + '" href="#popupMenu" data-rel="popup" data-transition="slideup" class="moreOptions"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>';
        totalString += '     <label for="checkbox-' + (i + 1) + '">';
        totalString += '         ' + layerNames[i] + ' ';
        totalString += '      </label>';
        totalString += '     <input type="checkbox" name="checkbox-' + (i + 1) + '" id="checkbox-' + (i + 1) + '" checked>';
        totalString += "  </div>";

        totalString += '  <div class="toggler">';
        totalString += '    <div id="item' + (i + 1) + '" class="ui-widget-content ui-corner-all hiddenAtFirst">';
        totalString += '      <h3 class="ui-widget-header ui-corner-all">Toggle</h3>';
        totalString += '      <p>';
        totalString += '         Etiam libero neque, luctus a, eleifend nec, semper at, lorem. Sed pede. Nulla lorem metus, adipiscing ut, luctus sed, hendrerit vitae, mi.';
        totalString += '      </p>';
        totalString += '    </div>';
        totalString += '  </div>';
        totalString += '</div>';
        for (var a = 0; a < layerNames.length - 1; a++) {
            $("#checkbox-" + (a+1)).checkboxradio("destroy");
        }
        $("#individualFields").html($("#individualFields").html() + totalString);
        $("#contentItem" + (i + 1)).enhanceWithin();
        
        for (var a = 0; a < layerNames.length - 1; a++) {
            $("#checkbox-" + (a+1)).checkboxradio();
                $("#popupItem" + (a + 1)).click((function (id) {
                return function () {
                    setMoveTarget(id);
                }
            }(a)));
            
            $("#checkbox-" + (a+1)).change((function (id) {
                return function () {
                    layerAction(id);
                }
            }(a+1)));
        }
        
        $("#popupItem" + (i + 1)).click((function (id) {
            return function () {
                setMoveTarget(id);
            }
        }(i)));
        
        $("#checkbox-" + (i+1)).change((function (id) {
            return function () {
                layerAction(id);
            }
        }(i+1)));
    }
    else {
        
        var param = createTargetLayer(ws, datastore);
        
        var layerWMS = null;
        
        var config = {};

        var layer = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: url
        });
        
        layerGeometry.push(layer);
        var config = {};
        config["name"] = datastore;
        config["type"] = "GeoJSON";
        

        var urStr  = url;
        var cColor = groupColors[layersList.length];
        var fColor = groupColorsFill[layersList.length];
        
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

        layerExtents.push(JSON.parse(extStr));
        layerNames.push(datastore + " [External GeoJSON]");
        layersConfig.push(config);
        layerCalls.push(urStr);
        layers.push(vector);
        layersWMS.push(layerWMS);
        
        buffer.push(vector);
        
        newGroup = new ol.layer.Group({
            layers: buffer,
            title: param + " [GeoJSON - EXTERNAL]"
        });
        
        var i = layerNames.length - 1;
        totalString += "<div id='contentItem" + (i + 1) + "'>";
        totalString += "  <div> <!-- item " + (i + 1) + " -->";
        totalString += '     <input class="originalValue" type="text" value="' + (i) + '" style="display: none;"  readonly></input>';
        totalString += '     <p onclick=\'toggleInfo("item' + (i + 1) + '")\' class="infoCircle"><i class="fa fa-info-circle" aria-hidden="true"></i></p>';
        totalString += '     <a id="popupItem' + (i + 1) + '" href="#popupMenu" data-rel="popup" data-transition="slideup" class="moreOptions"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>';
        totalString += '     <label for="checkbox-' + (i + 1) + '">';
        totalString += '         ' + layerNames[i] + ' ';
        totalString += '      </label>';
        totalString += '     <input type="checkbox" name="checkbox-' + (i + 1) + '" id="checkbox-' + (i + 1) + '" checked>';
        totalString += "  </div>";

        totalString += '  <div class="toggler">';
        totalString += '    <div id="item' + (i + 1) + '" class="ui-widget-content ui-corner-all hiddenAtFirst">';
        totalString += '      <h3 class="ui-widget-header ui-corner-all">Toggle</h3>';
        totalString += '      <p>';
        totalString += '         Etiam libero neque, luctus a, eleifend nec, semper at, lorem. Sed pede. Nulla lorem metus, adipiscing ut, luctus sed, hendrerit vitae, mi.';
        totalString += '      </p>';
        totalString += '    </div>';
        totalString += '  </div>';
        totalString += '</div>';

        for (var a = 0; a < layerNames.length - 1; a++) {
            $("#checkbox-" + (a+1)).checkboxradio("destroy");
        }
        $("#individualFields").html($("#individualFields").html() + totalString);
        $("#contentItem" + (i + 1)).enhanceWithin();
        
        for (var a = 0; a < layerNames.length - 1; a++) {
            $("#checkbox-" + (a+1)).checkboxradio();
            $("#popupItem" + (a + 1)).click((function (id) {
                return function () {
                    setMoveTarget(id);
                }
            }(a)));
            
            $("#checkbox-" + (a+1)).change((function (id) {
                return function () {
                    layerAction(id);
                }
            }(a+1)));
        }
        
        $("#popupItem" + (i + 1)).click((function (id) {
            return function () {
                setMoveTarget(id);
            }
        }(i)));
        
        $("#checkbox-" + (i+1)).change((function (id) {
            return function () {
                layerAction(id);
            }
        }(i+1)));
        
    }
    map.addLayer(newGroup);
    layersList.push(newGroup);
    
    var i = layersList.length - 1;
    totalString = "";
    totalString += "<div id='gcontentItem" + (i + 1) + "'>";
    totalString += "  <div> <!-- item " + (i + 1) + " -->";
    totalString += '     <input class="originalValue" type="text" value="' + (i) + '" style="display: none;"  readonly></input>';
    totalString += '     <a id="gpopupItem' + (i + 1) + '" href="#gpopupMenu" data-rel="popup" data-transition="slideup" class="moreOptions"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>';
    totalString += '     <label for="gcheckbox-' + (i + 1) + '">';
    totalString += '         ' + layersList[i].H.title + ' ';
    totalString += '      </label>';
    totalString += '     <input type="checkbox" name="gcheckbox-' + (i + 1) + '" id="gcheckbox-' + (i + 1) + '" checked>';
    totalString += "  </div>";

    for (var a = 0; a < layersList.length - 1; a++) {
        $("#gcheckbox-" + (a+1)).checkboxradio("destroy");
    }
    $("#groupFields").html($("#groupFields").html() + totalString);
    $("#gcontentItem" + (i + 1)).enhanceWithin();
    for (var a = 0; a < layersList.length - 1; a++) {
        $("#gcheckbox-" + (a+1)).checkboxradio();
        $("#gpopupItem" + (a + 1)).click((function (id) {
            return function () {
                gsetMoveTarget(id);
            }
        }(a)));
        
        $("#gcheckbox-" + (a+1)).change((function (id) {
            return function () {
                glayerAction(id);
            }
        }(a+1)));
    }

    $("#gpopupItem" + (i + 1)).click((function (id) {
        return function () {
            gsetMoveTarget(id);
        }
    }(i)));
    
    $("#gcheckbox-" + (i+1)).change((function (id) {
        return function () {
            glayerAction(id);
        }
    }(i+1)));
    
}

// This method here enables/disables a particular
// layer by turning on and off its visibility

var reloadMySQLLayers = function () {
    for (var i = 0; i < layerGeometry.length; i++) {
        if (layersConfig[i].type == "MySQL") {
            layerGeometry[i].clear();
        }
    }
}

var layerAction = function (id) {
    var sValue = $("#checkbox-" + id).prop("checked");
    layers[parseInt(id) - 1].setVisible(sValue);
}

var glayerAction = function (id) {
    var sValue = $("#gcheckbox-" + id).prop("checked");
    layersList[parseInt(id) - 1].setVisible(sValue);
}

// This variable is the key to make the sidebar layerlist work
var targetContent = -1;
var gTargetContent = -1;

// The renderer is basically targeted to the layer lists
// It's a bit too tricky to implement. I wanted to use Jquery
// but IE doesnt like it so i had to do it in DOM
var renderMode = "i";
var updateRenderer = function () {
    if (renderMode == "i") {
        //$("#individualFields").css("display", "block");
        //$("#groupFields").css("cssText", "display: none !important");
        document.getElementById("individualFields").style.cssText = "display: block";
        document.getElementById("groupFields").style.cssText = "display: none !important";
    } else {
        //$("#individualFields").css("cssText", "display: none !important");
        //$("#groupFields").css("display", "block");
        
        document.getElementById("individualFields").style.cssText = "display: none !important";
        document.getElementById("groupFields").style.cssText = "display: block";
    }
}

// Once the web app is finished fetching data to the Geoserver,
// it will generate a list of elements to the sidebar using this method
// Also while its generating.. The Layers will set their ZIndexes base on the
// position it was fetched on the geoserver.
// This also includes now the groups using the namespaces (first name before the underscore)

var initializeLayerList = function () {

    var totalString = "";
    for (var i = 0; i < layerNames.length; i++) {
        totalString += "<div id='contentItem" + (i + 1) + "'>";
        totalString += "  <div> <!-- item " + (i + 1) + " -->";
        totalString += '     <input class="originalValue" type="text" value="' + (i) + '" style="display: none;"  readonly></input>';
        totalString += '     <p onclick=\'toggleInfo("item' + (i + 1) + '")\' class="infoCircle"><i class="fa fa-info-circle" aria-hidden="true"></i></p>';
        totalString += '     <a id="popupItem' + (i + 1) + '" href="#popupMenu" data-rel="popup" data-transition="slideup" class="moreOptions"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>';
        totalString += '     <label for="checkbox-' + (i + 1) + '">';
        totalString += '         ' + layerNames[i] + ' ';
        totalString += '      </label>';
        totalString += '     <input type="checkbox" name="checkbox-' + (i + 1) + '" id="checkbox-' + (i + 1) + '" checked>';
        totalString += "  </div>";

        totalString += '  <div class="toggler">';
        totalString += '    <div id="item' + (i + 1) + '" class="ui-widget-content ui-corner-all hiddenAtFirst">';
        totalString += '      <h3 class="ui-widget-header ui-corner-all">Toggle</h3>';
        totalString += '      <p>';
        totalString += '         Etiam libero neque, luctus a, eleifend nec, semper at, lorem. Sed pede. Nulla lorem metus, adipiscing ut, luctus sed, hendrerit vitae, mi.';
        totalString += '      </p>';
        totalString += '    </div>';
        totalString += '  </div>';
        totalString += '</div>';
    }

    $("#operationalLayer").after(totalString);
    $("#individualFields").enhanceWithin();

    for (var i = 0; i < layerNames.length; i++) {
        $("#popupItem" + (i + 1)).click((function (id) {
            return function () {
                setMoveTarget(id);
            }
        }(i)));
        
        $("#checkbox-" + (i+1)).change((function (id) {
            return function () {
                layerAction(id);
            }
        }(i+1)));
    }

    totalString = "";
    for (var i = 0; i < layersList.length; i++) {
        totalString += "<div id='gcontentItem" + (i + 1) + "'>";
        totalString += "  <div> <!-- item " + (i + 1) + " -->";
        totalString += '     <input class="originalValue" type="text" value="' + (i) + '" style="display: none;"  readonly></input>';
        totalString += '     <a id="gpopupItem' + (i + 1) + '" href="#gpopupMenu" data-rel="popup" data-transition="slideup" class="moreOptions"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></a>';
        totalString += '     <label for="gcheckbox-' + (i + 1) + '">';
        totalString += '         ' + layersList[i].H.title + ' ';
        totalString += '      </label>';
        totalString += '     <input type="checkbox" name="gcheckbox-' + (i + 1) + '" id="gcheckbox-' + (i + 1) + '" checked>';
        totalString += "  </div>";
    }


    $("#groupOpsLayer").after(totalString);
    $("#groupFields").enhanceWithin();

    for (var i = 0; i < layerNames.length; i++) {
        $("#gpopupItem" + (i + 1)).click((function (id) {
            return function () {
                gsetMoveTarget(id);
            }
        }(i)));
        
        $("#gcheckbox-" + (i+1)).change((function (id) {
            return function () {
                glayerAction(id);
            }
        }(i+1)));
    }

    updateRenderer();
}

// Sets the ZIndex of the Geoserver
var setLayerZIndex = function () {
    for (var i = layers.length - 1; i >= 0; i--) {
        layers[i].setZIndex(i + 1);
    }
}

// Sets all of the layers to turn on
var setLayersAllOn = function () {
    for (var i = 0; i < layerNames.length; i++) {
        $("#checkbox-" + (i + 1)).prop("checked", true).checkboxradio("refresh");
        layers[i].setVisible(true);
    }
    $("#popupGeneral").popup("close");
}

// Sets all of the layers in a particular group to turn on
var gsetLayersAllOn = function () {
    for (var i = 0; i < layersList.length; i++) {
        $("#gcheckbox-" + (i + 1)).prop("checked", true).checkboxradio("refresh");
        layersList[i].setVisible(true);
    }
    $("#gpopupGeneral").popup("close");
}


// Sets all of the layers to turn off
var setLayersAllOff = function () {
    for (var i = 0; i < layerNames.length; i++) {
        $("#checkbox-" + (i + 1)).prop("checked", false).checkboxradio("refresh");
        layers[i].setVisible(false);
    }
    $("#popupGeneral").popup("close");
}

// Sets all of the layers in a group to turn off
var gsetLayersAllOff = function () {
    for (var i = 0; i < layersList.length; i++) {
        $("#gcheckbox-" + (i + 1)).prop("checked", false).checkboxradio("refresh");
        layersList[i].setVisible(false);
    }
    $("#gpopupGeneral").popup("close");
}

// Moves the layer down in the list,
// the way i made this work is by switching HTML DOM elements on the fly
// while also switching certain array values (See webinterface/target/layers/layers.js)
// making it seem like they actually switched places.
var moveLayerDown = function (id) {

    var original = parseInt($("#contentItem" + (id + 1) + " > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)").val()) + 1;
    var original2 = parseInt($("#contentItem" + (id + 2) + " > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)").val()) + 1;

    if (id != layers.length - 1) {
        var tmp = layers[original2 - 1].getZIndex();
        layers[original2 - 1].setZIndex(layers[original - 1].getZIndex());
        layers[original - 1].setZIndex(tmp);

        tmp = layerNames[id];
        layerNames[id] = layerNames[id + 1];
        layerNames[id + 1] = tmp;
    }

    $("#checkbox-" + (original)).checkboxradio("destroy");
    $("#checkbox-" + (original2)).checkboxradio("destroy");

    $("#contentItem" + (id + 1)).swapWith("#contentItem" + (id + 2));

    $("#checkbox-" + (original)).checkboxradio();
    $("#checkbox-" + (original2)).checkboxradio();

    var tmp = $("#contentItem" + (id + 1)).attr("id");

    $("#contentItem" + (id + 1)).attr("id", $("#contentItem" + (id + 2)).attr("id"));
    $("#contentItem" + (id + 2)).attr("id", tmp);



    $("#popupItem" + (id + 1)).off("click");
    $("#popupItem" + (id + 2)).off("click");

    $("#popupItem" + (id + 2)).click((function (id) {
        return function () {
            setMoveTarget(id);
        }
    }(id)));

    $("#popupItem" + (id + 1)).click((function (id) {
        return function () {
            setMoveTarget(id);
        }
    }(id + 1)));

    tmp = $("#popupItem" + (id + 1)).attr("id");
    $("#popupItem" + (id + 1)).attr("id", $("#popupItem" + (id + 2)).attr("id"));
    $("#popupItem" + (id + 2)).attr("id", tmp);
}

// Moves the layer up in the list, I'm just reusing code.
var moveLayerUp = function (id) {
    moveLayerDown(id - 1);
}

/***************--GUI Functionalities--*********************/
// This method is called when the options button (The one with the [...] ellipses) is pressed or touched
// This will indicate which element is being referred to without going through some quirky hacks

function isURL(s) {
    s = s + "";
    return !!s.match(isURL.regex);
}
isURL.regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

function isDataURL(s) {
    s = s + "";
    return !!s.match(isDataURL.regex);
}
isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

function isArray(s) {
    try {
        var x = JSON.parse(s);
        if (x.length > 0)
            return true;
        return false;
    }
    catch (ex){
        return false;
    }
}

var connectNewLayer = function() {
    var ws = $("#layerWSTxtBox").val();
    var ds = $("#layerDSTxtBox").val();
    var lk = $("#layerLinkTxtBox").val();
    var et = $("#layerExtTxtBox").val();
    addNewLayer(lk, newLayerMode, ws, ds, et);
    $("#newLayerPage").popup("close");
    /*setTimeout(function(){
        $("#layerWSTxtBox").val("");
        $("#layerDSTxtBox").val("");
        $("#layerLinkTxtBox").val("");
        $("#layerExtTxtBox").val("");
    }, 500);*/
}

var formatify = function (names, properties, value, id) {
    var tabs = "";
    var placement = "";
    ftoggle = true;
    for (var i = 0; i < names.length; i++) {
        tabs += "<li><a href=\"#" + id + "-" + (i + 1) + "\" class=\"ui-btn-active\">" + names[i] + "</a></li>";
        var content = "";
        //content += '<div data-role="collapsibleset" data-theme="a" data-content-theme="a">';
        for (var j = 0; j < properties[i].length; j++) {

            content += "<div class=\"formatifyc\" data-role=\"collapsible\" data-collapsed=\"false\">" +
                    "        <h3>" + properties[i][j] + "</h3>";

            if (isURL(value[i][j])) {
                content += "<a target='_blank' href='" + value[i][j] + "'>" + value[i][j] + "</a>";
            } else if (isDataURL(value[i][j])) {
                content += "<img src='" + value[i][j] + "'>";
            } else if (isArray(value[i][j])) {
                var arr = JSON.parse(value[i][j]);
                for (var k = 0; k < arr.length; k++) {
                    if (isURL(arr[k])) {
                        content += "<a target='_blank' href='" + arr[k] + "'>" + arr[k] + "</a>";
                    }
                    else if (isDataURL(arr[k])) {
                        content += "<img src='" + arr[k] + "'>";
                    }
                    else {
                        content += "<p>" + arr[k] + "</p>";
                    }
                }
            }
            else {
                content += "<p>" + value[i][j] + "</p>";
            }
            content += "    </div>";
        }
        //content += '</div>'
        placement += "    <div id=\"" + id + "-" + (i + 1) + "\">" +
                content +
                "      </div>"
    }

    return "<button id=\"ffbut\" onclick=\"formatifytoggle()\">Hide all values</button><div role=\"main\" class=\"ui-content\">" +
            "   <div data-role=\"tabs\">" +
            "      <div data-role=\"navbar\">" +
            "        <ul>" +
            tabs +
            "        </ul>" +
            "      </div>" +
            placement +
            "       </div>" +
            "   </div>";
}

var ftoggle = true;
var formatifytoggle = function () {
    var fval = ftoggle ? "collapse" : "expand";
    var xval = !ftoggle ? "Hide all values" : "Show all values";
    $(".formatifyc").collapsible(fval);
    $("#ffbut").html(xval);
    ftoggle = !ftoggle;
}

var setMoveTarget = function (id) {
    targetContent = id;
    var original = parseInt($("#contentItem" + (id + 1) + " > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)").val());
    var type = layersConfig[original].type;
    
    $("#headerPopupMenu").html("Choose an action for " + layerNames[targetContent]);
    if (id == 0) {
        $("#actUp").css("display", "none");
        $("#actDown").css("display", "block");
    } else if (id == layers.length - 1) {
        $("#actUp").css("display", "block");
        $("#actDown").css("display", "none");
    } else {
        $("#actUp").css("display", "block");
        $("#actDown").css("display", "block");
    }

    if (id > imageLastIndex) {
        $("#showInfo").css("display", "block");
    } else {
        $("#showInfo").css("display", "none");
    }
    
    if (type == "GeoJSON" || type == "WFS Raster") {
        $("#showInfo").css("display", "none");
    }
    else {
        $("#showInfo").css("display", "block");
    }
    
    
}

var gsetMoveTarget = function (id) {
    gTargetContent = id;
    $("#headerPopupMenu").html("Choose an action for " + layersList[gTargetContent].H.title);
}

// Expands all layer informations
// Note: At the mean time this is just a dummy info but 
// we can easily change that
var expandAllLayers = function () {
    for (var i = 0; i < layerNames.length; i++) {
        toggleInfo("item" + (i + 1), "show");
    }
    $("#popupGeneral").popup("close");
}

// Collapses all layer informations
var collapseAllLayers = function () {
    for (var i = 0; i < layerNames.length; i++) {
        toggleInfo("item" + (i + 1), "hide");
    }
    $("#popupGeneral").popup("close");
}

// This method calls the moveLayerDown() using the concepts of the setMoveTarget()
var moveItemDown = function () {
    if (targetContent != -1) {
        moveLayerDown(targetContent);
    }
    $("#popupMenu").popup("close");
}

// This method calls the moveLayerUp() using the concepts of the setMoveTarget()
var moveItemUp = function () {
    if (targetContent != -1) {
        moveLayerUp(targetContent);
    }
    $("#popupMenu").popup("close");
}

// This pops up the transparency window
// The functionalities that makes this work is
var setTransparency = function () {
    $("#popupMenu").popup("close");
    setTimeout(function () {
        $("#popupTransparency").popup("open", {"transition": "flip"});
    }, 500);
    $("#popTargs").html("Modify transparency of layer " + layerNames[targetContent]);
}

var gsetTransparency = function () {
    $("#gpopupMenu").popup("close");
    setTimeout(function () {
        $("#gpopupTransparency").popup("open", {"transition": "flip"});
    }, 500);
    $("#gpopTargs").html("Modify transparency of layer " + layersList[gTargetContent].H.title);
}

// This moves the camera to fit on a particular layer
// It should belong to the OpenLayer's Functionalities but since it uses the concept of
// the setMoveTarget, i moved it here instead
var zoomTo = function () {
    map.getView().fit(layerExtents[targetContent], map.getSize());
    $("#popupMenu").popup("close");
}

var toGroup = function () {
    $("#popupGeneral").popup("close");
    renderMode = "g";
    updateRenderer();
}

var toIndividual = function () {
    $("#gpopupGeneral").popup("close");
    renderMode = "i";
    updateRenderer();
}

var addInformation = function () {
    var lon = $("#text-a").val();
    var lat = $("#text-b").val();
    var alt = $("#text-c").val();
    var loc = $("#text-d").val();
    var dev = $("#text-e").val();
    var dat = $("#text-f").val();
    var pat = $("#text-g").val();
    var pic = JSON.stringify(file64);
    var note = $("#text-i").val();

    $.post("php/addMySQLData.php",
            {"lon": lon, "lat": lat, "alt": alt, "loc": loc, "dev": dev, "dat": dat, "pat": pat, "pic": pic, "not": note},
            function () {
                $("#addLayer").popup("close");
                reloadMySQLLayers();
            });
}

var cancelAddInformation = function () {
    $("#addLayer").popup("close");
    base64 = [];
    elPreview.innerHTML = "";
}

var spawnEdit = function () {
    $("#popupInfo").popup("close");
    setTimeout(function () {
        $("#popupEditSelection").popup("open", {"transition": "flip"});
    }, 800);
    var txt = "";
    for (var i = 0; i < layersConfig.length; i++) {
        var cfg = layersConfig[i];
        if (cfg.type == "MySQL") {
            for (var j = 0; j < targetFeature[i].length; j++) {
                txt += "<button onclick='editFeature(" + i + "," + j + ")'>Edit " + targetFeature[i][j].f + "</button>";
            }
        }
    }
    $("#editSelect").html(txt);
    $("#editSelect").enhanceWithin();
}

var editId = -1;
var editFeature = function (i, j) {
    $("#popupEditSelection").popup("close");
    setTimeout(function () {
        $("#popupEdit").popup("open", {"transition": "flip"});
    }, 800);
    var feature = targetFeature[i][j].H;
    editId = feature.pointID;
    $("#etext-c").val(feature.altitude);
    $("#etext-d").val(feature.location);
    $("#etext-e").val(feature.devicetype);
    $("#etext-f").val(feature.date);
    $("#etext-g").val(feature.path);
    $("#etext-i").val(feature.note);
    $("#headingEdit").html("Edit Feature " + targetFeature[i][j].f);
}

var editInformation = function () {

    var id = editId;
    var alt = $("#etext-c").val();
    var loc = $("#etext-d").val();
    var dev = $("#etext-e").val();
    var dat = $("#etext-f").val();
    var pat = $("#etext-g").val();
    var pic = JSON.stringify(file64);
    var note = $("#etext-i").val();

    $.post("php/editMySQLData.php",
            {"id": id, "alt": alt, "loc": loc, "dev": dev, "dat": dat, "pat": pat, "pic": pic, "not": note},
            function () {
                $("#popupEdit").popup("close");
                reloadMySQLLayers();
            });
}

var cancelEditInformation = function () {
    $("#popupEdit").popup("close");
}

// Shows Information about the layer
var showSpecificInfo = function () {
    var view = map.getView();
    var viewResolution = view.getResolution();

    var id = $("#contentItem" + (targetContent + 1) + " > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)").val();
    var source = layersWMS[id].getSource();
    var fakeURL = []; // I call this fake since its just pretending to be the layerInfoCallStack

    var url = layerCalls[id];

    fakeURL.push(url);
    $("#editBtn").css("display", "none");
    $("#popupMenu").popup("close");
    $("#infoContent").html(loadingBar1);
    setTimeout(function () {
        $("#popupInfo").popup("open", {"transition": "flip"});
    }, 800)

    if (layersConfig[id].type == "Shapefile") {
        $.post("php/infoLister.php", {"data": btoa(JSON.stringify(fakeURL))}, function (data) {

            var names = [];
            var properties = [];
            var values = [];

            for (var i = 0; i < data.info.length; i++) {
                var info = data.info[i];

                for (var j = 0; j < info.features.length; j++) {
                    var feat = info.features[j];
                    names.push(feat.id);
                    var p = [];
                    var v = [];
                    for (prop in feat.properties) {
                        if (feat.properties.hasOwnProperty(prop)) {
                            p.push(prop);
                            v.push(feat.properties[prop]);
                        }
                    }
                    properties.push(p);
                    values.push(v);
                }
            }

            $("#infoContent").html(formatify(names, properties, values, "info"));
            $("#infoContent").enhanceWithin();

        }, "JSON");
    } else if (layersConfig[id].type == "MySQL") {
        $.post("php/showMySQLInfo.php", function (data) {

            var names = [];
            var properties = [];
            var values = [];

            for (var i = 0; i < data.info.length; i++) {
                var info = data.info[i];

                for (var j = 0; j < info.features.length; j++) {
                    var feat = info.features[j];
                    names.push(feat.id);
                    var p = [];
                    var v = [];
                    for (prop in feat.properties) {
                        if (feat.properties.hasOwnProperty(prop)) {
                            p.push(prop);
                            v.push(feat.properties[prop]);
                        }
                    }
                    properties.push(p);
                    values.push(v);
                }
            }

            $("#infoContent").html(formatify(names, properties, values, "info"));
            $("#infoContent").enhanceWithin();

        }, "JSON");
    }
}

// This code generates the link for the app. This one supports the
// adding of embedded URLS, mail:to and etc. This will be called
// multiple times depending on what the user is currently doing
var generateSharePage = function () {
    var url = "http://" + window.location.hostname + window.location.pathname;
    if ($("#checkbox-v-2a").prop("checked")) {
        var settings = {
            coords: map.getView().getCenter(),
            zoomLvl: map.getView().getZoom()
        };

        url += "?settings=" + btoa(JSON.stringify(settings));
    }
    var txtarea = '<iframe width="' + $("#text-width").val() + '" height="' + $("#text-height").val() + '" frameborder="0" scrolling="no" src="' + url + '"></iframe>';
    var mailto = 'mailto:?Subject=Sharing%20web%20app%3A%20Facility%20Viewer%20App%20&Body=Here%20is%20a%20web%20app%20shared%20with%20you%20by%20using%20the%20Datadeploy%20geoserver%20solution.%0A%0AFacility%20Viewer%20App%0A' + url;
    $("#linkTxtBox").val(url);
    $("#linkTxtArea").val(txtarea);
    $("#mailToLinker").attr("href", mailto);
}

var newLayerMode = "WMS";
var onLayerModeChange = function() {
    var message = "";
    newLayerMode = $("input[name=renderMode]:checked").val();
    if (newLayerMode == "WMS") {
        message = "WMS layers are layers that are meant for rendering images such as TIFF(Drone Imageries).";
    }
    else {
        message = "GeoJSON layers are layers that are meant for rendering shapes such as markers and features.";
    }
    $("#msgID").html(message);
}


var file64 = [];
// Read image ext
function readImage(file) {

    // Create a new FileReader instance
    // https://developer.mozilla.org/en/docs/Web/API/FileReader
    var reader = new FileReader();

    // Once a file is successfully readed:
    reader.addEventListener("load", function () {

        // At this point `reader.result` contains already the Base64 Data-URL
        // and we've could immediately show an image using
        // `elPreview.insertAdjacentHTML("beforeend", "<img src='"+ reader.result +"'>");`
        // But we want to get that image's width and height px values!
        // Since the File Object does not hold the size of an image
        // we need to create a new image and assign it's src, so when
        // the image is loaded we can calculate it's width and height:
        var image = new Image();
        image.addEventListener("load", function () {

            // Concatenate our HTML image info 
            var imageInfo = file.name + ' ' + // get the value of `name` from the `file` Obj
                    image.width + '×' + // But get the width from our `image`
                    image.height + ' ' +
                    file.type + ' ' +
                    Math.round(file.size / 1024) + 'KB';

            // Finally append our created image and the HTML info string to our `#preview` 
            elPreview.appendChild(this);
            elPreview.insertAdjacentHTML("beforeend", imageInfo + '<br>');

            // If we set the variable `useBlob` to true:
            // (Data-URLs can end up being really large
            // `src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA...........etc`
            // Blobs are usually faster and the image src will hold a shorter blob name
            // src="blob:http%3A//example.com/2a303acf-c34c-4d0a-85d4-2136eef7d723"
            if (useBlob) {
                // Free some memory for optimal performance
                window.URL.revokeObjectURL(image.src);
            }
        });

        image.src = useBlob ? window.URL.createObjectURL(file) : reader.result;
        file64.push(reader.result);
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
    reader.readAsDataURL(file);
}

function readImage2(file) {

    // Create a new FileReader instance
    // https://developer.mozilla.org/en/docs/Web/API/FileReader
    var reader = new FileReader();

    // Once a file is successfully readed:
    reader.addEventListener("load", function () {

        // At this point `reader.result` contains already the Base64 Data-URL
        // and we've could immediately show an image using
        // `elPreview.insertAdjacentHTML("beforeend", "<img src='"+ reader.result +"'>");`
        // But we want to get that image's width and height px values!
        // Since the File Object does not hold the size of an image
        // we need to create a new image and assign it's src, so when
        // the image is loaded we can calculate it's width and height:
        var image = new Image();
        image.addEventListener("load", function () {

            // Concatenate our HTML image info 
            var imageInfo = file.name + ' ' + // get the value of `name` from the `file` Obj
                    image.width + '×' + // But get the width from our `image`
                    image.height + ' ' +
                    file.type + ' ' +
                    Math.round(file.size / 1024) + 'KB';

            // Finally append our created image and the HTML info string to our `#preview` 
            elPreview2.appendChild(this);
            elPreview2.insertAdjacentHTML("beforeend", imageInfo + '<br>');

            // If we set the variable `useBlob` to true:
            // (Data-URLs can end up being really large
            // `src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA...........etc`
            // Blobs are usually faster and the image src will hold a shorter blob name
            // src="blob:http%3A//example.com/2a303acf-c34c-4d0a-85d4-2136eef7d723"
            if (useBlob) {
                // Free some memory for optimal performance
                window.URL.revokeObjectURL(image.src);
            }
        });

        image.src = useBlob ? window.URL.createObjectURL(file) : reader.result;
        file64.push(reader.result);
    });

    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
    reader.readAsDataURL(file);
}

// Code below here are still part of the GUI but uses JQuery's document.ready
$(document).ready(function () {

    window.URL = window.URL || window.webkitURL;
    elBrowse = document.getElementById("text-h");
    elPreview = document.getElementById("preview");
    elBrowse2 = document.getElementById("etext-h");
    elPreview2= document.getElementById("gpreview");
    
    useBlob = false && window.URL; // Set to `true` to use Blob instead of Data-URL
    //
    
    $("#leftTrigger2Btn").click(function(){
        
    });
    
    // This is used to interact with the slider.
    // What this one does is that it makes the slider interact with the opacity of the layer.
    $("#slider-1").on('slidestop', function (event) {
        var id = $("#contentItem" + (targetContent + 1) + " > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)").val();
        var op = $("#slider-1").val() / 100;
        layers[id].setOpacity(op);
    });

    $("#slider-2").on('slidestop', function (event) {
        var id = $("#gcontentItem" + (gTargetContent + 1) + " > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)").val();
        var op = $("#slider-2").val() / 100;
        layersList[id].setOpacity(op);
    });

    // This attaches events to the buttons in the add marker button
    $("#addMarkerBtn").click((function () {
        $("#popupAddMarker").popup("open", {"transition": "flip"});
    }));

    // This attaches events to the buttons in the select button
    $("#selectMarkerBtn").click((function () {
        $("#leftpanel2").panel("close");
        determinant = true;
    }));

    // Code below is for pressing the circle button add marker event.
    $("#chooseCircle")
            .text("")
            .append("<img height=\"100\" src=\"assets/circle.png\" width=\"100\" />")
            .button();

    $("#chooseCircle").click((function () {

        $("#leftpanel2").panel("close");
        $("#popupAddMarker").popup("close");
        selectType = "addCircle";
        selectMode = true;
    }));

    // Code below is for pressing the custom button add marker event.
    $("#chooseCustom")
            .text("")
            .append("<img height=\"100\" src=\"assets/custom.png\" width=\"100\" />")
            .button();

    $("#chooseCustom").click((function () {
        $("#leftpanel2").panel("close");
        $("#popupAddMarker").popup("close");
        setTimeout(function () {
            $("#addLayer").popup("open", {"transition": "flip"});
        }, 800);
        //selectType = "addCustom";
        //selectMode = true;
    }));

    // Code below is for having a responsive share page
    $("#shareBtnPage").click(function () {
        generateSharePage();
    });

    $("#closeSharePage").click(function () {
        $("#sharePage").popup("close");
    });
    
    $("#closeNewLayerPage").click(function () {
        $("#newLayerPage").popup("close");
    });
    
    $("#logoutBtn").click(function(){
       window.location.replace("logout.php"); 
    });

    $("#checkbox-v-2a").change(function () {
        generateSharePage();
    })

    $("#text-width").bind("propertychange change keyup paste input", function () {
        generateSharePage();
    });

    $("#text-height").bind("propertychange change keyup paste input", function () {
        generateSharePage();
    });

    $("#templateSize").change(function () {

        if ($("#templateSize").val() == 1) {
            $("#text-width").val(300);
            $("#text-height").val(300);
        } else if ($("#templateSize").val() == 2) {
            $("#text-width").val(800);
            $("#text-height").val(600);
        } else {
            $("#text-width").val(1080);
            $("#text-height").val(720);
        }
        generateSharePage();
    });

    elBrowse.addEventListener("change", function () {

        // Let's store the FileList Array into a variable:
        // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        var files = this.files;
        // Let's create an empty `errors` String to collect eventual errors into:
        var errors = "";

        if (!files) {
            errors += "File upload not supported by your browser.";
        }
        elPreview.innerHTML = "";
        file64 = [];
        // Check for `files` (FileList) support and if contains at least one file:
        if (files && files[0]) {

            // Iterate over every File object in the FileList array
            for (var i = 0; i < files.length; i++) {

                // Let's refer to the current File as a `file` variable
                // https://developer.mozilla.org/en-US/docs/Web/API/File
                var file = files[i];

                // Test the `file.name` for a valid image extension:
                // (pipe `|` delimit more image extensions)
                // The regex can also be expressed like: /\.(png|jpe?g|gif)$/i
                if ((/\.(png|jpeg|jpg|gif)$/i).test(file.name)) {
                    // SUCCESS! It's an image!
                    // Send our image `file` to our `readImage` function!
                    readImage(file);
                } else {
                    errors += file.name + " Unsupported Image extension\n";
                }
            }
        }

        // Notify the user for any errors (i.e: try uploading a .txt file)
        if (errors) {
            alert(errors);
        }

    });
    
    elBrowse2.addEventListener("change", function () {

        // Let's store the FileList Array into a variable:
        // https://developer.mozilla.org/en-US/docs/Web/API/FileList
        var files = this.files;
        // Let's create an empty `errors` String to collect eventual errors into:
        var errors = "";

        if (!files) {
            errors += "File upload not supported by your browser.";
        }
        elPreview2.innerHTML = "";
        file64 = [];
        // Check for `files` (FileList) support and if contains at least one file:
        if (files && files[0]) {

            // Iterate over every File object in the FileList array
            for (var i = 0; i < files.length; i++) {

                // Let's refer to the current File as a `file` variable
                // https://developer.mozilla.org/en-US/docs/Web/API/File
                var file = files[i];

                // Test the `file.name` for a valid image extension:
                // (pipe `|` delimit more image extensions)
                // The regex can also be expressed like: /\.(png|jpe?g|gif)$/i
                if ((/\.(png|jpeg|jpg|gif)$/i).test(file.name)) {
                    // SUCCESS! It's an image!
                    // Send our image `file` to our `readImage` function!
                    readImage(file);
                } else {
                    errors += file.name + " Unsupported Image extension\n";
                }
            }
        }

        // Notify the user for any errors (i.e: try uploading a .txt file)
        if (errors) {
            alert(errors);
        }

    });
    
    container = document.getElementById('popup');
    content = document.getElementById('popup-content');
    closer = document.getElementById('popup-closer');
    
    closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };
    
    // Google Chrome Hack (Prevent scrollbar from overflowing)
    try {
        if (chrome) {
            $("#page1").css("overflow", "hidden");
        }
    }
    catch(ex) {
        
    }
});