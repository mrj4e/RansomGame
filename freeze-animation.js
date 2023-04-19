class FreezeAnimation {
    //Depends on jquery
    //Called from gamelogic.js

    constructor(id, duration, cell$, numCells) {
        this.cell$ = cell$;
        this.numCells = numCells;
        this.id = "freeze" + id;
        this.element = null;
        this.duration = duration;
        this.startAnimation();
    }


    startAnimation() {
        State.activeState.animationBusyCount++;
        State.activeState.blockingAnimationBusyCount++;
        //console.log("startAnimation " + this.id);
        var char = "&#10006;"; //Cross
        var color = "#FF4444";
        let pos = this.cell$.offset();
        let cellTop = pos.top;
        let cellLeft = pos.left + Board.animationPositions.cellDimensions.width * this.numCells / 2;
        var source = {top: Board.animationPositions.scorePos.top, left: Board.animationPositions.scorePos.left + 5 * Board.animationPositions.cellDimensions.width};
        var dest = {top: cellTop, left: cellLeft};
        let delta = {top: dest.top - source.top, left: dest.left - source.left};

        $("#game").append('<div id="' + this.id + '" class="animation" style="color:' + color + '">' + char + '</div>');
        this.element = $("#" + this.id);
        //console.log(this.element);
        //this.element.html(char);
        //this.element.css("color", color);
        Sound.audioFreeze(true);
        let _this = this;
        this.animate({
            duration: this.duration,
            timing(timeFraction) {
                return 1 - Math.pow(timeFraction, 2);
            },
            draw(progress) {
                let size = progress;
                let translation = 1 - progress;
                _this.element.css("font-size", 9 * size + "em");
                let w = _this.element.width() / 2;
                let h = _this.element.height() / 2;
                _this.element.css("top", source.top + delta.top * translation - h + "px");
                _this.element.css("left", source.left + delta.left * translation - w + "px");
                _this.element.css("transform" , "rotate(" + 360 * translation + "deg)");
                //console.log(_this.element.position());
                //GameLogic.triggerSave();
            },
            endCallback() {
                _this.endAnimation();
            }
        });
    }

    endAnimation() {
        //console.log("endAnimation " + this.id);
        Sound.audioFreeze(false);
        this.element.remove();
        this.element = null;
        State.activeState.animationBusyCount--;
        State.activeState.blockingAnimationBusyCount--;
        GameLogic.triggerSave();
    }


    animate({timing, draw, duration, endCallback}) {

        let start = performance.now();
      
        requestAnimationFrame(function animate(time) {
          // timeFraction goes from 0 to 1
          let timeFraction = (time - start) / duration;
          if (timeFraction > 1) timeFraction = 1;
      
          // calculate the current animation state
          let progress = timing(timeFraction)
      
          draw(progress); // draw it
      
          if (timeFraction < 1) {
            requestAnimationFrame(animate);
          } else {
            endCallback();
          }
      
        });
    }

}