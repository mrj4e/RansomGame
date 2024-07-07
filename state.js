State = {
    //Depends on board.js

    activeState: new ActiveState(),
    soundOn: true,
    score: 0,
    totalMoveCount: 0,
    moveCount: 0,
    eliminateCount: 0,
    lastChallengeId: 0,
    eliminationPositionsAfterMove: [],
    lastEliminationCounts: [],
    targetEliminationAverage: 0,
    movesUntilFreeze: 0,
    maxScore: 0,
    maxScoreTotalMoveCount: 0,

    initForGame: function () {
        State.activeState = new ActiveState();
        State.activeState.ransomEnabled = true;
        State.activeState.gameOn = true;
        State.score = 0;
        State.hearts = 5;
        State.moveCount = 0;
        State.totalMoveCount = 0;
        State.activeState.fallCount = 0;
        State.eliminateCount = 0;
        State.activeState.lastGameState = "";
        State.lastEliminationCounts = [];
        State.targetEliminationAverage = 0;
        State.activeState.gameOver = false;
        State.soundOn = State.getSoundStatus();
        GameLogic.refreshDifficulty();
    },

    initForChallenge: function (challengeId, ransomEnabled) {
        State.activeState = new ActiveState();
        State.activeState.ransomEnabled = ransomEnabled;
        State.activeState.gameOn = false;
        State.score = 0;
        State.hearts = 5;
        State.moveCount = 0;
        State.activeState.fallCount = 0;
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
        GameLogic.refreshDifficulty();
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
        State.initForGame();
        Board.setRows(Array(Board.numRows).fill(Array(8).fill("")));
        GameLogic.refreshDifficulty();
        State.saveState();
        //State.initForGame();
    },

    undo: function () {
        let p = State.activeState.lastGameState;
        if (p.length > 1) {
            State.activeState.lastGameState = "";
            //console.log("Using " + State.activeState.olderRandomNumbers);
            BoardHelper.randomNumbers = State.activeState.olderRandomNumbers.split(",");
            State.activeState.lastRandomNumbers = State.activeState.olderRandomNumbers;
            State.activeState.olderRandomNumbers = "";
            localStorage.setItem("gameState", p);
            State.restoreFromString(p);
            //console.log("p=" + p);
        } else {
            console.log("No more undo available");
        }
    },

    saveState: function () {
        //console.log("saveState");
        if (State.activeState.gameOn) {
            if (State.score > State.maxScore) {
                State.maxScore = State.score;
                State.maxScoreTotalMoveCount = State.totalMoveCount;
            }
            let s = State.transformFromBoardToString(Board.getRows()) + "__" + State.transformFromStateToString();
            let p = localStorage.getItem("gameState") ?? "";
            if (s != p) {
                //Avoid setting last game state unless a move was made
                State.activeState.lastGameState = p;
                localStorage.setItem("gameState", s);
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
        let str = localStorage.getItem("gameState");
        let parts = str.split("__");
        if (parts[1].length > 0) {
            let arr = parts[1].split("|");
            return arr[0] * 1 || 0;
        }
        return 0;
    },

    getMaxScore: function () {
        State.restoreState();
        return State.maxScore;
    },
    getMaxScoreTotalMoveCount: function () {
        State.restoreState();
        return State.maxScoreTotalMoveCount;
    },

    getImprovementPercentage: function () {
        const bestRate = State.maxScoreTotalMoveCount > 0 ? State.maxScore / State.maxScoreTotalMoveCount : 0;
        const thisRate = State.totalMoveCount > 0 ? State.score / State.totalMoveCount : 0;
        var percentBetter = bestRate > 0 ? Math.round(100 * (thisRate / bestRate - 1)) : 0;
        //console.log("Calc", bestRate, thisRate, percentBetter);
        return percentBetter;
    },

    restoreState: function () {
        //console.log("restoreState");
        let str = localStorage.getItem("gameState");
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
        return [State.score, State.moveCount, State.eliminateCount, State.totalMoveCount, State.movesUntilFreeze, State.lastEliminationCounts.join("/"), State.maxScore, State.maxScoreTotalMoveCount].join("|");
    },
    transformFromStringToState: function (str) {
        let arr = str.split("|");
        var index = 0;
        function getNumber() {
            const value = arr[index] * 1 || 0;
            index++;
            return value;
        }
        function getString() {
            const value = arr[index];
            index++;
            return value;
        }
        try {
            State.score = getNumber();
            State.moveCount = getNumber();
            State.eliminateCount = getNumber();
            State.totalMoveCount = getNumber();
            State.movesUntilFreeze = getNumber();
            const lastEliminationCounts = getString();
            State.maxScore = getNumber();
            State.maxScoreTotalMoveCount = getNumber();

            State.lastEliminationCounts = [];
            if (lastEliminationCounts && lastEliminationCounts.length > 0) {
                let temp = (lastEliminationCounts.split("/") || []);
                State.lastEliminationCounts = temp.map(str => str.length == 0 ? 0 : parseInt(str));
            }
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
            .replaceAll("move", "")
            .replaceAll("animateBlock", "")
            .replaceAll("frozen", "-")
            .replaceAll("one1", "~")
            .replaceAll("two1", "@").replaceAll("two2", "#")
            .replaceAll("three1", "$").replaceAll("three2", "%").replaceAll("three3", "^")
            .replaceAll("four1", "&").replaceAll("four2", "*").replaceAll("four3", "<").replaceAll("four4", ">")
            .replaceAll(" ", "");
        //console.log(result);
        return result;
    },

    transformFromStringToBoard: function (str) {
        var result = [];

        try {
            str = str
                .replaceAll("-", " frozen")
                .replaceAll("~", "one1")
                .replaceAll("@", "two1").replaceAll("#", "two2")
                .replaceAll("$", "three1").replaceAll("%", "three2").replaceAll("^", "three3")
                .replaceAll("&", "four1").replaceAll("*", "four2").replaceAll("<", "four3").replaceAll(">", "four4");

                //console.log(str);
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