class ExplodeAnimation {
    //Depends on jquery
    //Called from gamelogic.js

    constructor(id, rowPosition, colPosition, animationCallback) {
        this.animationCallback = animationCallback;
        this.rowPosition = rowPosition;
        this.colPosition = colPosition;
        this.id = "explode" + id + "_" + rowPosition + "_" + colPosition;
        this.element = null;
        this.startAnimation();
    }


    startAnimation() {
        State.activeState.animationBusyCount++;
        //console.log("startAnimation");
        let duration = 500;

        var char = "&#10059;"; //HEAVY EIGHT TEARDROP-SPOKED PROPELLER
        var color = "#FF9999";
        let baseTop = Board.animationPositions.firstCellPos.top + (this.rowPosition - 1) * Board.animationPositions.cellDimensions.height;
        let baseLeft = Board.animationPositions.firstCellPos.left + (this.colPosition - 1) * Board.animationPositions.cellDimensions.width;

        $("#game").append('<div id="' + this.id + '" class="animation" style="color:' + color + '">' + char + '</div>');
        this.element = $("#" + this.id);
        //console.log(this.element);
        //this.element.html(char);
        //this.element.css("color", color);
        //console.log(performance.now());
        let _this = this;
        this.animate({
            duration: duration,
            timing(timeFraction) {
                return 1 - Math.pow(timeFraction, 2);
            },
            draw(progress) {
                let translation = 1 - progress;
                let fs = 0.4 + 2 * translation;
                //console.log(fs);
                _this.element.css("font-size", fs + "em");
                //console.log(_this.element.width());
                let w = _this.element.width() / 2;
                let h = _this.element.height() / 2;
                _this.element.css("top", baseTop - h + "px");
                _this.element.css("left", baseLeft - w + "px");
                _this.element.css("transform" , "rotate(" + 200 * translation + "deg)");
                //console.log(performance.now());
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
            this.animationCallback();
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