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

    refreshTargetText: function() {
        if (!State.activeState.ransomEnabled) {
            return;
        }
        let current = State.getEliminationAverage();
        if (current == 99) {
            State.activeState.lastTargetState = "";
            State.activeState.ransomWarning = false;
        } else {
            State.activeState.lastTargetState = current + " / " + State.targetEliminationAverage;
            State.activeState.ransomWarning = current < State.targetEliminationAverage;
        }
        if (Header.updateCallback) {
            Header.updateCallback();
        }
    },

    evaluateTarget: function() {
        if (!State.activeState.ransomEnabled) {
            return;
        }
        let ave = State.getEliminationAverage();
        if (ave < State.targetEliminationAverage) {
            //DialogMessage.open("Punishment! Meet the ransom demands!");
            let num = Math.max(1, Math.trunc(10 * (State.targetEliminationAverage - ave)));
            //console.log(num);
            State.activeState.freezeEvents += num;
            State.activeState.freezeCount++;
        }

        GameLogic.refreshTargetText();
    },

    setTarget: function() {
        if (!State.activeState.ransomEnabled) {
            return;
        }
        //console.log("setTarget");
        let newTarget = 0;
        if (State.score <= 30) {
            newTarget = 0;
        } else if (State.score <= 200) {
            newTarget = 0.5;
        } else if (State.score <= 300) {
            newTarget = 0.8;
        } else if (State.score <= 400) {
            newTarget = 1.0;
        } else {
            newTarget = (11 + (Math.trunc(State.score / 500))) / 10;
        }
        if (newTarget != State.targetEliminationAverage) {
            State.targetEliminationAverage = newTarget;
            if (State.lastEliminationCounts.length == 0) {
                State.lastEliminationCounts.push(newTarget);
                State.lastEliminationCounts.push(newTarget);
                State.lastEliminationCounts.push(newTarget);
                State.lastEliminationCounts.push(newTarget);
            }
            GameLogic.refreshTargetText();
            if (State.activeState.gameOver) {
                GameLogic.restart(true);
                return;
            }
            DialogMessage.open("Ransom is set at " + newTarget, true);
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
        if (State.gameOn) {
            DialogConfirm.open(gameover ? "GAME OVER" : "Too hard?", "Reduce the score and clear the board?", function() {
                State.clearState();
                runGame();
            });
        } else {
            DialogConfirm.open("Try again?", "Clear the board to start again?", function() {
                PracticeSamples.setupSample(State.lastChallengeId);
            });
        }
    }
}