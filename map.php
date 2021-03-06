<?php
    session_start();
    if (!isset($_SESSION["username"])) {
        header('Location: login.php');
    }
?>
<!doctype html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>
        <meta http-equiv="Pragma" content="no-cache"/>
        <meta http-equiv="Expires" content="0"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <title>Phase 2 Prototype - FINAL</title>

        <link rel="stylesheet" href="css/fontawesome-all.css" />
        <link rel="stylesheet" href="css/dialog-polyfill.min.css">
        <link rel="stylesheet" href="css/jquery.mobile-1.5.0-alpha.1.min.css"/>
        <link rel="stylesheet" href="css/layout.css" />
        <link rel="stylesheet" href="css/overrides.css" />
        <link rel="stylesheet" href="css/loadingbar-1.css" />
        
        <script src="js/modernizr.js"></script>
        <script src="js/mobile-detect.min.js"></script>
        <script src="js/mobile-detect-modernizr.min.js"></script>
        <script src="js/dialog-polyfill.min.js" type="text/javascript"></script>
        <script src="js/jquery.js"></script>
        <script src="js/jquery-ui.js"></script>
        <script src="js/jquery-touch.js"></script>
        <script src="js/jquery-mobile.js"></script>
        <script src="js/overrides.js"></script>
        <script src="js/functionalities.js"></script>
        

        <link rel="stylesheet" href="./webinterface/target/resources/ol.css" />
        <link rel="stylesheet" href="./webinterface/target/resources/ol3-layerswitcher.css">
        <link rel="stylesheet" href="./webinterface/target/resources/qgis2web.css">
        
        <link rel="stylesheet" type="text/css" href="datatable/datatables.min.css"/>
        <script type="text/javascript" src="datatable/datatables.min.js"></script>
        
    </head>
    <body>

        <div class="loadModal">

            <div class="lds-css ng-scope" style="display: table; height: 100%; margin-left: auto; margin-right: auto;">
                <div style="display: table-cell; vertical-align: middle;" class="lds-ball">
                    <div style="margin-left: auto; margin-right: auto;"></div>
                    <br><br><br><br>
                    <h2 style="text-align: center;">Now loading...</h2>
                    <h3 style="text-align: center">datadeploy.io</h3>
                </div>
            </div>
        </div>

        <div data-role="page" style="max-height:440px; min-height:440px;" class="type-home" class="ui-responsive-panel" id="page1">


            <div role="main" class="ui-content">
                <?php
                    require_once 'php/mobiledetect.php';
                    $detect = new Mobile_Detect;
                    if (!$detect->isMobile()) {
                ?>
                <a href="#leftpanel1" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-left: 40px; margin-top: -5px;">Layer List</a>
                <a href="#leftpanel2" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-top: -5px;">Edit</a>
                <a id="leftTrigger2Btn" href="#leftpanel3" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-top: -5px;">Filter</a>
                <a id="newLayerBtnPage" href="#newLayerPage" data-role="button" data-inline="true" data-mini="true" data-rel="popup" data-transition="slidedown" data-position-to="window" style="z-index: 100; margin-top: -5px;">Connect Layer</a>
                <a id="shareBtnPage" href="#sharePage" data-role="button" data-inline="true" data-mini="true" data-rel="popup" data-transition="slidedown" data-position-to="window" style="z-index: 100; margin-top: -5px;">Share</a>
                <a id="logoutBtn" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-top: -5px;" >Logout</a> 
                <?php
                    }
                    else {
                ?>
                <a href="#leftpanel1" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-left: 40px; margin-top: -5px;">🗃</a>
                <a href="#leftpanel2" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-top: -5px; margin-left: -10px;">📝</a>
                <a id="leftTrigger2Btn" href="#leftpanel3" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-top: -5px; margin-left: -10px;">🔍</a>
                <a id="newLayerBtnPage" href="#newLayerPage" data-role="button" data-inline="true" data-mini="true" data-rel="popup" data-transition="slidedown" data-position-to="window" style="z-index: 100; margin-top: -5px; margin-left: -10px;">🌐</a>
                <a id="shareBtnPage" href="#sharePage" data-role="button" data-inline="true" data-mini="true" data-rel="popup" data-transition="slidedown" data-position-to="window" style="z-index: 100; margin-top: -5px; margin-left: -10px;">🔗</a>
                <a id="logoutBtn" data-role="button" data-inline="true" data-mini="true" style="z-index: 100; margin-top: -5px; margin-left: -10px;" >❗</a> 
                <?php
                    }
                ?>
                <div id="map" style="height: 99vh; width: 100vw; position: absolute; top: 0; left: 0;" class="map"></div>
                <div id="popup" class="ol-popup">
                    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
                    <div id="popup-content"></div>
                </div>
            </div>


            <!-- leftpanel1  -->
            <div data-role="panel" id="leftpanel1" data-position="left" data-display="push" data-dismissible="true" data-theme="a" style="height: 80vh; display: block;">

                <div class="panel-content">
                    <div class="flex-container">
                        <div class="flex-item">
                            <h3>Layer List</h3>
                        </div>
                        <div class="flex-item">

                            <fieldset id="individualFields" class="fieldList" style="display:none !important">
                                <legend id="operationalLayer">All Layers<a class="legendStyle" href="#popupGeneral" data-rel="popup" data-transition="slideup"><i class="fa fa-cogs" style="margin-top: 5px; " aria-hidden="true"></i></a></legend>


                                <div data-role="popup" id="popupMenu" data-theme="a">
                                    <ul data-role="listview" data-inset="true" style="min-width:210px;">
                                        <li id="headerPopupMenu" data-role="list-divider">Choose an action</li>
                                        <li              onclick="zoomTo()"><a href="#">Zoom to</a></li>
                                        <li              onclick="setTransparency()"><a href="#">Transparency</a></li>
                                        <li id='actUp'   onclick="moveItemUp()"><a href="#">Move Up</a></li>
                                        <li id='actDown' onclick="moveItemDown()"><a href="#">Move Down</a></li>
                                        <li id='showInfo'onclick="showSpecificInfo()"><a href="#">Show Information</a></li>
                                    </ul>
                                </div>

                                <div data-role="popup" id="popupGeneral" data-theme="a">
                                    <ul data-role="listview" data-inset="true" style="min-width:210px;">
                                        <li data-role="list-divider">Choose an action</li>
                                        <li><a href="#" onclick="setLayersAllOn()">Turn all layers on</a></li>
                                        <li><a href="#" onclick="setLayersAllOff()">Turn all layers off</a></li>
                                        <li><a href="#" onclick="expandAllLayers()">Expand all layers</a></li>
                                        <li><a href="#" onclick="collapseAllLayers()">Collapse all layers</a></li>
                                        <li><a href="#" onclick="toGroup()">Show Layer Groups</a></li>
                                    </ul>
                                </div>

                                <div data-role="popup" id="popupTransparency" data-theme="a">
                                    <label for="slider-1"><p id="popTargs" >Modify transparency of layer:</p></label>
                                    <input type="range" name="slider-1" id="slider-1" value="100" min="0" max="100">
                                </div>

                            </fieldset>

                            <fieldset id="groupFields" class="fieldList" style="display:none !important">
                                <fieldset class="fieldList">
                                    <legend id="groupOpsLayer">All Groups<a class="legendStyle" href="#gpopupGeneral" data-rel="popup" data-transition="slideup"><i class="fa fa-cogs" style="margin-top: 5px; " aria-hidden="true"></i></a></legend>

                                    <div data-role="popup" id="gpopupMenu" data-theme="a">
                                        <ul data-role="listview" data-inset="true" style="min-width:210px;">
                                            <li id="headerPopupMenu" data-role="list-divider">Choose an action</li>
                                            <li              onclick="gsetTransparency()"><a href="#">Transparency</a></li>
                                        </ul>
                                    </div>

                                    <div data-role="popup" id="gpopupGeneral" data-theme="a">
                                        <ul data-role="listview" data-inset="true" style="min-width:210px;">
                                            <li data-role="list-divider">Choose an action</li>
                                            <li><a href="#" onclick="gsetLayersAllOn()">Turn all layers on</a></li>
                                            <li><a href="#" onclick="gsetLayersAllOff()">Turn all layers off</a></li>
                                            <li><a href="#" onclick="toIndividual()">Show Layers Individually</a></li>
                                        </ul>
                                    </div>

                                    <div data-role="popup" id="gpopupTransparency" data-theme="a">
                                        <label for="slider-2"><p id="gpopTargs" >Modify transparency of group:</p></label>
                                        <input type="range" name="slider-2" id="slider-2" value="100" min="0" max="100">
                                    </div>
                                </fieldset>
                        </div>
                    </div>

                    <!--<a href="#demo-links" data-rel="close" data-role="button" data-theme="a" data-icon="delete" data-inline="true">Close panel</a>-->
                </div><!-- /content wrapper for padding -->

            </div><!-- /leftpanel1 -->

            <!-- leftpanel2  -->
            <div data-role="panel" id="leftpanel2" data-position="left" data-display="push" data-dismissible="true" data-theme="a">

                <div class="panel-content">
                    <div class="flex-container">
                        <div class="flex-item">
                            <h3>Edit</h3>
                            <p>This panel is positioned on the left with the push display mode. The panel markup is <em>after</em> the header, content and footer in the source order.</p>
                            <p>To close, click off the panel, swipe left or right, hit the Esc key, or use the button below:</p>
                        </div>
                        <div class="flex-item">
                            <button id="addMarkerBtn" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit"><i class="fa fa-map-marker" aria-hidden="true"></i> Add a marker</button>
                            <button id="selectMarkerBtn" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit"><i class="fa fa-mouse-pointer" aria-hidden="true"></i> Make a selection</button>
                            <button class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit" data-rel="close">Cancel Action</button>
                        </div>
                    </div>

                    <div class="popupClassDrag" data-role="popup" id="popupAddMarker" data-theme="a">
                        <h2 class="headingMarker">Select the type of marker you wish to add</h2>
                        <h4 class="noteContent">After pressing a button, you will be asked to point the location where you will place the marker.</h4>
                        <h4 class="noteContent">Marker choices:</h4>
                        <center>
                            <button class="optionsChooser" id="chooseCircle">Add a normal marker</button>
                            <button style="display: none;" class="optionsChooser" id="chooseCustom">Add a custom marker</button>
                        </center>
                    </div>
                </div><!-- /content wrapper for padding -->

            </div><!-- /leftpanel2 -->

            <!-- leftpanel3  -->
            <div data-role="panel" id="leftpanel3" data-position="left" data-display="push" data-dismissible="true" data-theme="a">

                <div class="panel-content">
                    <h3>Filter</h3>
                    <form>
                        <div class="ui-field-contain">
                            <label for="select-native-1">Layer</label>
                            <select name="select-native-1" id="select-native-1">
                            </select>
                            <label for="selectfeatname">Feature</label>
	
                            <form class="ui-filterable">
                                <input id="featName" data-type="search" placeholder="Feature Name">
                            </form>
                            <ul id="autocomplete" data-role="listview" data-filter="true" data-filter-reveal="true" data-input="#featName">
                                
                            </ul>
                        </div>
                        <button id="showFeaturePopup" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit"><i class="fa fa-search" aria-hidden="true"></i>Show Details</button>
                    </form>
                    
                    <div class="popupClassDrag" data-role="popup" id="showFeatureTable" data-theme="a" data-dismissible="false">
                        <h2 class="headingMarker">Show Details</h2>
                        <div style="width: 700px; height: 400px; display: block; overflow: scroll;">
                            <div style="padding: 10px;">
                                <table id="featureTable" class="display" width="100%"></table>
                            </div>
                        </div>
                        <?php if (!$detect->isMobile()) { ?>
                         <input id="pinShowDetails" type="button" value="Pin this window" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton" >
                        <?php } ?>
                         <input id="closeShowDetails" type="button" value="Close this window" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton" >
                    </div>
                </div><!-- /content wrapper for padding -->

            </div><!-- /leftpanel3 -->

            <div class="popupClassDrag" data-role="popup" id="popupInfo" data-theme="a">
                <h2 class="headingMarker">Layer(s) Information</h2>
                <button id="editBtn" onclick="spawnEdit()">Edit selected feature(s)</button>
                <h4 id="infoContent" class="noteContent" style="width: 800px; height:600px; overflow: auto;">
                </h4>
            </div>

            <div class="popupClassDrag" data-role="popup" id="popupEdit" data-theme="a">
                <div style="padding: 10px">
                    <h2 id="headingEdit" class="headingMarker">Edit Layer</h2>
                    <div style="display: block; width: 500px; height:400px; overflow: auto;">
                        <label for="etext-c">Alt</label>
                        <input data-clear-btn="true" name="etext-c" id="etext-c" value="" type="text">
                        <label for="etext-d">Location</label>
                        <input data-clear-btn="true" name="etext-d" id="etext-d" value="" type="text">
                        <label for="etext-e">Device Type</label>
                        <input data-clear-btn="true" name="etext-e" id="etext-e" value="" type="text">
                        <label for="etext-f">Date</label>
                        <input data-role="date" data-clear-btn="true" name="etext-f" id="etext-f" value="" type="date">
                        <label for="etext-g">Path</label>
                        <input data-clear-btn="true" name="etext-g" id="etext-g" value="" type="text">
                        <label for="etext-h">Picture</label>
                        <input data-clear-btn="true" name="etext-h" id="etext-h" type="file" multiple>
                        <div id="gpreview"></div>
                        <label for="etext-i">Note</label>
                        <input data-clear-btn="true" name="etext-i" id="etext-i" value="" type="text">
                        <input onclick="editInformation()" type="button" name="Update" value="Update" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton">
                        <input onclick="cancelEditInformation()" type="button" name="Cancel" value="Cancel" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton">
                    </div>
                </div>
            </div>

            <div class="popupClassDrag" data-role="popup" id="popupEditSelection" data-theme="a">
                <h2 class="headingMarker">Select features to edit</h2>
                <h4 id="editSelect" class="noteContent" style="width: 500px; height:400px; overflow: auto;">
                </h4>
            </div>

            <div class="popupClassDrag" data-role="popup" id="addLayer" data-theme="a">
                <div style="padding: 10px">
                    <h2 class="headingMarker">Layer Information</h2>
                    <div style="display: block; width: 500px; height:400px; overflow: auto;">
                        <label for="text-a">Long</label>
                        <input data-clear-btn="true" name="text-a" id="text-a" value="" type="text">
                        <label for="text-b">Lot</label>
                        <input data-clear-btn="true" name="text-b" id="text-b" value="" type="text">
                        <label for="text-c">Alt</label>
                        <input data-clear-btn="true" name="text-c" id="text-c" value="" type="text">
                        <label for="text-d">Location</label>
                        <input data-clear-btn="true" name="text-d" id="text-d" value="" type="text">
                        <label for="text-e">Device Type</label>
                        <input data-clear-btn="true" name="text-e" id="text-e" value="" type="text">
                        <label for="text-f">Date</label>
                        <input data-role="date" data-clear-btn="true" name="text-f" id="text-f" value="" type="date">
                        <label for="text-g">Path</label>
                        <input data-clear-btn="true" name="text-g" id="text-g" value="" type="text">
                        <label for="text-h">Picture</label>
                        <input data-clear-btn="true" name="text-h" id="text-h" type="file" multiple>
                        <div id="preview"></div>
                        <label for="text-i">Note</label>
                        <input data-clear-btn="true" name="text-i" id="text-i" value="" type="text">
                        <input onclick="addInformation()" type="button" name="Add" value="Add" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton">
                        <input onclick="cancelAddInformation()" type="button" name="Cancel" value="Cancel" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton">
                    </div>
                </div>
            </div>

            <div class="popupClassDrag" data-role="popup" id="sharePage" style="width: 700px; height: 600px; overflow: auto;" data-dismissible="false"><!-- dialog-->

                <div data-role="header">
                    <h1 id="headerTexter" class="centerText">Share the page</h1>
                </div><!-- /header -->

                <div class="ui-content" role="main">
                    <label for="text-3">Share a link to this app<a id="mailToLinker" href="mailto:?"><i  class="fa fa-envelope" aria-hidden="true" style="float: right; cursor: pointer; font-size: 20pt"></i></a></label>
                    <input id="linkTxtBox" data-clear-btn="false" name="text-3" id="text-3" value="" type="text">
                    <div data-role="collapsible" data-collapsed-icon="arrow-r"  data-expanded-icon="arrow-d">
                        <h3>Link Options</h3>
                        <fieldset style="display: block;">
                            <legend>Map Options:</legend>
                            <input name="checkbox-v-2a" id="checkbox-v-2a" type="checkbox" checked>
                            <label for="checkbox-v-2a">Save current position to link</label>
                        </fieldset>
                    </div>
                    <br><br>
                    <label for="textarea-1">Embed this app in a website</label>
                    <textarea id="linkTxtArea" name="textarea-1" id="textarea-1"></textarea>
                    <div data-role="collapsible" data-collapsed-icon="arrow-r"  data-expanded-icon="arrow-d">
                        <h3>Embed Options</h3>
                        <fieldset style="display: block;">
                            <legend>iframe settings (You can customize the value if you wish)</legend>
                            <label for="templateSize">Template size:</label>
                            <select name="templateSize" id="templateSize">
                                <option value="1">Small</option>
                                <option value="2">Medium</option>
                                <option value="3">Large</option>
                            </select>
                            <label for="text-width">Width</label>
                            <input data-clear-btn="false" name="text-width" id="text-width" value="300" type="number">
                            <label for="text-height">Height</label>
                            <input data-clear-btn="false" name="text-height" id="text-height" value="300" type="number">
                        </fieldset>
                    </div>
                    <br>
                    <input id="closeSharePage" type="button" value="Close this window" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton" >
                </div>
            </div><!-- dialog-->
            
            <div class="popupClassDrag" data-role="popup" id="newLayerPage" style="width: 700px; height: 600px; overflow: auto;"><!-- dialog-->

                <div data-role="header">
                    <h1 id="headerTexter" class="centerText">Connect a new Layer</h1>
                </div><!-- /header -->

                <div class="ui-content" role="main">
                    <label for="text-1">Enter the store name of the layer</label>
                    <input id="layerDSTxtBox" data-clear-btn="false" name="text-1" id="text-1" value="" type="text">
                    <label for="text-2">Enter the workspace name of the layer</label>
                    <input id="layerWSTxtBox" data-clear-btn="false" name="text-2" id="text-2" value="" type="text">
                    <label for="text-3">Enter the link of the layer</label>
                    <input id="layerLinkTxtBox" data-clear-btn="false" name="text-3" id="text-3" value="" type="text">
                    <label for="text-4">Enter the extent size of the layer</label>
                    <input id="layerExtTxtBox" data-clear-btn="false" name="text-4" id="text-4" value="" type="text">
                    <div data-role="collapsible" data-collapsed-icon="arrow-r" data-expanded-icon="arrow-d" data-collapsed="false">
                        <h3>Layer Render Options</h3>
                        <fieldset data-role="controlgroup" data-type="horizontal" style="display: block">
                            <legend>Options</legend>
                            <input onchange="onLayerModeChange()" name="renderMode" id="radio-choice-h-2a" value="WMS" checked="checked" type="radio">
                            <label for="radio-choice-h-2a">WMS(Images / Drone Imagery)</label>
                            <input onchange="onLayerModeChange()" name="renderMode" id="radio-choice-h-2b" value="GeoJSON" type="radio">
                            <label for="radio-choice-h-2b">GeoJSON</label>
                        </fieldset>
                        <p id="msgID">WMS layers are layers that are meant for rendering images such as TIFF(Drone Imageries).</p>
                    </div>
                    <br>
                    <input onclick="connectNewLayer()" type="button" name="connect" value="Connect Layer" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton">
                    <input id="closeNewLayerPage" type="button" value="Close this window" class="ui-button ui-shadow ui-corner-all ui-widget ui-button-inherit layoutButton" >
                </div>
            </div><!-- dialog-->

        </div>

        <script src="js/preload.js"></script>
        <script src="webinterface/target/resources/polyfills.js"></script>
        <script src="./webinterface/target/resources/ol.js"></script>
        <script src="./webinterface/target/resources/ol3-layerswitcher.js"></script>
        <script src="./webinterface/target/layers/layers.js" type="text/javascript"></script>
    </body>
</html>