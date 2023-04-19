var Board = {
    //Depends on jquery and state

    numRows: 13,
    animationPositions: {},

    init: function () {
        this.setup(13);
    },

    setup: function (numRows, startupRows) {
        BoardHelper.init();
        GameLogic.init();
        this.numRows = numRows;

        $("#board tr").remove();
        var rowContent = "<tr>";
        for (let index = 0; index < 8; index++) {
            rowContent += "<td></td>"
        }
        rowContent += "</tr>"

        for (let index = 0; index <= this.numRows; index++) {
            $("#board").append(rowContent);
        }

        let rows = $("#board tr");
        rows.each(function(rowIndex) {
            $(rows[rowIndex]).attr("id", "row" + rowIndex);
            
            let cells = $(rows[rowIndex]).find("td");
            cells.each(function(cellIndex) {
                $(cells[cellIndex]).attr("id", "cell" + rowIndex + "_" + cellIndex);
            });
            //console.log($(rows[rowIndex]).find("td"));
        });
        //console.log(t.find("tr"));

        Board.adjustSize();
        $("td")
            .off(TouchEvents.allEvents())
            .on(TouchEvents.startEvent(), function(e) {
                TouchEvents.cellmousedown(e);
            })
            .on(TouchEvents.moveEvent(), function(e) {
                TouchEvents.cellmousemove(e);
            });

        $(document)
            .off(TouchEvents.allEvents())
            .on(TouchEvents.moveEvent(), function(e) {
                TouchEvents.windowmousemove(e);
            })
            .on(TouchEvents.endEvent(), function(e) {
                TouchEvents.windowmouseup(e);
            });

        if (startupRows) {
            this.setRows(startupRows);
        } else {
            if (State.gameOn) {
                State.restoreState();
            }
            State.activeState.gameOver = Board.isGameOver();
            GameLogic.setTarget();
        }
        Header.update();
        Board.clearAnimateBlocks();
        //setTimeout(function() {
        //}, 2000);
    },

    adjustSize: function() {
        //console.log("resize");
        if (!$("#game").is(":visible")) {
            return;
        }
        $("#board").hide();
        let h = $(document).height() - $("#topPanel").height() - $("#row0").height();
        let w = $(document).width();
        //console.log(h + " " + w);
        let hd = h / 13;
        let wd = w / 8;
        //console.log(hd + " " + wd);
        cellSize = Math.floor(Math.min(hd, wd) - 0.4);
        State.cellWidth = cellSize;
        //console.log(cellSize);
        //console.log($("#board td").width());
        if ($("#board td").width() != cellSize) {
            //console.log("resizing");
            $("#board td").width(cellSize);
            $("#board tr:not(#row0)").height(cellSize);
        }
        $("#board").show();
        $("#topPanelParent").css("width", $("#board").width() + "px");


        //Update animation positions
        let p0 = $("#board")
        let p1 = $("#topPanelLeftTop");
        let p3 = $("#board #row0");
        let p4 = $("#board #row1");
        let p7 = $("#tableruler");
        let cellHeight = p4.height();
        let cellWidth = p0.width() / 8;
        let halfRowHeight = cellHeight / 2;
        //Score position
        let scorePos = {
            top: p1.position().top,
            left: p1.position().left + p1.width()
        };
        let firstRowTop = p7.position().top + p3.height() + halfRowHeight;
        //Middle of first board cell
        let firstCellPos = {
            top: firstRowTop,
            left: p1.position().left + cellWidth / 2
        };
        //console.log(firstCellPos);

        // let s1 = $("#sample1");
        // let s2 = $("#sample2");
        // s1.show();
        // s2.show();
        // s1.css("left", topLeft.left + "px").css("top", topLeft.top + "px");
        // s2.css("left", middle.left + "px").css("top", middle.top + "px");
        // s1.hide();
        // s2.hide();

        this.animationPositions = {
            cellDimensions: {height: cellHeight, width: cellWidth},
            firstCellPos,
            scorePos
        }
        //console.log(this.animationPositions);
    },

    clearAnimateBlocks: function() {
        $(".animateBlock").removeClass("animateBlock");
    },

    countFilledCells: function() {
        //console.log("countFilledCells");
        return this.getRows().flat().filter(c => c.length > 0).length;
    },

    getRows: function() {
        let rows = $("#board tr:not(#row0)");
        var result = [];
        for (let index = 0; index < rows.length; index++) {
            let cells = $(rows[index]).find("td");
            var classes = [];
            for (let index = 0; index < cells.length; index++) {
                classes.push(cells[index].className);
            }
            result.push(classes);
        }
        return result;
    },

    setRows: function(newRows) {
        let rows = $("#board tr:not(#row0)");
        for (let index = 0; index < rows.length; index++) {
            let row = $(rows[index]).find("td");
            this.paintRow(getIds(row), newRows[index]);
        }
    },

    paintRow: function(ids, classes) {
        //console.log(row);
        for (let index = 0; index < ids.length; index++) {
            let newClass = classes[index];
            let id = ids[index];
            $("#" + id).removeClass().addClass(newClass);
        }
    },

    getMoveableCells: function () {
        return $("#board td[class$=1]:not(frozen):not(prize)");
    },
    isGameOver: function () {
        let rows = $("#board tr");
        return !BoardHelper.hasPossibleMove(rows);
    }

}