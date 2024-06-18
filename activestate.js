class ActiveState {
    //Model only
    constructor() {
        this.freezeCount = 0;
        this.eliminationsAfterMoveCount = 0;
        this.eliminationPositionsAfterMove = [];
        this.freeMoveCount = 0;
        this.mouseDownBlockPosition = 0;
        this.prizeBlockDropped = false;
        this.mouseUpBlockPosition = -1;
        this.fallCountAfterMouseUp = 0;
        this.numFilledCells = 0;
        this.eliminations = [0,0,0,0,0];
        this.spawnCount = 0;
        this.freezeEvents = 0;
        this.rewardEvents = 0;
        this.animationBusyCount = 0;
        this.blockingAnimationBusyCount = 0;
        this.frozenCellCount = 0;
        this.lastTargetState = "";
        this.afterSpawn = false;
        this.ransomEnabled = false;
        this.ransomWarning = false;
        this.gameOver = false;
        this.lastTargetHits = 0;
    }
}