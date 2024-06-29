var johan = {}
$(function() {
    //Depends on board.js and process.js
    TouchEvents.hasTouchscreen = 'ontouchstart' in window;
    //console.log(TouchEvents.hasTouchscreen);
    
    //Restore game state from URL if provided
    let s = location.search.split("s=")[1];
    if (s) {
        if (s == "clear") {
            localStorage.setItem("gameOnState", "");
        } else {
            localStorage.setItem("gameOnState", atob(s));
        }
        location.href = location.protocol + "//" + location.host + location.pathname;
    }

    setAppVersion();
    Sound.init();
    Menu.showMenu();

    $(window).resize(function() {
        if (Menu.showingMenu()) {
            Menu.adjustSize();
        } else {
            Header.adjustSize();
            Board.adjustSize();
            if (PracticeSamples.dialogIsOpen) {
                PracticeSamples.adjustSize();
            }
        }
    });
});

function setAppVersion() {
    var header = 'etag: "65857303"\r\nlast-modified: sat, 21 jan 2023 06:00:00 gmt\r\nreferrer-policy: same-origin';
    if (location.protocol != "file:") {
        var req = new XMLHttpRequest();
        req.open('GET', document.location, false);
        req.send(null);
        header = req.getAllResponseHeaders().toLowerCase();
    }
    let lm = header.split("last-modified: ")[1].split('\r\n')[0];
    //console.log(lm);
    let dt = new Date(lm);
    let v = dt.toLocaleString();
    console.log("App version = " + v);
    $("#version").html(v);
}

function runGame(restore) {
    State.initForGame();
    Menu.hideMenu();
    /*State.init();*/
    Header.init();
    Process.init();
    Board.init();
    if (restore) {
        State.restoreState();
        const last = State.movesUntilFreeze;
        GameLogic.refreshDifficulty();
        State.movesUntilFreeze = last;
    } else {
        State.saveState();
    }
    GameLogic.refreshTargetText();
}
