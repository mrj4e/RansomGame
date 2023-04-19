class CellFadeAnimation {
    //Depends on jquery
    //Called from gamelogic.js

    constructor(rowPosition, animationCallback) {
        this.animationCallback = animationCallback;
        this.rowPosition = rowPosition;
        this.elements = null;
        this.startAnimation();
    }


    startAnimation() {
        function newColor(oldColor) {
            const delta = 9;
            function calc(c) {
                if (c <= delta) {
                    return 0;
                }
                return c - delta;
            }
            return {
                red: calc(oldColor.red),
                green: calc(oldColor.green),
                blue: calc(oldColor.blue),
                hasBorder: oldColor.hasBorder
            };
        }

        State.activeState.animationBusyCount++;
        State.activeState.blockingAnimationBusyCount++;

        //console.log("startAnimation");
        let duration = 400;

        this.elements = $("#board tr#row" + this.rowPosition + " td");
        //console.log(this.elements);

        let _this = this;

        var colors = [];
        this.elements.each(function(i) {
            //console.log(_this.elements[i]);
            let e = $(_this.elements[i]);
            e.removeClass("frozen").removeClass("prize").addClass("elimination");
            let b = e.css("border-right-color") == "rgb(255, 255, 255)";
            var c = e.css("background-color");
            c = c
                .replace("rgba", "")
                .replace("rgb", "")
                .replace("(", "")
                .replace(")", "");
            let p = c.split(","); // get Array["R","G","B"]
            //console.log(p);
            colors.push({
                red: parseInt(p[0]),
                green: parseInt(p[1]),
                blue: parseInt(p[2]),
                hasBorder: !b
            });
        });

        //console.log(colors);

        //this.element.html(char);
        //this.element.css("color", color);
        //console.log(performance.now());
        this.animate({
            duration: duration,
            draw() {
                var newColors = [];
                _this.elements.each(function(i) {
                    //console.log(_this.elements[i]);
                    let e = $(_this.elements[i]);
                    newColors.push(newColor(colors[i]));
                    let c = newColors[i];
                    let cs = "rgb(" + c.red + "," + c.green + "," + c.blue + ")";
                    e.css("background-color", cs);
                    if (c.hasBorder) {
                        e.css("border-right-color", cs);
                    }
                });
                colors = newColors;
            },
            endCallback() {
                _this.endAnimation();
            }
        });
    }


    endAnimation() {
        //console.log("endAnimation");
        if (this.animationCallback) {
            this.animationCallback();
        }
        let _this = this;
        this.elements.each(function(i) {
            let e = $(_this.elements[i]);
            e.css("background-color", "");
            e.css("border-right-color", "");
        });
        State.activeState.animationBusyCount--;
        State.activeState.blockingAnimationBusyCount--;
        GameLogic.triggerSave();
    }


    animate({draw, duration, endCallback}) {

        let start = performance.now();
      
        requestAnimationFrame(function animate(time) {
          // timeFraction goes from 0 to 1
          let timeFraction = (time - start) / duration;
          if (timeFraction > 1) timeFraction = 1;
      
          draw(); // draw it
      
          if (timeFraction < 1) {
            requestAnimationFrame(animate);
          } else {
            endCallback();
          }
      
        });
    }

}