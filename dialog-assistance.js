var DialogAssistance = {
    
    reload: function() {
        try {
            $("#dialogassistance").dialog("destroy");
        } catch {
        }
        DialogAssistance.open();
    },

    open: function(undoAvailable) {
        //console.log("Calc", State.maxScore, State.maxScoreTotalMoveCount, State.score, State.totalMoveCount);
        const summary = State.maxScoreTotalMoveCount == State.totalMoveCount ? "This is your best game so far" : "So far this is [[percent]]% [[betterworse]] than your best game of [[bestscore]] in [[bestmoves]] moves";
        const percentBetter = State.getImprovementPercentage();
        var text = $("#assistance").html()
            //.replace("[[undo]]", "You may undo the last move")
            .replace("[[mode]]", State.activeState.gameOn ? "game" : "this challenge")
            .replace("[[score]]", State.score)
            .replace("[[moves]]", State.totalMoveCount)
            .replace("[[summary]]", summary)
            .replace("[[bestscore]]", State.maxScore)
            .replace("[[bestmoves]]", State.maxScoreTotalMoveCount)
            .replace("[[percent]]", Math.abs(percentBetter))
            .replace("[[betterworse]]", (percentBetter >= 0 ? "better" : "worse"));

        $("#overlay").html('<div id="dialogassistance">' + text + '</div>');
        if (!undoAvailable) {
            $("#overlay .undo").hide();
        }

        var buttons = {};
        // buttons.Ok = function() {
        //     try {
        //         $("#dialogassistance").dialog("close");
        //     } catch {
        //     }
        // };

        $("#dialogassistance").dialog({
            title: "Assistance",
            draggable: false,
            resizable: false,
            autoOpen: false,
            width: $("#menu>div").width() * 1.2 + "px",
            minHeight: "auto",
            buttons: buttons,
            close: function() {
                $(".ui-dialog.dialogoptions").remove();
                $("#overlay").html("");
            }
        })
        .css("font-size", $("#menu").css("font-size"));

        var parent = $("#dialogassistance").parent();
        var buttons = parent.find("button");
        $(buttons[0]).removeClass("ui-button-icon-only").html("&#10008;");
        parent.addClass("dialogoptions");
        
        $("#dialogassistance").dialog("open");

        $("#dialogassistance .game-button")
        .off("click")
        .on("click", function(e) {
            let action = $(e.target).closest("[action]").attr("action");
            switch (action) {
                case "share":
                    $(".ui-dialog.dialogoptions").remove();
                    $("#overlay").html("");
                    BoardHelper.generateSocialMediaPost();
                    DialogMessage.open("A screenshot was copied to your clipboard", false);
                    break;
                // case "undo":
                //     $(".ui-dialog.dialogoptions").remove();
                //     $("#overlay").html("");
                //     State.undo();
                //     Header.update();
                //     State.activeState.gameOver = Board.isGameOver();
                //     GameLogic.refreshTargetText();
                //     break;
                case "restart":
                    $(".ui-dialog.dialogoptions").remove();
                    $("#overlay").html("");
                    GameLogic.restart(false);
                    break;
                default:
                    console.log("Undefined option button action - " + action);
                    break;
            }
        });

    }
}