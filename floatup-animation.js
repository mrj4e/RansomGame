class FloatUpAnimation {
    //Depends on jquery
    //Called from gamelogic.js

    constructor(id, scoreDelta, rowPosition, animationCallback) {
        this.scoreDelta = scoreDelta;
        this.animationCallback = animationCallback;
        this.rowPosition = rowPosition;
        this.id = "anim" + id;
        this.element = null;
        this.startAnimation();
    }


    startAnimation() {
        State.activeState.animationBusyCount++;
        //console.log("startAnimation");
        let duration = 800;

        var char = "&#9733;"; //Star
        var color = "yellow";
        let baseTop = Board.animationPositions.firstCellPos.top + (this.rowPosition - 1) * Board.animationPositions.cellDimensions.height;
        let baseLeft = Board.animationPositions.firstCellPos.left + 3 * Board.animationPositions.cellDimensions.width;
        var source = {top: baseTop, left: baseLeft};
        var dest = {top: Board.animationPositions.scorePos.top, left: Board.animationPositions.scorePos.left};
        if (this.scoreDelta < 0) {
            char = "&#10006;"; //Cross
            color = "#FF4444";
            let temp = source;
            source = dest;
            dest = temp;
        }
        let delta = {top: dest.top - source.top, left: dest.left - source.left};

        $("#game").append('<div id="' + this.id + '" class="animation" style="color:' + color + '">' + char + '</div>');
        this.element = $("#" + this.id);
        //console.log(this.element);
        //this.element.html(char);
        //this.element.css("color", color);
        let _this = this;
        this.animate({
            duration: duration,
            timing(timeFraction) {
                return 1 - Math.pow(timeFraction, 2);
            },
            draw(progress) {
                let size = _this.scoreDelta < 0 ? 1 - progress : progress;
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
        //console.log("endAnimation");
        this.element.remove();
        this.element = null;
        if (this.animationCallback) {
            this.animationCallback(this.scoreDelta);
        }
        State.activeState.animationBusyCount--;
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