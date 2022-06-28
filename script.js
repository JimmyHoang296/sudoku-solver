var sudokuTableValues = [];

// set up sudoku Table
const cellTemplate = (row, col, isNew) => {
  return (template = `
        <div class="cell" row=${row} col=${col} isNew=${isNew}>
            <input type="text" class="cell-value">
            <div class="cell-note"></div>
        </div>
    `);
};

const validateCell = () => {
  const cells = [...document.querySelectorAll(".cell-value")];
  cells.forEach((cell) => {
    cell.addEventListener("input", () => {
      if (isNaN(cell.value) || !(cell.value > 0) || !(cell.value < 10)) {
        cell.value = cell.value.length <= 1 ? "" : cell.value[0];
      }
    });
  });
};

const createSudokuTemplate = () => {
  let sudokuTable = "";
  let sudokuElement = document.querySelector(".sudoku-table");
  for (let row = 1; row < 10; row++) {
    for (let col = 1; col < 10; col++) {
      sudokuTableValues.push({
        row: row,
        col: col,
        isNew: false,
        table: Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1,
      });

      sudokuTable = sudokuTable + cellTemplate(row, col, false);
    }
  }
  sudokuElement.innerHTML = sudokuTable;

  validateCell();
};

// create sudoku template
createSudokuTemplate();

///////////////////////////////////////////////////////////////////////////
// show and update
const showSudoku = () => {
  sudokuTableValues.forEach((cell) => {
    let cellElement = document.querySelector(
      `.cell[row='${cell.row}'][col='${cell.col}']`
    );
    cellElement.setAttribute("isNew", cell.isNew);
    cellElement.querySelector(".cell-value").value = cell.value;
    cellElement.querySelector(".cell-note").innerHTML = cell.note.toString();
  });
};

const updateSudoku = () => {
  sudokuTableValues.forEach((cell) => {
    let value = document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-value").value;
    let note = document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-note").textContent;
    cell.value = value;
    cell.isNew = false;
    if (note === "") {
      cell.note = [];
    } else {
      cell.note = note.split(",").map((value) => parseInt(value));
    }
  });
};

///////////////////////////////////////////////////////////////////
// solve logic

const getCells = (type, index) => {
  return sudokuTableValues.filter((cell) => cell[type] === index);
};

const clearNote = (cell, note) => {
  let rowValues = getCells("row", cell.row);
  let colValues = getCells("col", cell.col);
  let rngValues = getCells("table", cell.table);

  rowValues.forEach((cell) => {
    cell.note = cell.note.filter((value) => value !== note);
  });
  colValues.forEach((cell) => {
    cell.note = cell.note.filter((value) => value !== note);
  });
  rngValues.forEach((cell) => {
    cell.note = cell.note.filter((value) => value !== note);
  });
};

