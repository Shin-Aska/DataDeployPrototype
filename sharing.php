<?php
    $actual_link = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";   
?>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Prototype Day 1 - Share</title>
        <link rel="stylesheet" href="css/fontawesome-all.css" />
        <link rel="stylesheet" href="css/themes/datadep.min.css" />
        <link rel="stylesheet" href="css/themes/jquery.mobile.icons.min.css" />
        <link rel="stylesheet" href="css/dialog-polyfill.min.css">
        <link rel="stylesheet" href="https://code.jquery.com/mobile/1.5.0-alpha.1/jquery.mobile-1.5.0-alpha.1.min.css" />
        <link rel="stylesheet" href="css/layout.css" />
        <link rel="stylesheet" href="css/overrides.css" />
        <link rel="stylesheet" href="https//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">

        <script src="js/dialog-polyfill.min.js" type="text/javascript"></script>
        <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
        <script src="https://code.jquery.com/mobile/1.5.0-alpha.1/jquery.mobile-1.5.0-alpha.1.min.js"></script>
        <script src="js/overrides.js"></script>
    </head>
    <body>
        
        <div data-role="page" id="dialog-success" data-dom-cache="true" class="type-home" class="ui-responsive-panel" id="page1"><!-- dialog-->

            <div data-role="header">
                <h1 id="headerTexter" class="centerText">Share the page</h1>
            </div><!-- /header -->

            <div class="ui-content" role="main">
                <label for="text-3">Share a link to this app</label>
                <input data-clear-btn="true" name="text-3" id="text-3" value="<?php echo $actual_link . $_GET['coord']; ?>" type="text">
                <a href="">Link options</a>
                <i class="fa fa-envelope" aria-hidden="true" style="float: right;"></i>
                <br><br>
                <label for="textarea-1">Embed this app in a website</label>
                <textarea name="textarea-1" id="textarea-1"><iframe width="300" height="200" frameborder="0" scrolling="no" src="<?php echo $actual_link . $_GET['coord']; ?>"></iframe></textarea>
                <a href="">Embed options</a>
                <br>
                <a href="index.html" class="ui-btn ui-corner-all layoutButton" data-rel="back">Go back to the app</a>
            </div>
        </div><!-- dialog-->

        <div data-role="page" id="page-success"></div>
    </body>
</html>
