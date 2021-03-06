// This is the list of overrides created for certain GUI functionalities to be possible
// As much as possible do not touch this unless a new feature is to be added or a bug is needed to be fixed

// This overrides the checkboxes created on JQuery Mobile
// so that it always is possible to refresh it (Needed for MoveLayerUp and MoveLayerDown methods)
$(document).on("pagebeforecreate", "#page1", function () {

    $('#collapsibleSetWrapper .mycheckbox').on("checkboxradiocreate", function (event, ui) {
        var checkbox = $(event.target);
        var clickTarget = $(event.target).closest(".ui-checkbox").find("label.ui-btn");
        $(clickTarget).on("click", function (e) {
            if (checkbox.is(':checked')) {
                checkbox.prop("checked", false).checkboxradio('refresh');
                // select all the nested checkboxes here
            } else {
                checkbox.prop("checked", true).checkboxradio('refresh');
                // unselect all the nested checkboxes here
            }
            e.preventDefault();
            return false;
        });
    });

});

// See the (i)[info icons] near the checkbox?
// this method is the one responsible for making them appear or
// disappear. An optional second parameter is added called override
// where if u put in show, regardless of status, it will actually overwrite
// its toggle functionality Possible values [show, hide]
var toggleInfo = function(elementId, override) {
    if (override == null) {
        override = "";
    }
    var display = $("#" + elementId).css("display");
    if (override == "") {
        if (display == "block") {
            $("#" + elementId).css("display", "none");
        }
        else {
            $("#" + elementId).css("display", "block");
        }
    }
    else {
        if (override == "show") {
            $("#" + elementId).css("display", "block");
        }
        else if (override == "hide") {
            $("#" + elementId).css("display", "none");
        }
    }
}

// An override from jquery itself. This adds the swapWith
// method in the Jquery class in order to switch to elements (Needed for MoveLayerUp and MoveLayerDown methods)
$.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}


try {
    /iPad|iPhone|Android/.test( navigator.userAgent ) && (function( $ ) {
    
    var proto =  $.ui.mouse.prototype,
    _mouseInit = proto._mouseInit;
    
    $.extend( proto, {
        _mouseInit: function() {
            this.element
            .bind( "touchstart." + this.widgetName, $.proxy( this, "_touchStart" ) );
            _mouseInit.apply( this, arguments );
        },
    
        _touchStart: function( event ) {
             this.element
            .bind( "touchmove." + this.widgetName, $.proxy( this, "_touchMove" ) )
            .bind( "touchend." + this.widgetName, $.proxy( this, "_touchEnd" ) );
    
            this._modifyEvent( event );
    
            $( document ).trigger($.Event("mouseup")); //reset mouseHandled flag in ui.mouse
            this._mouseDown( event );
    
            //return false;           
        },
    
        _touchMove: function( event ) {
            this._modifyEvent( event );
            this._mouseMove( event );   
        },
    
        _touchEnd: function( event ) {
            this.element
            .unbind( "touchmove." + this.widgetName )
            .unbind( "touchend." + this.widgetName );
            this._mouseUp( event ); 
        },
    
        _modifyEvent: function( event ) {
            event.which = 1;
            var target = event.originalEvent.targetTouches[0];
            event.pageX = target.clientX;
            event.pageY = target.clientY;
        }
    
    });
    
    })( jQuery );
}
catch (ex) {
    
}