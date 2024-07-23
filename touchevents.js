var TouchEvents = {
    //Depends on board.js and boardhelper.js and jquery

    isMouseDown: false,
    sourceIndex: 0,
    sourceClass: "",
    sourceElement: null,
    originalElements: {},
    originalIds: [],
    originalClasses: [],
    downX: 0,
    moveDelta: 0,
    finalMoveDelta: 0,
    hasTouchscreen: false,
    
    startEvent: function() {
        return this.hasTouchscreen ? "touchstart" : "mousedown";
    },
    moveEvent: function() {
        return this.hasTouchscreen ? "touchmove" : "mousemove";
    },
    endEvent: function() {
        return this.hasTouchscreen ? "touchend" : "mouseup";
    },
    allEvents: function() {
        return "mousedown touchstart mousemove touchmove mouseup touchend";
    },

    cellmousedown: function(e) {
        e.stopPropagation();
        this.sourceElement = null;
        if (!BoardHelper.isMoveAllowed) {
            return;
        }
        // if (State.activeState.gameOver) {
        //     DialogMessage.open("Sorry. Game Over.", true);
        //     return;
        // }
        State.activeState.eliminationsAfterMoveCount = 0;
        State.activeState.eliminationPositionsAfterMove = [];
        State.activeState.fallCountAfterMouseUp = 0;
        State.activeState.mouseUpBlockPosition = -1;
        this.moveDelta = 0;
        this.finalMoveDelta = 0;
        if (e.target.className.length > 0) {
            if (e.target.className.indexOf("frozen") > -1) {
                Process.flagBoardChanges = true;
                //DialogMessage.open("As punishment, you can no longer move this block.", true);
                return;
            }
            //console.log("mousedown");
            //console.log(e.target.className);
            this.sourceElement = e.target;
            this.downX = this.hasTouchscreen ? e.touches[0].clientX : e.clientX;
            this.sourceIndex = $(this.sourceElement).index();
            this.sourceClass = this.sourceElement.className;
            let moveDetails = BoardHelper.getMoveDetails(this.sourceIndex, this.sourceIndex, this.sourceClass);
            //console.log("cellmousedown", moveDetails.sourceIndex, moveDetails.blockDetails.numCells);
            this.originalElements = $(this.sourceElement).siblings().addBack();
            this.originalIds = getIds(this.originalElements);
            this.originalClasses = getClasses(this.originalElements);
            State.activeState.mouseDownBlockPosition = BoardHelper.getBlockPosition(this.sourceIndex, this.sourceClass);
            State.activeState.afterSpawn = false;

            for (let index = 0; index < this.originalClasses.length; index++) {
                if (index >= moveDetails.sourceIndex && index < moveDetails.sourceIndex + moveDetails.blockDetails.numCells) {
                    this.originalClasses[index] = this.originalClasses[index] + " move";
                }
            }
            Board.paintHighlight(moveDetails.sourceIndex, moveDetails.sourceIndex + moveDetails.blockDetails.numCells);
            Board.paintRow(this.originalIds, this.originalClasses);
            this.startMove();
        }
    },
    
    cellmousemove: function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.buttons == 0 && this.isMouseDown) {
            //console.log("cellmousemove stopMove");
            this.stopMove();
        }
        if (this.isMouseDown) {
            //console.log(e.touches[0].clientX + " " + this.downX + " " + State.activeState.cellWidth);
            let thisX = this.hasTouchscreen ? e.touches[0].clientX : e.clientX;
            this.moveDelta = Math.floor(0.5 + (thisX - this.downX) / State.activeState.cellWidth);
            //console.log(this.moveDelta);
            //console.log(this.sourceElement);
            let targetIndex = this.sourceIndex + this.moveDelta;
            let moveDetails = BoardHelper.getMoveDetails(this.sourceIndex, targetIndex, this.sourceClass);
            //console.log(moveDetails);
            if (moveDetails) {
                //console.log(this.originalClasses);
                let newClasses = BoardHelper.transformRow(this.originalClasses, moveDetails.sourceIndex, moveDetails.targetIndex, moveDetails.blockDetails.numCells);
                //console.log(newClasses);
                if (newClasses) {
                    this.finalMoveDelta = moveDetails.targetIndex - moveDetails.sourceIndex;
                    Board.paintHighlight(moveDetails.targetIndex, moveDetails.targetIndex + moveDetails.blockDetails.numCells);
                    Board.paintRow(this.originalIds, newClasses);
                    //this.sourceElement = e.target;
                }
            }
        }
    },

    windowmousemove: function(e) {
        //console.log("mousemove");
        //console.log(e.touches[0].clientX);
        if (e.buttons == 0 && this.isMouseDown) {
            //console.log("windowmousemove stopMove");
            this.stopMove();
        }
    },

    windowmouseup: function(e) {
        //console.log("mouseup");
        if (!BoardHelper.isMoveAllowed) {
            //console.log("mouseup cancelled");
            return;
        }
        if (this.isMouseDown) {
            //console.log("mouseup triggered");
            //console.log(e);
            //console.log("windowmouseup stopMove");
            this.stopMove();
        }
    },

    startMove: function() {
        this.isMouseDown = true;
        BoardHelper.isBlockBeingMoved = true;
        //console.log("startMove " + State.activeState.mouseDownBlockPosition);
    },
    stopMove: function() {
        Process.flagBoardChanges = true;
        this.isMouseDown = false;
        BoardHelper.isBlockBeingMoved = false;

        //A move was made?
        //console.log("stopMove " + this.sourceIndex + " " + this.finalMoveDelta);
        Board.clearHighlight();
        Board.clearMove();
        if (Math.abs(this.finalMoveDelta) > 0) {
            let targetIndex = this.sourceIndex + this.finalMoveDelta;
            //console.log("stopMove " + targetIndex);
            State.activeState.mouseUpBlockPosition = BoardHelper.getBlockPosition(targetIndex, this.sourceClass);
            //console.log("stopMove " + State.activeState.mouseUpBlockPosition);
            //State.activeState.eliminationsAfterMoveCount = 0;
            //State.activeState.fallCountAfterMouseUp = 0;
        }
    }

}