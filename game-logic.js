var GameLogic = {
    //Depends on animations.js and header.js
    //Called by process.js

    init: function() {
        State.activeState.lastRandomNumbers = BoardHelper.randomNumbers.join(",");
    },

    calcScoreDelta: function() {
        var scoreDelta = 0;
        switch (State.activeState.eliminationsAfterMoveCount) {
            case 0:
                if (!freeMove) {
                    scoreDelta = 0;
                    //numAnimations = 1;
                }
                break;
            case 1:
                scoreDelta = 1;
                break;
            case 2:
                scoreDelta = 3;
                break;
            case 3:
                scoreDelta = 10;
                break;
            case 4:
                scoreDelta = 20;
                break;
            default:
                scoreDelta = 50;
                break;
        }
        return scoreDelta;
    },

    registerElimination: function(index, classes) {
        State.activeState.eliminations[0] += BoardHelper.countCellsOfType(classes, "one1");
        State.activeState.eliminations[1] += BoardHelper.countCellsOfType(classes, "two1");
        State.activeState.eliminations[2] += BoardHelper.countCellsOfType(classes, "three1");
        State.activeState.eliminations[3] += BoardHelper.countCellsOfType(classes, "four1");
        State.activeState.eliminations[4] += BoardHelper.countCellsOfType(classes, "1 frozen");
        State.activeState.frozenCellCount = $("#board td.frozen").length;

        State.eliminateCount++;
        State.activeState.eliminationsAfterMoveCount++;
        State.activeState.eliminationPositionsAfterMove.push(index);

        if (State.moveCount >= State.movesUntilFreeze) {
            State.activeState.nextSpawnIsFrozen = 1;
        }
    },

    registerMove: function() {
        //console.log("registerMove before moveCount", State.moveCount);
        //console.log("Saving " + State.activeState.lastRandomNumbers);
        //console.log(State.activeState.eliminationsAfterMoveCount);

        State.moveCount++;
        State.totalMoveCount++;
        State.activeState.olderRandomNumbers = State.activeState.lastRandomNumbers;
        State.activeState.lastRandomNumbers = BoardHelper.randomNumbers.join(",");

        State.lastEliminationCounts.push(State.activeState.eliminationsAfterMoveCount);
        while (State.lastEliminationCounts.length > 10) {
            State.lastEliminationCounts.shift();
        }
        //console.log(State.lastEliminationCounts);
        var numAnimations = State.activeState.eliminationsAfterMoveCount;
        //let plus = Math.pow(State.activeState.eliminationsAfterMoveCount, 2);
        //let delta = -1 + plus;
        //console.log(scoreDelta + " " + numAnimations);

        //GameLogic.startFloatUpAnimationInstances(10, 4);
        if (State.activeState.eliminationsAfterMoveCount == 0) {
            //Register mistake
            State.activeState.freezeEvents += 1;
            if (State.moveCount >= State.movesUntilFreeze) {
                State.activeState.nextSpawnIsFrozen++;
            }
        }
        //GameLogic.triggerExtraFreezeEvents();
        GameLogic.setTarget();

        if (numAnimations > 0) {
            //GameLogic.startFloatUpAnimationInstances(scoreDelta, numAnimations);
        }
    },

    triggerSave: function () {
        //console.log("triggerSave");
        window.clearTimeout(State.activeState.timer);
        State.activeState.timer = window.setTimeout(function () {
            GameLogic.considerSave();
        }, 300);
    },

    considerSave: function() {
        if (State.activeState.animationBusyCount > 0 || Process.flagBoardChanges) {
            //console.log("reset save");
            GameLogic.triggerSave();
            return;
        }
        //console.log("Saving");
        State.saveState();
    },
    
    setTarget: function() {
        if (State.moveCount > State.movesUntilFreeze) {
            GameLogic.refreshDifficulty();
            State.moveCount = 1;
        }

        GameLogic.refreshTargetText();
    },

    refreshDifficulty: function(onrestore = false) {
        const value = GameLogic.getMovesUntilFreeze();
        //console.log("refreshDifficulty", value);
        if (!onrestore || State.movesUntilFreeze > value || State.movesUntilFreeze < 0) {
            State.movesUntilFreeze = GameLogic.getMovesUntilFreeze();
        }
    },

    getMovesUntilFreeze: function() {
        if (State.totalMoveCount < 10) return 9;
        if (State.totalMoveCount > 80) return 2;
        return 10 - Math.trunc(State.totalMoveCount / 10);
    },

    refreshTargetText: function() {
        if (!State.activeState.ransomEnabled) {
            return;
        }

        //const used = GameLogic.getMovesUntilFreeze() - State.movesUntilFreeze;
        const temp1 = 'X'.repeat(State.moveCount);
        const temp2 = 'X'.repeat(State.movesUntilFreeze - State.moveCount);
        State.activeState.lastTargetState = temp1.replaceAll('X', '<i class="fas fa-stroopwafel" action="heart"></i>') + temp2.replaceAll('X', '<i class="fas fa-circle" action="heart"></i>');

        // let current = State.getEliminationAverage();
        // if (current == 99) {
        //     State.activeState.lastTargetState = "";
        //     State.activeState.ransomWarning = false;
        // } else {
        //     State.activeState.lastTargetState = current + " / " + State.targetEliminationAverage;
        //     State.activeState.ransomWarning = current < State.targetEliminationAverage;
        // }

        if (Header.updateCallback) {
            Header.updateCallback();
        }
    },


    triggerExtraFreezeEvents: function() {
        if (BoardHelper.getNextRandomNumber() < 0.1) {
            State.activeState.freezeEvents++;
        }
    },

    startFloatUpAnimationInstances: function(score, count) {
        let pos = State.activeState.eliminationPositionsAfterMove.shift();
        GameLogic.startFloatUpAnimationInstance(score, count, pos);

        count--;
        if (count > 0) {
            setTimeout(function() {
                GameLogic.startFloatUpAnimationInstances(score, count);
            }, 300);
        }
    },

    startFloatUpAnimationInstance: function(score, id, pos) {
        if (State.activeState.ransomEnabled) {
            new FloatUpAnimation(id, score, pos, GameLogic.registerAnimationCompletion);
        } else {
            GameLogic.registerAnimationCompletion(score);
        }
    },

    registerAnimationCompletion: function(scoreDelta) {
        //console.log("registerAnimationCompletion");
        State.score += scoreDelta;
        if (scoreDelta > 2) {
            State.activeState.rewardEvents++;
        }
        if (scoreDelta > 4) {
            State.activeState.rewardEvents++;
        }
        if (scoreDelta > 8) {
            State.activeState.rewardEvents++;
        }

        GameLogic.triggerSave();
    },

    restart: function(gameover) {
        if (State.activeState.gameOn) {
            DialogConfirm.open(gameover ? "GAME OVER" : "Too hard?", "Reduce the score and clear the board?", function() {
                State.clearState();
                GameLogic.refreshTargetText();
                Header.update();
                //runGame(false);
            });
        } else {
            DialogConfirm.open("Try again?", "Clear the board to start again?", function() {
                PracticeSamples.setupSample(State.lastChallengeId);
            });
        }
    }
}