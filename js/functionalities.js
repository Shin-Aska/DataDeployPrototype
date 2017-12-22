/* 	Functionalities is where I put all of the UI functionalities, such as manipulating the OpenLayers, loading data from
 a Geoserver, Zooming to.. so on and so forth   
 */

/*
 Configuration parameters here
 */
var serverString = "http://localhost:8080";
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

function createInsertXML(coords) {
    var geomType;
 
    if (coords.length == 2) {
        geomType = 'Point';
    } else if (coords.length > 2) {
        if (coords.lastIndexOf(coords[1]) == (coords.length - 1)) {
            geomType = 'Polygon';
        } else {
            geomType = 'LineString';
        }
    }

    var featNS = workspace;
    var featName = 'abc';
    var featType = geomType;
    var featGeom = coords;
    var XMLCompleteString = '';
    var XMLInsertHeaderString = '<wfs:Transaction service="WFS" version="1.0.0" ' +
            'xmlns:wfs="http://www.opengis.net/wfs" ' +
            'xmlns:' + featNS + '="' + featNS + '" ' +
            'xmlns:gml="http://www.opengis.net/gml" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<wfs:Insert>';
    var XMLInsertContentHeaderString = '<' + featNS + ':' + featName + '>';

    switch (featType) {
        case 'Point':
            var XMLInsertGeometryHeaderString = '<' + featNS + ':' + 'Geometry' + '>';
            var XMLInsertFeatureTypeHeaderString = '<gml:Point>';
            var XMLInsertCoordinateString = '<gml:coordinates decimal="." cs="," ts=" ">' +
                    featGeom[0] + "," + featGeom[1] +
                    '</gml:coordinates>';
            var XMLInsertFeatureTypeCloseString = '</gml:Point>';
            var XMLInsertGeometryCloseString = '</' + featNS + ':' + 'Geometry' + '>';
            break;
        case 'PolyLine':
            //TODO Implement PolyLines
            break;
        case 'Polygon':
            //TODO Implement Polygons
            break;
    }

    var XMLInsertJobNumberString = '<' + featNS + ':' + 'JobNumber' + '>' + $('#jobNumber').val() + '</' + featNS + ':' + 'JobNumber' + '>';
    var XMLInsertContentCloseString = '</' + featNS + ':' + featName + '>';
    var XMLInsertCloseString = '</wfs:Insert>' +
            '</wfs:Transaction>';
    XMLCompleteString = XMLCompleteString.concat(
            XMLInsertHeaderString,
            XMLInsertContentHeaderString,
            XMLInsertGeometryHeaderString,
            XMLInsertFeatureTypeHeaderString,
            XMLInsertCoordinateString,
            XMLInsertFeatureTypeCloseString,
            XMLInsertGeometryCloseString,
            XMLInsertJobNumberString,
            XMLInsertContentCloseString,
            XMLInsertCloseString
            );
    //var xmlhttp = new XMLHttpRequest();
    //xmlhttp.open("POST", serverString + "geoserver/wfs", true);
    //xmlhttp.send(XMLCompleteString);
    
    $.post(serverString + "/geoserver/wfs", XMLCompleteString, function(){
        
    });
    alert(serverString + "/geoserver/wfs");
    alert(XMLCompleteString);
}

/***************--OpenLayers Functionalities--*********************/

// This method here enables/disables a particular
// layer by turning on and off its visibility
var layerAction = function (id) {
    var sValue = $("#checkbox-" + id).prop("checked");
    layers[parseInt(id) - 1].setVisible(sValue);
}

// This variable is the key to make the sidebar layerlist work
var targetContent = -1;

// Once the web app is finished fetching data to the Geoserver,
// it will generate a list of elements to the sidebar using this method
// Also while its generating.. The Layers will set their ZIndexes base on the
// position it was fetched on the geoserver.
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
        totalString += '     <input onclick="layerAction(' + (i + 1) + ')" type="checkbox" name="checkbox-' + (i + 1) + '" id="checkbox-' + (i + 1) + '" checked>';
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
    $(".fieldList").enhanceWithin();

    for (var i = 0; i < layerNames.length; i++) {
        $("#popupItem" + (i + 1)).click((function (id) {
            return function () {
                setMoveTarget(id);
            }
        }(i)));
    }
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

// Sets all of the layers to turn off
var setLayersAllOff = function () {
    for (var i = 0; i < layerNames.length; i++) {
        $("#checkbox-" + (i + 1)).prop("checked", false).checkboxradio("refresh");
        layers[i].setVisible(false);
    }
    $("#popupGeneral").popup("close");
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
var setMoveTarget = function (id) {
    targetContent = id;
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

// This moves the camera to fit on a particular layer
// It should belong to the OpenLayer's Functionalities but since it uses the concept of
// the setMoveTarget, i moved it here instead
var zoomTo = function () {
    map.getView().fit(layerExtents[targetContent], map.getSize());
    $("#popupMenu").popup("close");
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

// Code below here are still part of the GUI but uses JQuery's document.ready
$(document).ready(function () {

    // This is used to interact with the slider.
    // What this one does is that it makes the slider interact with the opacity of the layer.
    $("#slider-1").on('slidestop', function (event) {
        var id = $("#contentItem" + (targetContent + 1) + " > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)").val();
        var op = $("#slider-1").val() / 100;
        layers[id].setOpacity(op);
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
        setTimeout(function () {
            $("#addLayer").popup("open", {"transition": "flip"});
        }, 800);
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
    
    // Google Chrome Hack (Prevent scrollbar from overflowing)
    if (chrome) {
        $("#page1").css("overflow", "hidden");
    }
});