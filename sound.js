var Sound = {
    //Depends on jquery

    crunchElement: {},
    clickElement: {},
    freezeElement: {},

    init() {
        this.crunchElement = $("#audio_crunch")[0];
        this.clickElement = $("#audio_click")[0];
        this.freezeElement = $("#audio_freeze")[0];
    },

    audioClick: function() {
        if (!State.soundOn) {
            return;
        }

        this.clickElement.play();
    },
    audioCrunch: function() {
        if (!State.soundOn) {
            return;
        }
        
        this.crunchElement.currentTime = 0;
        this.crunchElement.play();
    },
    audioFreeze: function(play) {
        if (!State.soundOn) {
            return;
        }
        
        if (play) {
            this.freezeElement.currentTime = 0;
            this.freezeElement.play();
            // let paused = this.freezeElement.duration == 0 || this.freezeElement.paused;
            // if (paused) {
            //     console.log("play");
            //     this.freezeElement.play();
            // }
        }
        
        if (!play) {
        //     console.log("pause");
             this.freezeElement.pause();
         }
    },

}