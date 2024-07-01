var DialogConfirm = {
    
    open: function(title, message, callback) {
        $("#overlay").html('<div id="dialogconfirm">' + message + '</div>');

        var buttons = {};
        buttons = {
            "Yes": function() {
                $(".ui-dialog.dialogconfirm").remove();
                $("#overlay").html("");
                callback();
            }
        }

        $("#dialogconfirm").dialog({
            title: title,
            draggable: false,
            resizable: false,
            autoOpen: false,
            width: $("#menu>div").width() * 1.2 + "px",
            minHeight: "auto",
            show: {
                effect: "slideDown",
                duration: 500
            },
            hide: {
                effect: "fold",
                duration: 500
            },
            buttons: buttons,
            close: function() {
                $(".ui-dialog.dialogconfirm").remove();
                $("#overlay").html("");
            }
        })
        .css("font-size", "2.2em");

        var parent = $("#dialogconfirm").parent();
        var buttons = parent.find("button");
        $(buttons[0]).removeClass("ui-button-icon-only").html("&#10008;");
        parent.addClass("dialogconfirm");
        
        $("#dialogconfirm").dialog("open");
    }
}