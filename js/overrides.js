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

var toggleInfo = function(elementId) {
    var display = $("#" + elementId).css("display");
    if (display == "block") {
        $("#" + elementId).css("display", "none");
    }
    else {
        $("#" + elementId).css("display", "block");
    }
}