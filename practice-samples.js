var PracticeSamples = {
    samples: [],
    dialogButtons: [],
    dialogIsOpen: false,
    timer: null,
    timer2: null,
    title: "",
    status: "",
    flag: false,
    
    close: function() {
        PracticeSamples.dialogIsOpen = false;
        window.clearTimeout(PracticeSamples.timer);
        window.clearTimeout(PracticeSamples.timer2);
        $("div[role=dialog]").remove();
        $("#trainingDialog").remove();
    },

    completeTask: function(index) {
        $("#trainingDialog li#task" + index).css("list-style-type", "disc").css("text-decoration", "line-through");
    },
    
    setupSample: function(id) {
        let achievedId = State.getAchievedChallengeId();
        if (id > (achievedId + 1)) {
            id = achievedId + 1;
        }
        if (id > PracticeSamples.samples.length - 1) {
            id = PracticeSamples.samples.length - 1;
        }
        let sample = PracticeSamples.samples[id];
        PracticeSamples.setupThisSample(id, achievedId, sample[0], sample[1], sample[2], sample[3], sample[4]);
    },

    setupThisSample: function(id, achievedId, sampleRows, tasks, callback, spawnEnabled, ransomEnabled) {
        //console.log("setupSample");
        PracticeSamples.close();
        PracticeSamples.flag = false;
    
        State.lastChallengeId = id;
        var rows = [];
        for (let index = 0; index < sampleRows.length; index++) {
            rows.push(sampleRows[index].split(","));
        }
        var taskContent = "";
        for (let index = 0; index < tasks.length; index++) {
            taskContent += '<li id="task' + index + '">' + tasks[index] + '</li>';
        }
        PracticeSamples.title = "Challenge " + (id + 1);
        $("#bottomPanel").html('<div id="trainingDialog" title="' + PracticeSamples.title + '"><ul>' + taskContent + '</ul></div>');
        let isFirstSample = id == 0;
        let isAchieved = id <= achievedId;
        let isLastSample = id == PracticeSamples.samples.length - 1;
        let nextSampleAvailable = !isLastSample && isAchieved;
        if (isLastSample && isAchieved) {
            PracticeSamples.timer2 = window.setTimeout(function() {
                DialogMessage.open("You have completed all challenges.", false);
            }, 2000);
        }
        //console.log(nextSampleAvailable);
        PracticeSamples.dialogButtons = [
            PracticeSamples.createButton("a", "ui-icon-arrowthick-1-w", !isFirstSample, function() { PracticeSamples.setupSample(id - 1); }),
            PracticeSamples.createButton("&#9851;", "ui-icon-refresh", true, function() { PracticeSamples.setupSample(id); }),
            PracticeSamples.createButton("c", "ui-icon-arrowthick-1-e", nextSampleAvailable, function() { PracticeSamples.setupSample(id + 1); })
        ];
    
        $("#trainingDialog li").css("list-style-type", "circle");

        PracticeSamples.timer = window.setInterval(function() {
            var isOpen = false;
            try {
                isOpen = $("#trainingDialog").dialog("isOpen");
            } catch {
            }
    
            if (!isOpen) {
                PracticeSamples.dialogIsOpen = false;
                window.clearTimeout(PracticeSamples.timer);
                return;
            }
    
            callback();
            var numTasks = 0;
            var numCompleteTasks = 0;
            $('#trainingDialog li[id^=task]').each(function() {
                numTasks++;
                if($(this).css("list-style-type") == "disc"){
                    numCompleteTasks++;
                }
            });

            PracticeSamples.status = Math.floor(100 * numCompleteTasks / numTasks) + "%";
            let newTitle = PracticeSamples.title + ": " + PracticeSamples.status;
            if (newTitle != $("#trainingDialog").dialog("option", "title")) {
                $("#trainingDialog").dialog("option", "title", newTitle);
            }

            //Challenge COMPLETED
            if (numCompleteTasks == numTasks) {
                let isLastSample = id == PracticeSamples.samples.length - 1;
                achievedId = State.setAchievedChallengeId(id);
                if (isLastSample) {
                    DialogMessage.open("Congratulations! You have completed all challenges.", false);
                } else {
                    var buttons = $("#trainingDialog").parent().find("button");
                    $(buttons[3]).button("enable");
                }
                window.clearInterval(PracticeSamples.timer);
            }

            $("#trainingDialog").parent().find("button").blur();

            if (!ransomEnabled) {
                Header.updateCallback();
            }
        }, 200);
    
        Menu.hideMenu();
        State.initForChallenge(id, ransomEnabled);
        Header.init();
        Board.setup(rows.length, rows);
        let speedInterval = spawnEnabled ? 10 : 100;
        Process.setup(true, true, spawnEnabled, speedInterval);

        PracticeSamples.dialogIsOpen = true;
        //PracticeSamples.status = "0%";
        PracticeSamples.adjustSize();
        if (!ransomEnabled) {
            Header.updateCallback = PracticeSamples.updateHeader;
        } else {
            Header.updateCallback = Header.triggerUpdate;
        }
        GameLogic.refreshTargetText();
        Header.updateCallback();
    },

    updateHeader: function() {
        Header.updateWith(PracticeSamples.status, PracticeSamples.title, false);
    },
    
    adjustSize: function() {
        //console.log("showDialog");
        let h = $(document).height() - $("#topPanel").height() - $("#row0").height() - $("#board").height();
        let w = $("#board").width() * 0.95;
        let fs = Math.min(w / 20, h / 20);

        $("#trainingDialog").dialog({
            draggable: false,
            resizable: false,
            width: w,
            position: { my: "top", at: "bottom+5", of: $("#board") },
            buttons: PracticeSamples.dialogButtons,
            close: function() {
                PracticeSamples.close();
                Menu.showMenu();
            }
        });
        $("#trainingDialog").parent().css("font-size", fs + "px");
        var buttons = $("#trainingDialog").parent().find("button");
        $(buttons[0]).removeClass("ui-button-icon-only").html("&#10008;");
        $(buttons[1]).html("&#9756;");
        $(buttons[2]).html("&#10226;");
        $(buttons[3]).html("&#9758;");
    },
    
    createButton: function(t, content, enabled, method) {
        return {
            text: t,
            disabled: !enabled,
            icons: {
                primary: content
            },
            click: function() {
                method();
            }
        }
    }
    
}

