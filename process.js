var Process = {
    //Depends on board.js and boardhelper.js and jquery

    timer: null,
    allowSpawing: true,
    allowFalling: true,
    allowEliminating: true,
    speedInterval: 10,
    flagBoardChanges: false,

    init() {
        this.setup(true, true, true, 10);
        Header.updateCallback = Header.triggerUpdate;
        //this.freezeElement.loop = true;
        setTimeout(() => {
            State.activeState.gameOver = Board.isGameOver();
            if (State.activeState.gameOver) {
                GameLogic.restart(true);
            }
        }, 200);

        // setInterval(() => {
        //     console.log("State.nextSpawnIsFrozen = ", State.nextSpawnIsFrozen);
        // }, 2000);
    },

    setup: function(allowFalling, allowEliminating, allowSpawing, speedInterval) {
        this.allowFalling = allowFalling;
        this.allowEliminating = allowEliminating;
        this.allowSpawing = allowSpawing;

        this.stop();
        let _this = this;
        _this.timer = window.setInterval(function() {
            if (!BoardHelper.isBlockBeingMoved) {
                _this.iterate();
            }
        }, speedInterval);
    },

    stop: function() {
        clearInterval(this.timer);
    },

    iterate: function() {
        if (State.activeState.blockingAnimationBusyCount > 0) {
            return;
        }

        var processed = this.fall();
        processed = processed ? processed : this.eliminate();
        processed = processed ? processed : this.spawn();
        processed = processed ? processed : this.freeze();
        //processed = processed ? processed : this.reward();

        BoardHelper.isMoveAllowed = !processed;

        if (processed) {
            Process.flagBoardChanges = true;
        }

        //if quiet
        if (BoardHelper.isMoveAllowed) {
            if (Process.flagBoardChanges) {
                //console.log("Board changes");
                Process.flagBoardChanges = false;

                // if (Header.updateCallback) {
                //     Header.updateCallback();
                // }
                GameLogic.triggerSave();
    
                State.activeState.gameOver = Board.isGameOver();
                if (State.activeState.gameOver) {
                    GameLogic.restart(true);
                }
            }

            //If a move was made
            //console.log(State.activeState.mouseUpBlockPosition);
            if (State.activeState.mouseUpBlockPosition > -1 && State.activeState.mouseUpBlockPosition != State.activeState.mouseDownBlockPosition) {
                //Board.clearAnimateBlocks();
                State.activeState.mouseUpBlockPosition = -1;
                State.activeState.mouseDownBlockPosition = 0;
                if (State.activeState.fallCountAfterMouseUp == 0) {
                    //console.log("free move");
                    State.activeState.freeMoveCount++;
                    GameLogic.triggerSave();
                } else {
                    //console.log("eval after move");
                    GameLogic.registerMove();
                    GameLogic.triggerSave();
                    // if (Header.updateCallback) {
                    //     Header.updateCallback();
                    // }
                }
                State.activeState.numFilledCells = Board.countFilledCells();
            }
        }
    },

    fall: function() {
        if (!this.allowFalling) {
            return false;
        }

        let rows = $("#board tr");
        for (let index = rows.length - 2; index > 0; index--) {
            let cellsAbove = $(rows[index]).find("td");
            let cellsBelow = $(rows[index + 1]).find("td");
            //console.log(cells);
            let dropped = BoardHelper.transformRowDrop(cellsAbove, cellsBelow);

            if (dropped) {
                Sound.audioClick();

                Board.paintRow(getIds(rows[index].cells), dropped.classesAbove);
                Board.paintRow(getIds(rows[index + 1].cells), dropped.classesBelow);
                State.activeState.fallCount++;
                State.activeState.fallCountAfterMouseUp++;
                //console.log("fall");
                return true;
            }
        }
        return false;
    },

    spawn: function() {
        if (!this.allowSpawing) {
            return false;
        }

        let cells = $("#board tr:nth-child(2)")[0].cells;
        let spawnClasses = BoardHelper.getSpawnDetails(cells);
        let finalClasses = [];

        if (spawnClasses) {
            for (let index = 0; index < spawnClasses.length; index++) {
                finalClasses.push(spawnClasses[index]);
            }

            State.activeState.spawnCount++;
            //console.log("Spawn", State.movesUntilFreeze);
            if (State.nextSpawnIsFrozen > 0) {
                //console.log("X State.nextSpawnIsFrozen = ", State.nextSpawnIsFrozen);
                State.nextSpawnIsFrozen--;
                finalClasses = [];
                for (let index = 0; index < spawnClasses.length; index++) {
                    if (spawnClasses[index].length > 0)
                        finalClasses.push(spawnClasses[index] + " frozen animateBlock");
                    else
                        finalClasses.push("");
                }
                Board.timedClearAnimation();
            }

            //console.log(finalClasses);
            Board.paintRow(getIds(cells), finalClasses);
            State.activeState.afterSpawn = true;
            return true;
        }

        return false;
    },

    eliminate: function() {
        if (!this.allowEliminating) {
            return false;
        }

        let rows = $("#board tr");
        for (let index = rows.length - 1; index > 0; index--) {
            let cells = $(rows[index]).find("td");
            let eliminateClasses = BoardHelper.getEliminations(cells);
            if (eliminateClasses) {
                let classes = getClasses(cells);
                GameLogic.registerElimination(index, classes);

                for (let col = 1; col <= 8; col++) {
                    Sound.audioCrunch();
                    new CellFadeAnimation(index, function() {
                        //console.log("CellFadeAnimation complete");
                        Board.paintRow(getIds(cells), eliminateClasses);
                    });
                }

                //Trigger float up animations now
                GameLogic.startFloatUpAnimationInstance(GameLogic.calcScoreDelta(), State.eliminateCount, index);

                //console.log("eliminate " + State.activeState.eliminationsAfterMoveCount);
                return true;
            }
        }
        return false;
    },

    freeze: function() {
        if (State.activeState.freezeEvents <= 0) {
            return false;
        }

        let cells = Board.getMoveableCells();
        let animateDuration = Math.max(cells.length - 6, 5) * 40;
        State.activeState.freezeEvents--;
        var clearAnimationTimer;
        clearTimeout(clearAnimationTimer);

        if (!State.activeState.gameOver && cells.length > 0) {
            let randomIndex = Math.floor(Math.random() * cells.length);
            let rowIndex = $(cells[randomIndex]).index();
            let row = $(cells[randomIndex]).siblings().addBack();
            let ids = getIds(row);
            //console.log(ids);
            let classes = getClasses(row);
            let blockDetails = getBlockDetailsFromClass(classes[rowIndex]);
            //console.log(blockDetails);
            //console.log(classes);
            for (let index = 0; index < blockDetails.numCells; index++) {
                classes[rowIndex + index] = classes[rowIndex + index] + " frozen animateBlock";
            }
            Board.timedClearAnimation();

            //console.log(classes);
            let cell$ = $(cells[randomIndex]); 
            new FreezeAnimation(State.activeState.freezeEvents, animateDuration, cell$, blockDetails.numCells);
            //Sound.audioFreeze(true);
            // if (State.activeState.freezeEvents <= 0) {
            //     setTimeout(function() {
            //         Sound.audioFreeze(false);
            //     }, 1000);
            // }
            Board.paintRow(ids, classes);
            GameLogic.triggerSave();

            return true;
        }

        //Board.clearAnimateBlocks();
        //Sound.audioFreeze(false);

        return false;
    },

    reward: function() {
        if (State.activeState.rewardEvents < 0) {
            State.activeState.rewardEvents = 0;
        }
        if (State.activeState.rewardEvents == 0) {
            return false;
        }

        //console.log("reward");
        let cells = $("#board td[class$=1]:not(frozen):not(prize)");
        State.activeState.rewardEvents += -5;
        if (cells.length > 0) {
            let randomIndex = Math.floor(Math.random() * cells.length);
            let rowIndex = $(cells[randomIndex]).index();
            //console.log(rowIndex);
            let row = $(cells[randomIndex]).siblings().addBack();
            let ids = getIds(row);
            //console.log(ids);
            let classes = getClasses(row);
            let blockDetails = getBlockDetailsFromClass(classes[rowIndex]);
            //console.log(blockDetails);
            //console.log(classes);
            for (let index = 0; index < blockDetails.numCells; index++) {
                classes[rowIndex + index] = classes[rowIndex + index] + " prize";
            }
            //console.log(classes);
            Board.paintRow(ids, classes);
            GameLogic.triggerSave();

            return true;
        }

        return false;
    },

}