const putValueToCell = () => {
  sudokuTableValues.forEach((cell) => {
    if (cell.note.length === 1) {
      cell.value = cell.note[0];
      clearNote(cell, cell.note[0]);
      cell.note = [];
      cell.isNew = true;
    }
  });

  for (let rngIndex = 1; rngIndex < 10; rngIndex++) {
    let rngValues = getCells("table", rngIndex);

    for (let note = 1; note < 10; note++) {
      let cells = rngValues.filter((cell) => cell.note.includes(note));
      if (cells.length === 1) {
        cells[0].value = note;
        clearNote(cells[0], cells[0].note);
        cells[0].note = [];
        cells[0].isNew = true;
      }
    }
  }
};
// cell has only one value
const solveCellHaveOnlyValue = () => {
  sudokuTableValues.forEach((cell) => {
    if (cell.value) {
      return;
    }
    if (cell.note.length === 0) {
      cell.note = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    let rowValues = getCells("row", cell.row).map((cell) => cell.value * 1);
    let colValues = getCells("col", cell.col).map((cell) => cell.value * 1);
    let rngValues = getCells("table", cell.table).map((cell) => cell.value * 1);

    cell.note = cell.note.filter((value) => !rowValues.includes(value));
    cell.note = cell.note.filter((value) => !colValues.includes(value));
    cell.note = cell.note.filter((value) => !rngValues.includes(value));
  });

  putValueToCell();
};

// value in one row or col
const solveValueInOnlyRC = () => {
  for (let i = 1; i < 10; i++) {
    let rngValues = getCells("table", i);

    for (let note = 1; note < 10; note++) {
      // check in row
      let rowListInRng = rngValues
        .filter((cell) => cell.note.includes(note))
        .reduce((prev, cur) => [...prev, cur.row], []);

      if (new Set(rowListInRng).size === 1) {
        let rowValues = getCells("row", rowListInRng[0]);
        rowValues.forEach((cell) => {
          if (cell.table !== i && !cell.value) {
            cell.note = cell.note.filter((value) => value !== note);
          }
        });
      }
      // check in col
      let colListInRng = rngValues
        .filter((cell) => cell.note.includes(note))
        .reduce((prev, cur) => [...prev, cur.col], []);
      if (new Set(colListInRng).size === 1) {
        let colValues = getCells("col", colListInRng[0]);
        colValues.forEach((cell) => {
          if (cell.table !== i && !cell.value) {
            cell.note = cell.note.filter((value) => value !== note);
          }
        });
      }
    }
  }

  putValueToCell();
};

// value in row, col of range
const solveValueGroupInRowCol = () => {
  for (let rngIndex = 1; rngIndex < 10; rngIndex++) {
    let rngValues = getCells("table", rngIndex);

    for (let i = 1; i < 10; i++) {
      // check row
      let blankRowCellInRng = rngValues.filter(
        (cell) => cell.row === i && !cell.value
      );
      if (blankRowCellInRng.length === 0) {
        continue;
      }

      let noteRowList = blankRowCellInRng.reduce(
        (prev, cur) => [...prev, ...cur.note],
        []
      );

      if (new Set(noteRowList).size === blankRowCellInRng.length) {
        let rowValues = getCells("row", i);

        // remove note in same row but in other range
        rowValues.forEach((cell) => {
          if (cell.table !== rngIndex && !cell.value) {
            cell.note = cell.note.filter(
              (value) => !noteRowList.includes(value)
            );
          }
        });
        // remove note in other cell in same range
        rngValues.forEach((cell) => {
          if (!cell.value && cell.row !== i) {
            cell.note = cell.note.filter(
              (value) => !noteRowList.includes(value)
            );
          }
        });
      }
      // check col
      let blankColCellInRng = rngValues.filter(
        (cell) => cell.col === i && cell.value === ""
      );
      let noteColList = blankColCellInRng.reduce(
        (prev, cur) => [...prev, ...cur.note],
        []
      );
      if (new Set(noteColList).size === blankColCellInRng.length) {
        let colValues = getCells("col", i);
        colValues.forEach((cell) => {
          if (cell.table !== i && !cell.value) {
            cell.note = cell.note.filter(
              (value) => !noteColList.includes(value)
            );
          }
        });
        // remove note in other cell in same range
        rngValues.forEach((cell) => {
          if (!cell.value && cell.col !== i) {
            cell.note = cell.note.filter(
              (value) => !noteColList.includes(value)
            );
          }
        });
      }
    }
  }
  putValueToCell();
};

// start to solve sudoku
function solveSudoku() {
  // update value
  updateSudoku();

  //   solveSudoku
  solveCellHaveOnlyValue();

  //solve the value appear only in row or col of rng
  solveValueInOnlyRC();

  // solve group of value in one row, col
  solveValueGroupInRowCol();

  //   return result
  showSudoku();
}

// button function
const clearSudoku = () => {
  sudokuTableValues.forEach((cell) => {
    cell.value = "";
    cell.note = [];
    cell.isNew = false;
  });
  showSudoku();
};

const saveSudoku = () => {
  updateSudoku();
  localStorage.setItem("saveSudoku", JSON.stringify(sudokuTableValues));
  alert("save success");
};

const loadSudoku = () => {
  sudokuTableValues = [...JSON.parse(localStorage.getItem("saveSudoku"))];
  showSudoku();
  alert("load success");
};

const startButton = document.querySelector(".start");
startButton.addEventListener("click", solveSudoku);

const saveButton = document.querySelector(".save");
saveButton.addEventListener("click", saveSudoku);

const loadButton = document.querySelector(".load");
loadButton.addEventListener("click", loadSudoku);

const clearButton = document.querySelector(".clear");
clearButton.addEventListener("click", clearSudoku);

// move cell

const moveCell = (e) => {
  if (!e.target.classList.contains("cell-value")) {
    document.querySelector(".cell-value").focus();
    return;
  }
  let curCell = e.path[1];
  let curRow = curCell.getAttribute("row") * 1;
  let curCol = curCell.getAttribute("col") * 1;

  switch (e.key) {
    case "ArrowUp":
      curRow = curRow == 1 ? 9 : curRow - 1;
      break;

    case "ArrowDown":
      curRow = curRow == 9 ? 1 : curRow + 1;
      break;

    case "ArrowLeft":
      curCol = curCol == 1 ? 9 : curCol - 1;
      break;

    case "ArrowRight":
      curCol = curCol == 9 ? 1 : curCol + 1;
      break;
    default:
  }

  document
    .querySelector(`.cell[row='${curRow}'][col='${curCol}'] .cell-value`)
    .focus();
};
document.addEventListener("keydown", moveCell);
