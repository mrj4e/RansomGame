var Menu = {
    //Depends on jquery

    showingMenu: function() {
        return $("#menu").is(":visible");
    },

    showMenu: function() {
        setTimeout( function() {
            $("#overlay").html("");
        }, 500);
        PracticeSamples.close();
        $("#game").hide();
        //$("#menu").show();
        this.adjustSize();

        $("#menu .game-button")
            .off("click")
            .on("click", function(e) {
                let action = $(e.target).closest("[action]").attr("action");
                switch (action) {
                    case "game":
                        runGame();
                        break;
                    case "practice":
                        PracticeSamples.setupSample(State.getLastChallengeId());
                        break;
                    case "options":
                        $("#menu .game-button").off("click");
                        $("#menu").hide();
                        $("#game").hide();
                        DialogOptions.open();
                        break;
                    default:
                        console.log("Undefined menu button action - " + action);
                        break;
                }
            });
    },

    hideMenu: function() {
        //console.log("hideMenu");
        $("#menu .game-button").off("click");
        $("#menu").hide();
        $("#game").show();
    },

    adjustSize: function() {
        //console.log("resize");
        $("#menu").hide();

        let h = $(document).height();
        let w = $(document).width();
        //console.log(w);

        let fs = Math.min(w / 18, h / 22);
        $("#menu").css("font-size", fs + "px");
        
        let mw = Math.min(w, h) * 0.7;
        let tm = mw / 2;
        $("#menu>div").css("width",  mw + "px");
        $("#menu>div").css("margin-top",  tm + "px");

        $("#menu").show();
    }
}