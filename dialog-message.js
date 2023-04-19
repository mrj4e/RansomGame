var DialogMessage = {
    
    open: function(message, timed) {
        $("#overlay").html('<div id="dialogmessage">' + message + '</div>');

        var buttons = {};
        if (!timed) {
            buttons = {
                "OK": function() {
                    $(".ui-dialog.dialogmessage").remove();
                    $("#overlay").html("");
                }
            }
        }

        $("#dialogmessage").dialog({
            title: timed ? "" : "Please note",
            draggable: false,
            resizable: false,
            autoOpen: false,
            dialogClass: timed ? "no-titlebar" : "",
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
                $(".ui-dialog.dialogmessage").remove();
                $("#overlay").html("");
            }
        })
        .css("font-size", timed ? $("#menu").css("font-size") : "1.5em");

        var parent = $("#dialogmessage").parent();
        var buttons = parent.find("button");
        $(buttons[0]).removeClass("ui-button-icon-only").html("&#10008;");
        parent.addClass("dialogmessage");
        
        $("#dialogmessage").dialog("open");

        if (timed) {
            setTimeout(function() {
                try {
                    $("#dialogmessage").dialog("close");
                } catch {
                }
                $(".ui-dialog.dialogmessage").remove();
                $("#overlay").html("");
            }, 1200);
        }
    }
}