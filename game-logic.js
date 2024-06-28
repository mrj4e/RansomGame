var GameLogic = {
    //Depends on animations.js and header.js
    //Called by process.js

    init: function() {
        State.lastRandomNumbers = BoardHelper.randomNumbers.join(",");
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

    registerMove: function(freeMove) {
        //console.log("registerMove");
        //console.log("Saving " + State.lastRandomNumbers);
        //console.log(State.activeState.eliminationsAfterMoveCount);

        State.olderRandomNumbers = State.lastRandomNumbers;
        State.lastRandomNumbers = BoardHelper.randomNumbers.join(",");

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
        GameLogic.evaluateTarget();
        //GameLogic.triggerExtraFreezeEvents();

        if (numAnimations > 0) {
            //GameLogic.startFloatUpAnimationInstances(scoreDelta, numAnimations);
        }
    },

    triggerSave: function () {
        //console.log("triggerSave");
        window.clearTimeout(State.timer);
        State.timer = window.setTimeout(function () {
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
        GameLogic.setTarget();
        State.saveState();
    },

    refreshDifficulty: function() {
        if (State.score <= 50) {
            State.movesUntilFreeze = 10;
        } else if (State.score <= 100) {
            State.movesUntilFreeze = 9;
        } else if (State.score <= 150) {
            State.movesUntilFreeze = 8;
        } else if (State.score <= 200) {
            State.movesUntilFreeze = 7;
        } else if (State.score <= 300) {
            State.movesUntilFreeze = 6;
        } else if (State.score <= 400) {
            State.movesUntilFreeze = 5;
        } else if (State.score <= 500) {
            State.movesUntilFreeze = 4;
        } else if (State.score <= 600) {
            State.movesUntilFreeze = 3;
        } else {
            State.movesUntilFreeze = 2;
        }
    },

    refreshTargetText: function() {
        if (!State.activeState.ransomEnabled) {
            return;
        }

        State.activeState.lastTargetState = State.movesUntilFreeze;

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

    evaluateTarget: function() {
        if (State.activeState.eliminationsAfterMoveCount == 0) {
            State.activeState.freezeEvents += 1;
        }
        return;
        if (!State.activeState.ransomEnabled) {
            return;
        }

        //console.log(State.activeState.eliminations);
        State.activeState.lastTargetHits = State.activeState.eliminations[State.blocktargetIndex];
        const frozenEliminations = State.activeState.eliminations[4];
        //console.log(numAchieved);
        State.activeState.eliminations = [0,0,0,0,0];
        if (State.activeState.lastTargetHits < 1) {
            State.activeState.freezeEvents += 1;
            State.activeState.freezeCount++;
            State.hearts--;
        }
        //if (State.activeState.lastTargetHits > 2) {
        //    State.hearts += 1;
        //}
        State.heartDeltas += frozenEliminations;
        if (frozenEliminations >= 10) {
            frozenEliminations -= 10;
            State.hearts++;
        }

        // let ave = State.getEliminationAverage();
        // if (ave < State.targetEliminationAverage) {
        //     //DialogMessage.open("Punishment! Meet the ransom demands!");
        //     let num = Math.max(1, Math.trunc(10 * (State.targetEliminationAverage - ave)));
        //     //console.log(num);
        //     State.activeState.freezeEvents += num;
        //     State.activeState.freezeCount++;
        // }

        GameLogic.refreshTargetText();
    },

    triggerExtraFreezeEvents: function() {
        if (BoardHelper.getNextRandomNumber() < 0.1) {
            State.activeState.freezeEvents++;
        }
    },

    setTarget: function() {
        if (State.movesUntilFreeze < 0) {
            GameLogic.refreshDifficulty();
        }

        GameLogic.refreshTargetText();
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
        if (State.gameOn) {
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