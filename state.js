State = {
    //Depends on board.js

    soundOn: true,
    score: 0,
    maxScore: 0,
    targetScore: 0,
    targetMovesLeft: 0,
    moveCount: 0,
    fallCount: 0,
    eliminateCount: 0,
    lastChallengeId: 0,
    activeState: new ActiveState(),
    eliminationPositionsAfterMove: [],
    lastEliminationCounts: [],
    targetEliminationAverage: 0,
    cellWidth: 0,
    gameOn: true,
    timer: null,
    lastGameState: "",
    lastRandomNumbers: "",
    olderRandomNumbers: "",
    blocktargetIndex: 0, //0=Green block, 1=Blue block, 2=Purple block, 3=Yellow block
    movesUntilFreeze: 5,
    hearts: 5,

    initForGame: function () {
        State.activeState = new ActiveState();
        State.activeState.ransomEnabled = true;
        State.gameOn = true;
        State.score = 0;
        State.blocktargetIndex = 0;
        State.movesUntilFreeze = 5;
        State.hearts = 5;
        State.moveCount = 0;
        State.fallCount = 0;
        State.eliminateCount = 0;
        State.lastGameState = "";
        State.targetMovesLeft = 0;
        State.lastEliminationCounts = [];
        State.targetEliminationAverage = 0;
        State.activeState.gameOver = false;
        State.soundOn = State.getSoundStatus();
    },

    initForChallenge: function (challengeId, ransomEnabled) {
        State.activeState = new ActiveState();
        State.activeState.ransomEnabled = ransomEnabled;
        State.gameOn = false;
        State.score = 0;
        State.blocktargetIndex = 0;
        State.movesUntilFreeze = 5;
        State.hearts = 5;
        State.moveCount = 0;
        State.fallCount = 0;
        State.eliminateCount = 0;
        State.lastChallengeId = challengeId;
        State.activeState.gameOver = false;
        if (ransomEnabled) {
            State.score = 185;
            State.lastEliminationCounts = [1, 1, 1, 1, 0, 1];
            //State.activeState.freezeEvents = 2;
        }

        localStorage.setItem("challengeId", "" + challengeId);
        State.soundOn = State.getSoundStatus();
    },

    getEliminationAverage: function () {
        if (State.lastEliminationCounts.length == 0) {
            //console.log("No average");
            return 99;
        }

        //console.log("Calc average");
        var totalWeight = 0;
        var sum = 0;
        for (let index = 0; index < State.lastEliminationCounts.length; index++) {
            totalWeight += index + 1;
            sum += State.lastEliminationCounts[index] * (index + 1);
        }
        let average = sum / totalWeight;
        return Math.round(10 * average) / 10
    },

    getSoundStatus: function() {
        let s = localStorage.getItem("soundOn");
        if (s && s != "1") {
            return false;
        }
        return true;
    },
    toggleSoundStatus: function() {
        var s = localStorage.getItem("soundOn");
        if (!s) {
            s = "1";
        } else {
            s = s == "1" ? "0" : "1";
        }
        localStorage.setItem("soundOn", s);
    },

    getLastChallengeId: function () {
        return localStorage.getItem("challengeId") * 1 || 0;
    },
    getAchievedChallengeId: function () {
        let val = localStorage.getItem("achievedChallengeId");
        if (val == "null") {
            return -1;
        }
        return val * 1;
    },
    setAchievedChallengeId: function (id) {
        let last = State.getAchievedChallengeId();
        if (id > last) {
            localStorage.setItem("achievedChallengeId", id);
            return id;
        }
        return last;
    },
    resetAchievedChallengeId: function () {
        localStorage.setItem("achievedChallengeId", -1);
    },

    clearState: function () {
        //console.log("clearState");
        //localStorage.removeItem("gameOnState");
        if (State.score > 1200) {
            State.score = State.score - 500;
        } else if (State.score > 2200) {
            State.score = State.score - 700;
        } else if (State.score > 3200) {
            State.score = State.score - 900;
        } else if (State.score > 4200) {
            State.score = State.score - 1100;
        } else if (State.score > 6200) {
            State.score = State.score - 1500;
        } else {
            State.score = 0
        }
        State.lastEliminationCounts = [];
        Board.setRows(Array(Board.numRows).fill(Array(8).fill("")));
        State.saveState();
        State.initForGame();
    },

    undo: function () {
        let p = State.lastGameState;
        if (p.length > 1) {
            State.lastGameState = "";
            //console.log("Using " + State.olderRandomNumbers);
            BoardHelper.randomNumbers = State.olderRandomNumbers.split(",");
            State.lastRandomNumbers = State.olderRandomNumbers;
            State.olderRandomNumbers = "";
            localStorage.setItem("gameOnState", p);
            State.restoreFromString(p);
            //console.log("p=" + p);
        } else {
            console.log("No more undo available");
        }
    },

    saveState: function () {
        //console.log("saveState");
        if (State.gameOn) {
            if (State.score > State.maxScore) {
                State.maxScore = State.score;
            }
            let s = State.transformFromBoardToString(Board.getRows()) + "__" + State.transformFromStateToString();
            let p = localStorage.getItem("gameOnState") ?? "";
            if (s != p) {
                //Avoid setting last game state unless a move was made
                State.lastGameState = p;
                localStorage.setItem("gameOnState", s);
                //console.log("p=" + p);
                //console.log("s=" + s);
            }
        } else {
            localStorage.setItem("gameState2", State.transformFromStateToString());
        }
        if (Header.updateCallback) {
            Header.updateCallback();
        }
    },

    getGameScore: function () {
        //console.log("getGameScore");
        let str = localStorage.getItem("gameOnState");
        let parts = str.split("__");
        if (parts[1].length > 0) {
            let arr = parts[1].split("|");
            return arr[0] * 1 || 0;
        }
        return 0;
    },

    getMaxScore: function () {
        //console.log("getGameScore");
        let str = localStorage.getItem("gameOnState");
        let parts = str.split("__");
        if (parts[1].length > 0) {
            let arr = parts[1].split("|");
            return arr[7] * 1 || 0;
        }
        return 0;
    },

    restoreState: function () {
        //console.log("restoreState");
        let str = localStorage.getItem("gameOnState");
        if (str) {
            State.restoreFromString(str);
        }
    },

    restoreFromString: function (str) {
        let parts = str.split("__");
        if (parts[0].length > 0) {
            let state = State.transformFromStringToBoard(parts[0]);
            //console.log(state);
            Board.setRows(state);
        }

        if (parts[1].length > 0) {
            //console.log("restore score " + parts[1]);
            State.transformFromStringToState(parts[1]);
        }
    },

    transformFromStateToString: function () {
        return [State.score, State.moveCount, State.fallCount, State.eliminateCount, State.targetScore, State.targetMovesLeft, State.hearts, State.movesUntilFreeze, State.lastEliminationCounts.join("/"), State.maxScore].join("|");
    },
    transformFromStringToState: function (str) {
        try {
            let arr = str.split("|");
            State.score = arr[0] * 1 || 0;
            State.score = arr[0] * 1 || 0;
            State.moveCount = arr[1] * 1 || 0;
            State.fallCount = arr[2] * 1 || 0;
            State.eliminateCount = arr[3] * 1 || 0;
            State.targetScore = arr[4] * 1 || 0;
            State.targetMovesLeft = arr[5] * 1 || 0;
            State.hearts = arr[6] * 1 || 0;
            State.movesUntilFreeze = arr[7] * 1 || 0;
            State.lastEliminationCounts = [];
            if (arr[6] && arr[6].length > 0) {
                let temp = (arr[6].split("/") || []);
                State.lastEliminationCounts = temp.map(str => str.length == 0 ? 0 : parseInt(str));
            }
            State.maxScore = arr[7] * 1 || 0;
        } catch {
            console.log("Not able to restore score state");
        }
    },

    transformFromBoardToString: function (arr) {
        var result = "";
        for (let index = 0; index < arr.length; index++) {
            result += "|" + arr[index].join(",");
        }
        result = result
            .replace("|", "")
            .replaceAll("frozen", "-")
            .replaceAll("one1", "~")
            .replaceAll("two1", "@").replaceAll("two2", "#")
            .replaceAll("three1", "$").replaceAll("three2", "%").replaceAll("three3", "^")
            .replaceAll("four1", "&").replaceAll("four2", "*").replaceAll("four3", "<").replaceAll("four4", ">");
        return result;
    },

    transformFromStringToBoard: function (str) {
        var result = [];

        try {
            str = str
                .replaceAll("-", "frozen")
                .replaceAll("~", "one1")
                .replaceAll("@", "two1").replaceAll("#", "two2")
                .replaceAll("$", "three1").replaceAll("%", "three2").replaceAll("^", "three3")
                .replaceAll("&", "four1").replaceAll("*", "four2").replaceAll("<", "four3").replaceAll(">", "four4");

            let arr = str.split("|");
            for (let index = 0; index < arr.length; index++) {
                result.push(arr[index].split(","));
            }
        } catch {
            console.log("Not able to restore board state");
        }
        return result;
    }
}