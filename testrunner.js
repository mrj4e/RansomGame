var TestRunner = {
    //Depends on utils.js
    numPasses: 0,
    numFails: 0,
    testResults: [],

    test: function() {
        console.log("Running TestRunner.test()");
        this.testResults = [];
        this.cellMoveTests();
        this.cellDropTests();
        this.boardHelperTests();
        this.gameOverTests();
        this.seedTests();

        console.log(this.numPasses + " tests passed.");
        if (this.numFails > 0) {
            console.error(this.numFails + " tests failed.");
            this.showFailedTestResults();
        }
        console.log("To view test results, run TestRunner.showTestResults() or TestRunner.showFailedTestResults()");
        //console.log(this.testResults);
    },

    showTestResults: function() {
        for (let index = 0; index < this.testResults.length; index++) {
            this.showTestResult(index);
        }
    },
    showFailedTestResults: function() {
        for (let index = 0; index < this.testResults.length; index++) {
            let r = this.testResults[index];
            if (r.indexOf("FAIL") > -1) {
                this.showTestResult(index);
            }
        }
    },

    showTestResult: function(index) {
        let r = this.testResults[index];
        let f = "Test case " + index + " " + r.replace(": ", "||Inputs: ").replace("  --> ", "||Actual:   ").replace(" != ", " == ").replace(" == ", "||Expected: ");
        let p = f.split("||");
        p.forEach(function(i) {
            console.log(i);
        });
    },

    cellMoveTests: function() {
        this.testResults.push(this.cellMoveTest("1,,,,,,,", 0, 1, 1, ",1,,,,,,"));
        this.testResults.push(this.cellMoveTest(",1,,,,,,", 1, 0, 1, "1,,,,,,,"));
        this.testResults.push(this.cellMoveTest("1,2,,,,,,", 0, 1, 2, ",1,2,,,,,"));
        this.testResults.push(this.cellMoveTest(",1,2,,,,,", 1, 0, 2, "1,2,,,,,,"));
        this.testResults.push(this.cellMoveTest(",,1,2,,,,", 2, 0, 2, "1,2,,,,,,"));
        this.testResults.push(this.cellMoveTest(",X,1,2,,,,", 2, 0, 2, null));
        this.testResults.push(this.cellMoveTest(",,1,2,X,,,", 2, 3, 2, null));
    },

    cellDropTests: function() {
        this.testResults.push(this.cellDropTest(",,,,,,,", ",,,,,,,", null));
        this.testResults.push(this.cellDropTest("one1,,,,,,,", ",,,,,,,", ",,,,,,, one1,,,,,,,"));
        this.testResults.push(this.cellDropTest("one1,,,,,,,", "one1,,,,,,,", null));
        this.testResults.push(this.cellDropTest(",,,,,,,one1", ",,,,,,,", ",,,,,,, ,,,,,,,one1"));
        this.testResults.push(this.cellDropTest(",,,,,,two1,two2", ",,,,,,,", ",,,,,,, ,,,,,,two1,two2"));
        this.testResults.push(this.cellDropTest(",,,,,,two1,two2", ",,,,,,,one1", null));
        this.testResults.push(this.cellDropTest("one1,,one1,,,,,", ",,,,,,,", ",,,,,,, one1,,one1,,,,,"));
        this.testResults.push(this.cellDropTest("four1,four2,four3,four4,,,,", "one1,,,,,,,", null));
        this.testResults.push(this.cellDropTest(",,one1,,four1,four2,four3,four4", ",three1,three2,three3,one1,,two1,two2", null));
        this.testResults.push(this.cellDropTest("one1,,one1,,four1,four2,four3,four4", ",three1,three2,three3,one1,,two1,two2", ",,one1,,four1,four2,four3,four4 one1,three1,three2,three3,one1,,two1,two2"));
        this.testResults.push(this.cellDropTest("one1 frozen,,,,,,,", ",,,,,,,", ",,,,,,, one1 frozen,,,,,,,"));
    },

    boardHelperTests: function() {
        this.testResults.push(this.boardHelperTest(0, 1, "one1", {sourceIndex: 0, targetIndex: 1, blockDetails: {classPrefix: "one", selectedNum: 1, numCells: 1}}));
        this.testResults.push(this.boardHelperTest(4, 5, "three2", {sourceIndex: 3, targetIndex: 4, blockDetails: {classPrefix: "three", selectedNum: 2, numCells: 3}}));
        this.testResults.push(this.boardHelperTest(7, 3, "four4", {sourceIndex: 4, targetIndex: 0, blockDetails: {classPrefix: "four", selectedNum: 4, numCells: 4}}));
    },

    gameOverTests: function() {
        //console.log("gameOverTests");
        
        this.testResults.push(this.gameOverTest([
            ",,,,,,,",
            "three1,three2,three3,,four1,four2,four3,four4",
            "one1,,,four1,four2,four3,four4,",
            "three1,three2,three3,four1,four2,four3,four4,",
            ",four1,four2,four3,four4,two1,two2,",
            "four1,four2,four3,four4,,three1,three2,three3",
            "four1,four2,four3,four4,,three1,three2,three3",
            "four1,four2,four3,four4,,,two1,two2"],
            false));
        this.testResults.push(this.gameOverTest([
            ",,,,,,,",
            "three1,three2,three3,,four1,four2,four3,four4",
            "one1 frozen,,,four1,four2,four3,four4,",
            "three1 frozen,three2 frozen,three3 frozen,four1,four2,four3,four4,",
            ",four1,four2,four3,four4,two1,two2,",
            "four1,four2,four3,four4,,three1,three2,three3",
            "four1,four2,four3,four4,,three1,three2,three3",
            "four1,four2,four3,four4,,,two1,two2"],
            false)); 
        this.testResults.push(this.gameOverTest([
            ",,,,,,,",
            "three1,three2,three3,,four1,four2,four3,four4",
            "one1 frozen,,,four1 frozen,four2 frozen,four3 frozen,four4 frozen,",
            "three1 frozen,three2 frozen,three3 frozen,four1,four2,four3,four4,",
            ",four1,four2,four3,four4,two1,two2,",
            "four1,four2,four3,four4,,three1,three2,three3",
            "four1,four2,four3,four4,,three1,three2,three3",
            "four1,four2,four3,four4,,,two1,two2"],
            true)); 

        this.testResults.push(this.gameOverTest([
            ",,,,,,,",
            ",four1,four2,four3,four4,,,",
            ",,four1,four2,four3,four4,one1,",
            "three1,three2,three3,,four1,four2,four3,four4",
            "three1,three2,three3,,four1,four2,four3,four4",
            "three1,three2,three3,four1 frozen,four2 frozen,four3 frozen,four4 frozen,",
            ",,three1,three2,three3,three1 frozen,three2 frozen,three3 frozen",
            ",two1,two2,two1,two2,three1,three2,three3"],
            false));

        this.testResults.push(this.gameOverTest([
            ",,,,,,,",
            ",two1,two2,,three1 frozen animateBlock,three2 frozen animateBlock,three3 frozen animateBlock,",
            "three1,three2,three3,four1,four2,four3,four4,",
            "two1,two2,one1 frozen animateBlock,,four1 frozen,four2 frozen,four3 frozen,four4 frozen",
            "one1,,two1,two2,four1 frozen,four2 frozen,four3 frozen,four4 frozen",
            "four1 frozen,four2 frozen,four3 frozen,four4 frozen,,,two1 frozen,two2 frozen",
            "three1 frozen,three2 frozen,three3 frozen,,,,two1,two2",
            "one1 frozen,one1 frozen,,four1 frozen,four2 frozen,four3 frozen,four4 frozen,one1 frozen"],
            false));


    },

    seedTests: function() {
        BoardHelper.init();
        let seeds = BoardHelper.spawnSeeds;
        for (let index = 0; index < seeds.length; index++) {
            const seed = seeds[index];
            this.testResults.push(this.seedTest(seed));
        }
    },







    cellMoveTest: function(initial, from, to, numCells, expected) {
        var classes = initial.split(",");
        let r = moveWithCollisionDetection(classes, from, to, numCells);
        let res = r ? r.join(",") : "null";
        let exp = expected ? expected : "null";

        this.numPasses += res == exp ? 1 : 0;
        this.numFails += res == exp ? 0 : 1;
        return (res == exp ? "PASS" : "FAIL") + " cellMoveTest: " + initial + " " + from + " " + to + " " + numCells + "  --> " + res + (res == exp ? " == " : " != ") + exp;
    },
    
    cellDropTest: function(above, below, expected) {
        let classesAbove = above.split(",");
        let classesBelow = below.split(",");
        let result = processDropFromClasses(classesAbove, classesBelow);
        let res = result ? result.classesAbove.join(",") + " " + result.classesBelow.join(",") : "null";
        let exp = expected ? expected : "null";
        
        this.numPasses += res == exp ? 1 : 0;
        this.numFails += res == exp ? 0 : 1;
        return (res == exp ? "PASS" : "FAIL") + " cellDropTest: " + above + " " + below + " " + "  --> " + res + (res == exp ? " == " : " != ") + exp;
    },

    boardHelperTest: function(sourceIndex, targetIndex, className, expected) {
        let r = BoardHelper.getMoveDetails(sourceIndex, targetIndex, className);
        let res = r ? JSON.stringify(r) : "null";
        let exp = expected ? JSON.stringify(expected) : "null";

        this.numPasses += res == exp ? 1 : 0;
        this.numFails += res == exp ? 0 : 1;
        return (res == exp ? "PASS" : "FAIL") + " boardHelperTest: " + sourceIndex + " " + targetIndex + " " + className + "  --> " + res + (res == exp ? " == " : " != ") + exp;
    },

    gameOverTest: function(initrows, exp) {

        var rows = [];
        //var seed = [];
        for (let index = 0; index < initrows.length; index++) {
            let classes = initrows[index].split(",");
            //if (index > 0) {
            //    seed.push(classes);
            //}
            var richCells = [];
            for (let cellindex = 0; cellindex < classes.length; cellindex++) {
                richCells.push({className: classes[cellindex]});
            }
            rows.push({cells: richCells});
        }

        //Board.setRows(seed);

        let res = !BoardHelper.hasPossibleMove(rows);
        //console.log(res);
        this.numPasses += res == exp ? 1 : 0;
        this.numFails += res == exp ? 0 : 1;
        return (res == exp ? "PASS" : "FAIL") + " gameOverTest: " + initrows.join("|") + "  --> " + res + (res == exp ? " == " : " != ") + exp;
    },

    seedTest: function(seed) {
        let exp = 8;
        let classes = seed.split(",");
        let res = classes.length;
        this.numPasses += res == exp ? 1 : 0;
        this.numFails += res == exp ? 0 : 1;
        return (res == exp ? "PASS" : "FAIL") + " seedTest: " + seed + "  --> " + res + (res == exp ? " == " : " != ") + exp;
    }
}
