var numCellsLookup = {};
numCellsLookup["one"] = 1;
numCellsLookup["two"] = 2;
numCellsLookup["three"] = 3;
numCellsLookup["four"] = 4;
var blockTypeLookup = ["one", "two", "three", "four"];

function moveWithCollisionDetection(classes, from, to, numCells) {
    var newRow = [];
    var movingCells = [];
    //Copy array without moving class
    //console.log(classes);
    for (let index = 0; index < classes.length; index++) {
        let isMovingClass = index >= from && index < from + numCells;
        newRow.push(isMovingClass ? "" : classes[index]);
        if (isMovingClass) {
            movingCells.push(classes[index]);
        }
    }
    
    //console.log(movingCells);
    //Find collisions
    let startIndex = Math.min(from, to); //) from < to ? from + numCells - 1 : to;
    let endIndex = Math.max(from, to) + numCells - 1;
    let numToScan = endIndex - startIndex + 1;
    //console.log(startIndex);
    //console.log(endIndex);
    //console.log(numToScan);
    for (let i = 0; i < numToScan; i++) {
        let index = startIndex + i;
        //console.log("Collision test " + index);
        if (newRow[index].length > 0) {
            //console.log("collision")
            return null;
        }
    }
    //Paste moving class
    for (let i = 0; i < numCells; i++) {
        let index = to + i;
        newRow[index] = movingCells[i];
    }
    return newRow;
}
  
function getBlockDetailsFromClass(className) {
    className = className.split(" ")[0]; //Only look at first class
    let classPrefix = className.replace("1", "").replace("2", "").replace("3", "").replace("4", "");
    let numCells = numCellsLookup[classPrefix];
    let selectedNum = className.replace(classPrefix, "") - 0;
    return {classPrefix, selectedNum, numCells};
}



function processDropFromClasses(classesAbove, classesBelow) {
    //console.log("processDropFromClasses");
    //console.log(classesAbove);
    //console.log(classesBelow);
    var finalResult = null;
    var chosenClasses = getBaseClasses(classesAbove);
    chosenClasses.forEach(function (chosenClass) {
        //console.log(chosenClass);
        let result = processDropFromOneClass(chosenClass, classesAbove, classesBelow);
        //console.log(result);
        if (result) {
            finalResult = result;
            classesAbove = result.classesAbove;
            classesBelow = result.classesBelow;
        }
    });
    return finalResult;
}

function getBaseClasses(classes) {
    var result = [];
    for (let index = 0; index < classes.length; index++) {
        if (classes[index].length > 0) {
            let className = classes[index].split(" ")[0]; //Only look at first class
            let classPrefix = className.replace("1", "").replace("2", "").replace("3", "").replace("4", "");
            //console.log(classPrefix);
            let numCells = numCellsLookup[classPrefix];
            //console.log(numCells);
            result.push({index, classPrefix, numCells});
            index += numCells - 1;
        }
    }
    return result;
}

function processDropFromOneClass(chosenClass, classesAbove, classesBelow) {
    var numDropped = 0;
    var containsPrize = false;
    for (let index = 0; index < chosenClass.numCells; index++) {
        let i = index + chosenClass.index;
        if (classesBelow[i].length == 0) {
            numDropped++;
        }
    }
    
    if (numDropped != chosenClass.numCells) {
        return null;
    }

    for (let index = 0; index < chosenClass.numCells; index++) {
        let i = index + chosenClass.index;
        //console.log(containsPrize);
        containsPrize = containsPrize ? containsPrize : classesAbove[i].indexOf("prize") > -1;
        //console.log(classesAbove[i]);
        //console.log(containsPrize);
        classesBelow[i] = classesAbove[i];
        classesAbove[i] = "";
    }

    return {classesAbove, classesBelow, containsPrize};
}

function getClasses(cells) {
    var classes = [];
    for (let index = 0; index < cells.length; index++) {
      classes.push(cells[index].className);
    }
    return classes;
}

function getIds(cells) {
    var classes = [];
    for (let index = 0; index < cells.length; index++) {
      classes.push($(cells[index]).attr("id"));
    }
    return classes;
}

function setBoardPosition(element, boardIndex) {
    let topdiff = boardIndex * Board.animationPositions.cellDimensions.height;
    let top = Board.animationPositions.topLeft.top + topdiff;
    let left = Board.animationPositions.topLeft.left + Board.animationPositions.diff.leftdiff;
    setPosition(element, top, left);
}

function setPosition(element, top, left) {
    element.css("top", top + "px");
    element.css("left", left + "px");
}