PracticeSamples.samples.push([
    [",,two1,two2,,,,", ",four1,four2,four3,four4,,,", ",two1,two2,,,,one1,", ",,one1,four1,four2,four3,four4,"],
    ["Move a block without causing it to drop<br/>(free move).", "Cause a block to drop."],
    function() {
        if (State.activeState.freeMoveCount > 0) {
            PracticeSamples.completeTask(0);
        }
        if (State.activeState.fallCount > 0) {
            PracticeSamples.completeTask(1);
        }
    },
    false,
    false
]);
PracticeSamples.samples.push([
    [",,,,,,,one1", ",,one1,,four1,four2,four3,four4", ",two1,two2,,,,two1,two2", "one1,,one1,,four1,four2,four3,four4"],
    ["Eliminate a row by filling all cells in that row.", "Eliminate all remaining blocks."],
    function() {
        if (State.eliminateCount > 0) {
            PracticeSamples.completeTask(0);
        }
        if (State.eliminateCount > 1) {
            PracticeSamples.completeTask(1);
        }
    },
    false,
    false
]);
PracticeSamples.samples.push([
    [",,,,three1,three2,three3,one1", ",,,,four1,four2,four3,four4", "two1,two2,,,,,two1,two2", ",one1,two1,two2,four1,four2,four3,four4"],
    ["Use one or more free moves", "Eliminate two rows at once."],
    function() {
        if (State.activeState.freeMoveCount > 0) {
            PracticeSamples.completeTask(0);
        }
        if (State.activeState.eliminationsAfterMoveCount > 1) {
            PracticeSamples.completeTask(1);
        }
    },
    false,
    false
]);
PracticeSamples.samples.push([
    [",,,,,one1,two1,two2", ",,,,four1,four2,four3,four4", "two1,two2,,,,,two1,two2", ",one1,two1,two2,four1,four2,four3,four4", "three1,three2,three3,two1,two2,,,one1"],
    ["Use one or more free moves", "Eliminate three rows at once."],
    function() {
        if (State.activeState.freeMoveCount > 0) {
            PracticeSamples.completeTask(0);
        }
        if (State.activeState.eliminationsAfterMoveCount > 2) {
            PracticeSamples.completeTask(1);
        }
    },
    false,
    false
]);
PracticeSamples.samples.push([
    ["four1,four2,four3,four4,three1,three2,three3,", "one1,one1,four1,four2,four3,four4,one1,", "one1,four1,four2,four3,four4,,two1,two2", "two1,two2,,two1,two2,three1,three2,three3", "three1,three2,three3,,four1,four2,four3,four4", "three1,three2,three3,two1,two2,,,"],
    ["Use one or more free moves","Eliminate all blocks using one move<br/>(one drop)."],
    function() {
        if (State.activeState.freeMoveCount > 0) {
            PracticeSamples.completeTask(0);
        }
        if (State.moveCount == 1 && State.activeState.numFilledCells == 0) {
            PracticeSamples.completeTask(1);
        }
    },
    false,
    false
]);
PracticeSamples.samples.push([
    ["four1,four2,four3,four4,,,,", "one1,one1,four1,four2,four3,four4,one1,", "one1,four1,four2,four3,four4,,two1,two2", "two1,two2,,two1,two2,,one1,", ",one1,,four1,four2,four3,four4,", "two1,two2,,two1,two2,,,"],
    ["Eliminate rows to cause new blocks to spawn.", "Eliminate a purple block when it spawns."],
    function() {
        if (State.activeState.spawnCount > 0) {
            PracticeSamples.completeTask(0);
        }
        if (State.activeState.eliminations[2] > 0) {
            PracticeSamples.completeTask(1);
        }
    },
    true,
    false
]);
PracticeSamples.samples.push([
    [",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,"],
    ["Eliminate 5 green blocks.", "Eliminate 5 blue blocks."],
    function() {
        if (State.activeState.eliminations[0] > 4) {
            PracticeSamples.completeTask(0);
        }
        if (State.activeState.eliminations[1] > 4) {
            PracticeSamples.completeTask(1);
        }
    },
    true,
    false
]);
PracticeSamples.samples.push([
    [",two1,two2,,three1,three2,three3,", "four1,four2,four3,four4,,,two1,two2", "one1,one1,four1 frozen,four2 frozen,four3 frozen,four4 frozen,one1,", "one1 frozen,four1,four2,four3,four4,,two1,two2", "two1,two2,,two1,two2,,one1,", ",one1,,four1,four2,four3,four4,", "two1 frozen,two2 frozen,,two1,two2,,,"],
    ["Eliminate all frozen blocks."],
    function() {
        if ($("#board td.frozen").length == 0) {
            PracticeSamples.completeTask(0);
        }
    },
    true,
    false
]);
PracticeSamples.samples.push([
    [",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,", ",,,,,,,"],
    ["Play until you are punished for failing ransom demands.", "Eliminate all frozen blocks"],
    function() {
        if ($("#board td.frozen").length > 0) {
            PracticeSamples.completeTask(0);
            PracticeSamples.flag = true;
        }
        if (PracticeSamples.flag && $("#board td.frozen").length == 0) {
            PracticeSamples.completeTask(1);
            PracticeSamples.flag = false;
        }
    },
    true,
    true
]);
