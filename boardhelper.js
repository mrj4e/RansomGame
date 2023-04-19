var BoardHelper = {
    //Depends on utils.js
    //Can unit test

    isBlockBeingMoved: false,
    isMoveAllowed: false,
    randomNumbers: [],
    spawnSeeds: [],

    init: function () {
        this.getNextRandomNumber();
        let seeds = [];
        seeds.push("four1,four2,four3,four4,,,,");
        seeds.push(",four1,four2,four3,four4,,,");
        seeds.push(",,four1,four2,four3,four4,,");
        seeds.push(",,,four1,four2,four3,four4,");
        seeds.push(",,,,four1,four2,four3,four4");
        seeds.push("four1,four2,four3,four4,one1,,,");
        seeds.push(",four1,four2,four3,four4,,one1,");
        seeds.push(",,four1,four2,four3,four4,,one1");
        seeds.push("one1,,,four1,four2,four3,four4,");
        seeds.push(",three1,three2,three3,four1,four2,four3,four4");
        seeds.push(",,,one1,four1,four2,four3,four4");
        seeds.push("four1,four2,four3,four4,,two1,two2,");
        seeds.push(",four1,four2,four3,four4,,two1,two2");
        seeds.push("two1,two2,four1,four2,four3,four4,,");
        seeds.push(",two1,two2,four1,four2,four3,four4,");
        seeds.push("two1,two2,,,four1,four2,four3,four4");
        seeds.push("four1,four2,four3,four4,,three1,three2,three3");
        seeds.push("three1,three2,three3,four1,four2,four3,four4,");
        seeds.push("three1,three2,three3,,four1,four2,four3,four4");
        seeds.push(",one1,,,two1,two2,,");
        seeds.push(",,one1,three1,three2,three3,,");
        seeds.push("two1,two2,,,,two1,two2,");
        seeds.push(",,two1,two2,,,,one1");
        seeds.push("one1,,two1,two2,,three1,three2,three3");
        seeds.push(",two1,two2,,three1,three2,three3,");
        seeds.push("two1,two2,three1,three2,three3,,one1,");
        seeds.push(",,two1,two2,one1,,,");
        seeds.push(",,,one1,,one1,,");
        seeds.push(",,three1,three2,three3,two1,two2,one1");
        seeds.push(",three1,three2,three3,,two1,two2,");
        seeds.push(",,,three1,three2,three3,,");
        seeds.push(",,three1,three2,three3,three1,three2,three3");
        seeds.push("one1,,,,three1,three2,three3,");
        this.spawnSeeds = seeds;
    },

    getNextRandomNumber: function() {
        while (this.randomNumbers.length < 10) {
            this.randomNumbers.unshift(Math.random());
        }

        //console.log("getNextRandomNumber");
        return this.randomNumbers.pop();
    },

    countCellsOfType: function(cells, type) {
        //console.log(cells.filter(c => c == type));
        return cells.filter(c => c.indexOf(type) > -1).length;
    },

    getBlockPosition: function(sourceIndex, className) {
        let blockDetails = getBlockDetailsFromClass(className);
        let delta = 1 - blockDetails.selectedNum;
        //console.log(sourceIndex + delta);
        return sourceIndex + delta;
    },

    getMoveDetails: function(sourceIndex, targetIndex, className) {
        let blockDetails = getBlockDetailsFromClass(className);
        let delta = 1 - blockDetails.selectedNum;
        //console.log(delta);
        sourceIndex = Math.max(0, sourceIndex + delta);
        targetIndex = Math.max(0, targetIndex + delta);
        let maxIndex = 8 - blockDetails.numCells;
        if (targetIndex > maxIndex) {
            targetIndex = maxIndex;
        }

        return {sourceIndex, targetIndex, blockDetails};
    },

    transformRow: function(classes, from, to, numCells) {
        //var classes = getClasses(cells);
        return moveWithCollisionDetection(classes, from, to, numCells);
    },

    transformRowDrop: function(cellsAbove, cellsBelow) {
        let classesAbove = getClasses(cellsAbove);
        let classesBelow = getClasses(cellsBelow);
        let dropped = processDropFromClasses(classesAbove, classesBelow);
        if (!dropped) {
            return null;
        }
        return {
            classesAbove: dropped.classesAbove,
            classesBelow: dropped.classesBelow,
            containsPrize: dropped.containsPrize
        };
    },

    getSpawnDetails: function(cells) {

        let classes = getClasses(cells);

        if (classes.join("").length == 0) {
            let index = Math.floor(this.getNextRandomNumber() * this.spawnSeeds.length);

            //console.log(index);
            return this.spawnSeeds[index].split(",");
        }

        return null;
    },

    markAsPrize: function(classes, isPrize) {
        var result = [];
        classes.forEach(c => {
            result.push(isPrize && c.length > 0 ? c + " prize" : c);
        });
        return result;
    },

    getEliminations: function(cells) {
        //console.log(cells);
        let classes = getClasses(cells);
        let eliminate = classes.indexOf("") == -1;

        if (eliminate) {
            for (let index = 0; index < classes.length; index++) {
                classes[index] = ""
            }

            return classes;
        }

        return null;
    },

    hasPossibleMove: function(rows) {
        let rowindexlimit = rows.length - 1;

        function exploreMoves(classes, callback) {
            //Check current layout
            if (callback(classes)) {
                return;
            }

            for (let colindex = 0; colindex < classes.length; colindex++) {
                let className = classes[colindex];
                if (className.indexOf("1") > -1 && className.indexOf("frozen") == -1) {
                    //console.log(rowindex + " " + colindex + " " + className);
                    let blockDetails = getBlockDetailsFromClass(className);
                    //console.log(blockDetails);

                    //Check move left
                    var to = colindex;
                    while (to > 0) {
                        let move = moveWithCollisionDetection(classes, colindex, to - 1, blockDetails.numCells);
                        if (move) {
                            if (callback(move)) {
                                return;
                            }
                            to--;
                        } else {
                            break;
                        }
                    }
                    //Check move right
                    to = colindex;
                    let limit = 8 - blockDetails.numCells;
                    while (to < limit) {
                        let move = moveWithCollisionDetection(classes, colindex, to + 1, blockDetails.numCells);
                        if (move) {
                            if (callback(move)) {
                                return;
                            }
                            to++;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        //console.log(rows)
        for (let rowindex = 1; rowindex < rowindexlimit; rowindex++) {
            //let cells = rows[rowindex].cells;
            let classes = getClasses(rows[rowindex].cells);
            //console.log(classes);
            if (classes.join("").length == 0) {
                //console.log("a");
                return true;
            }

            //console.log(rowindex);
            var dropped = false;
            exploreMoves(classes, function(move) {
                if (!dropped) {
                    //let classesAbove = rowindex > 1 ? getClasses(rows[rowindex - 1].cells) : null;
                    let classesBelow = getClasses(rows[rowindex + 1].cells);
                    //console.log(move);
                    //console.log(classesBelow);
                    if (processDropFromClasses(move, classesBelow)) {
                        //console.log("aaa");
                        dropped = true;
                        return true;
                    }
                    //Recurse with row below
                    exploreMoves(classesBelow, function(move2) {
                        //console.log(move);
                        //console.log(move2);
                        if (processDropFromClasses(move, move2)) {
                            //console.log("bbb");
                            dropped = true;
                            return true;
                        }
                    });
                }
            });
            if (dropped) {
                return true;
            }

        }
        return false;
    },

    generateSocialMediaPost: function() {
        //var text = "I challenge you to beat my score of " + Math.max(State.score, State.maxScore) + " on Ransom, the latest challenging indie game made by Johan Fourie. Free to play. No adverts. Any device: " + location.protocol + "//" + location.host + location.pathname + "?s=";
        //text += " " + location.protocol + "//" + location.host + location.pathname + "media/RansomScreenshot1.png";
        //navigator.clipboard.writeText(text);

        $("#topPanelParent").addClass("screenshot");
        var node = $("#game")[0];

        var scale = 0.6;
        domtoimage.toBlob(
            node,
            {
                width: node.clientWidth * scale,
                height: node.clientHeight * scale,
                style: {
                transform: 'scale('+scale+')',
                transformOrigin: 'top left'
                }
            }
        ).then(function (blob) {
            navigator.clipboard.write([
                new ClipboardItem(
                    Object.defineProperty({}, blob.type, {
                        value: blob,
                        enumerable: true
                    })
                )
            ])
            $("#topPanelParent").removeClass("screenshot");
        });
    }
}