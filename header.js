var Header = {
    //Depends on jquery and state
    timer: null,
    updateCallback: null,

    init: function() {
        Header.setup();;
    },

    setup: function() {
        Header.adjustSize();
        $("#topPanel .game-button")
            .off("click")
            .on("click", function(e) {
                e.stopPropagation();
                let action = $(e.target).attr("action");
                switch (action) {
                    case "home":
                        Menu.showMenu();
                        break;
                
                    case "heart":
                        DialogAssistance.open(State.activeState.lastGameState.length > 1);
                        break;

                    default:
                        console.log("Undefined header button action - " + action);
                        break;
                }
            });
        // $("#topPanelParent")
        //     .off("click")
        //     .on("click", function(e) {
        //         e.stopPropagation();
        //         if (State.activeState.ransomEnabled) {
        //             DialogMessage.open("The ransom demands elimination of " + State.targetEliminationAverage + " rows per move (average). You delivered " + State.getEliminationAverage() + ".", false);
        //         }
        //     });
    },

    triggerUpdate: function() {
        window.clearTimeout(Header.timer);
        Header.timer = window.setTimeout(function() {
            Header.update();
        }, 200);
    },

    update: function() {
        Header.updateWith("Score " + State.score, State.activeState.lastTargetState, true);
    },

    updateWith: function(leftTop, rightTop, hasLifeLine) {
        //console.log("updateWith");
        $("#topPanelLeftTop").html(leftTop);
        $("#topPanelRightTop").html(rightTop);
        $("#topPanelRightBottom span").css("visibility", hasLifeLine ? "visible" : "hidden");
        $("#topPanelRightTop").removeClass("animateText");
        if (State.activeState.ransomWarning) {
            $("#topPanelRightTop").addClass("animateText");
        }
    },

    getLikelyBoardSize: function() {
        let h = $(document).height() - 50;
        let w = $(document).width();
        let hd = h / 13;
        let wd = w / 8;
        return 8 * Math.floor(Math.min(hd, wd) - 0.4);
    },

    adjustSize: function() {
        //console.log("resize");
        if (!$("#game").is(":visible")) {
            return;
        }
        $("#game").hide();

        let h = $(document).height();
        let w = Header.getLikelyBoardSize();
        //console.log(h + " " + w);

        let fs = Math.max(9.5, Math.min(w / 15, h/20));
        $("#game").css("font-size", fs + "px");
        /*
        let bs = fs * 0.8;
        let s = 1.5 * fs / 21;
        $("#topPanel span.ui-icon")
            .css("width", bs + "px").css("height", bs + "px")
            .css("transform", "scale(" + s + ")");
        */
        // let hd = h / 13;
        // let wd = w / 8;
        // //console.log(hd + " " + wd);
        // cellSize = Math.floor(Math.min(hd, wd) - 0.4);
        // //console.log(cellSize);
        // //console.log($("#board td").width());
        // if ($("#board td").width() != cellSize) {
        //     //console.log("resizing");
        //     $("#board td").width(cellSize);
        //     $("#board tr:not(#row0)").height(cellSize);
        // }
        $("#game").show();

        // PracticeSamples.showDialog();
    },

}