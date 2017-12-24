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

var doesIntersect = function(coord, geometry) {
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
            var diff  = Math.sqrt(diffx + diffy);
            if (diff <= 10) {
                iResult.push(obj);
            } 
        }
    }
    return iResult;
}

/***************--OpenLayers Functionalities--*********************/

// This method here enables/disables a particular
// layer by turning on and off its visibility

var reloadMySQLLayers = function() {
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
// It's a bit too tricky to 
var renderMode = "i";
var updateRenderer = function () {
    if (renderMode == "i") {
        $("#individualFields").css("display", "block");
        $("#groupFields").css("cssText", "display: none !important");
    } else {
        $("#individualFields").css("cssText", "display: none !important");
        $("#groupFields").css("display", "block");
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
    $("#individualFields").enhanceWithin();

    for (var i = 0; i < layerNames.length; i++) {
        $("#popupItem" + (i + 1)).click((function (id) {
            return function () {
                setMoveTarget(id);
            }
        }(i)));
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
        totalString += '     <input onclick="glayerAction(' + (i + 1) + ')" type="checkbox" name="gcheckbox-' + (i + 1) + '" id="gcheckbox-' + (i + 1) + '" checked>';
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

    if (id > imageLastIndex) {
        $("#showInfo").css("display", "block");
    } else {
        $("#showInfo").css("display", "none");
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

var addInformation = function() {
    var lon = $("#text-a").val();
    var lat = $("#text-b").val();
    var alt = $("#text-c").val();
    var loc = $("#text-d").val();
    var dev = $("#text-e").val();
    var dat=  $("#text-f").val();
    var pat = $("#text-g").val();
    var pic = JSON.stringify(file64);
    var note= $("#text-i").val();
    
    $.post("php/addMySQLData.php", 
    {"lon": lon, "lat": lat, "alt": alt, "loc": loc, "dev":dev, "dat": dat, "pat": pat, "pic": pic, "not": note}, 
    function(){
         $("#addLayer").popup("close");
         reloadMySQLLayers();
    });
}

var cancelAddInformation = function() {
    $("#addLayer").popup("close");
    base64 = [];
    elPreview.innerHTML = "";
}

var spawnEdit = function() {
    $("#popupInfo").popup("close");
    setTimeout(function(){
        $("#popupEditSelection").popup("open",  {"transition": "flip"});
    }, 800);
    var txt = "";
    for (var i = 0; i < layersConfig.length; i++) {
        var cfg = layersConfig[i];
        if (cfg.type == "MySQL") {
            for (var j = 0; j < targetFeature[i].length; j++) {
                txt += "<button onclick='editFeature(" + i + "," + j +")'>Edit " + targetFeature[i][j].f + "</button>";
            }
        }
    }
    $("#editSelect").html(txt);
    $("#editSelect").enhanceWithin();
}

var editId = -1;
var editFeature = function(i, j) {
    $("#popupEditSelection").popup("close");
    setTimeout(function(){
        $("#popupEdit").popup("open",  {"transition": "flip"});
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

var editInformation = function() {
    
    var id  = editId;
    var alt = $("#etext-c").val();
    var loc = $("#etext-d").val();
    var dev = $("#etext-e").val();
    var dat=  $("#etext-f").val();
    var pat = $("#etext-g").val();
    var pic = JSON.stringify(file64);
    var note= $("#etext-i").val();
    
    $.post("php/editMySQLData.php", 
    {"id": id, "alt": alt, "loc": loc, "dev":dev, "dat": dat, "pat": pat, "pic": pic, "not": note}, 
    function(){
         $("#popupEdit").popup("close");
         reloadMySQLLayers();
    });
}

var cancelEditInformation = function() {
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
            var txtStr = "";

            for (var i = 0; i < data.info.length; i++) {
                var info = data.info[i];

                for (var j = 0; j < info.features.length; j++) {
                    var feat = info.features[j];
                    txtStr += "<p>Properties for: " + feat.id + "</p>";
                    txtStr += "<hr>";
                    for (const prop in feat.properties) {
                        if (feat.properties.hasOwnProperty(prop)) {
                            txtStr += prop + " = " + feat.properties[prop] + "<br>";
                            ;
                        }
                    }
                    console.log(feat);
                }
            }

            $("#infoContent").html(txtStr);

        }, "JSON");
    } else if (layersConfig[id].type == "MySQL") {
        $.post("php/showMySQLInfo.php", function (data) {
            var txtStr = "";

            for (var i = 0; i < data.info.length; i++) {
                var info = data.info[i];

                for (var j = 0; j < info.features.length; j++) {
                    var feat = info.features[j];

                    txtStr += "<p>Properties for: " + feat.id + "</p>";
                    txtStr += "<hr>";
                    for (const prop in feat.properties) {
                        if (feat.properties.hasOwnProperty(prop)) {
                            txtStr += prop + " = " + feat.properties[prop] + "<br>";
                            ;
                        }
                    }

                }
            }

            $("#infoContent").html(txtStr);

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


// Code below here are still part of the GUI but uses JQuery's document.ready
$(document).ready(function () {

    window.URL = window.URL || window.webkitURL;
    elBrowse = document.getElementById("text-h");
    elPreview = document.getElementById("preview");
    useBlob = false && window.URL; // Set to `true` to use Blob instead of Data-URL
    //
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

    // Google Chrome Hack (Prevent scrollbar from overflowing)
    if (chrome) {
        $("#page1").css("overflow", "hidden");
    }
});