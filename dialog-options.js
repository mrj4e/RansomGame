var DialogOptions = {
    
    reload: function() {
        try {
            $("#dialogoptions").dialog("destroy");
        } catch {
        }
        DialogOptions.open();
    },

    open: function() {
        var text = $("#options").html()
            .replace("[[topscore]]", State.getMaxScore())
            .replace("[[topmovecount]]", State.getMaxScoreTotalMoveCount())
            .replace("[[currentscore]]", State.getGameScore())
            .replace("[[currentchallenge]]", State.getAchievedChallengeId() + 1)
            .replace("[[soundstatus]]", State.getSoundStatus() ? "On" : "Off");
        $("#overlay").html('<div id="dialogoptions">' + text + '</div>');

        var buttons = {};
        buttons.Ok = function() {
            try {
                $("#dialogoptions").dialog("close");
            } catch {
            }
        };

        $("#dialogoptions").dialog({
            title: "Game options",
            draggable: false,
            resizable: false,
            autoOpen: false,
            width: $("#menu>div").width() * 1.2 + "px",
            minHeight: "auto",
            buttons: buttons,
            close: function() {
                $(".ui-dialog.dialogoptions").remove();
                $("#overlay").html("");
                Menu.showMenu();
            }
        })
        .css("font-size", $("#menu").css("font-size"));

        var parent = $("#dialogoptions").parent();
        var buttons = parent.find("button");
        $(buttons[0]).removeClass("ui-button-icon-only").html("&#10008;");
        parent.addClass("dialogoptions");
        
        $("#dialogoptions").dialog("open");

        $("#dialogoptions .game-button")
        .off("click")
        .on("click", function(e) {
            let action = $(e.target).closest("[action]").attr("action");
            switch (action) {
                case "soundtoggle":
                    State.toggleSoundStatus();
                    DialogOptions.reload();
                    break;
                case "resetlearn":
                    State.resetAchievedChallengeId();
                    DialogOptions.reload();
                    break;
                case "copy":
                    navigator.clipboard.writeText(location.protocol + "//" + location.host + location.pathname + "?s=" + btoa(localStorage.getItem("gameState")));
                    DialogMessage.open("Game URL copied to clipboard", true);
                    break;
                default:
                    console.log("Undefined option button action - " + action);
                    break;
            }
        });

    }
}