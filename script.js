const sudokuTableValues = [];

// set up sudoku Table
const cellTemplate = (row, col) => {
  let template = `
        <div class="cell" row=${row} col=${col}>
            <input type="text" class="cell-value">
            <div class="cell-note"></div>
        </div>
    `;
  return template;
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
        table: Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1,
      });

      sudokuTable = sudokuTable + cellTemplate(row, col);
    }
  }
  sudokuElement.innerHTML = sudokuTable;

  validateCell();
};


// show and update
const showSudoku = (sudokuTable) => {
  sudokuTable.forEach((cell) => {
    document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-value").value = cell.value;
    document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-note").innerHTML = cell.note.toString();
  });
};

const updateSudoku = () => {
  sudokuTableValues.forEach((cell) => {
    let value = document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-value").value;
    let note = document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-note").innerHTML;
    cell.value = value;
    cell.note = note===""? "":note.split();
  });
};  

const refreshSudoku = () => {
  showSudoku(sudokuTableValues);
  updateSudoku();
}

// solve logic

const getCells = (type, index) => {
  return sudokuTableValues.filter((cell) => cell[type] === index);
};

// cell has only one value
const solveCellHaveOnlyValue = () => {
  console.log ('start',sudokuTableValues)
  sudokuTableValues.forEach((cell) => {
    if (cell.value) {
      return;
    }
    if (!cell.note){cell.note = [1,2,3,4,5,6,7,8,9]}
    sudokuTableValues.forEach((cellCompare) => {
      if (!cellCompare.value) {
        return;
      }

      if (
        cellCompare.row === cell.row ||
        cellCompare.col === cell.col ||
        cellCompare.table === cell.table
      ) {
        if (cell.note.includes(parseInt(cellCompare.value))) {          
          cell.note = cell.note.filter((value) => value !== parseInt(cellCompare.value));
        }
      }
    });
  });
  sudokuTableValues.forEach((cell) => {
    if (cell.note.length === 1) {
      cell.value = cell.note[0];
      cell.note = "";
    }
  });
};

// value in only one cell in a range
const solveValueHaveOnlyOneCell = () => {
  for (let i = 1; i < 10; i++) {
    let rngValues = getCells("table", i);

    for (let note = 1; note < 10; note++) {
      let cells = rngValues.filter((cell) =>
        cell.note.includes(note.toString())
      );
      if (cells.length === 1) {
        cells[0].value = note;
        cells[0].note = "";
      }
    }
  }
};

// value in one row or col
const solveValueInOnlyRC = () => {
  for (let i = 1; i < 10; i++) {
    let rngValues = getCells("table", i);

    for (let note = 1; note < 10; note++) {
      // check in row
      let rowListInRng = rngValues
        .filter((cell) => cell.note.includes(note.toString()))
        .reduce((prev, cur) => [...prev, cur.row], []);

      if (new Set(rowListInRng).size === 1) {
        let rowValues = getCells("row", rowListInRng[0]);
        rowValues.forEach((cell) => {
          if (cell.table !== i && !cell.value) {
            cell.note = cell.note.filter((value) => value !== note.toString());
          }
        });
      }
      // check in col
      let colListInRng = rngValues
        .filter((cell) => cell.note.includes(note.toString()))
        .reduce((prev, cur) => [...prev, cur.col], []);
      if (new Set(colListInRng).size === 1) {
        let colValues = getCells("col", colListInRng[0]);
        colValues.forEach((cell) => {
          if (cell.table !== i && !cell.value) {
            cell.note = cell.note.filter((value) => value !== note.toString());
          }
        });
      }
    }
  }
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
              (value) => !noteRowList.includes(value.toString())
            );
          }
        });
        // remove note in other cell in same range
        rngValues.forEach((cell) => {
          if (!cell.value && cell.row !== i) {
            cell.note = cell.note.filter(
              (value) => !noteRowList.includes(value.toString())
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
              (value) => !noteColList.includes(value.toString())
            );
          }
        });
        // remove note in other cell in same range
        rngValues.forEach((cell) => {
          if (!cell.value && cell.col !== i) {
            cell.note = cell.note.filter(
              (value) => !noteColList.includes(value.toString())
            );
          }
        });
      }
    }
  }
};


// create sudoku template
createSudokuTemplate();

// start to solve sudoku
function solveSudoku() {
  // update value
  updateSudoku();
  console.log('after update', sudokuTableValues);
  //   solveSudoku
  solveCellHaveOnlyValue();
  // refreshSudoku()
  // console.log(sudokuTableValues);
  // // solve the value have only one cell
  solveValueHaveOnlyOneCell();

  // // refreshSudoku()
  // console.log(sudokuTableValues);

  // //solve the value appear only in row or col of rng
  // solveValueInOnlyRC();

  // // refreshSudoku()
  // console.log(sudokuTableValues);

  // // solve group of value in one row, col
  // solveValueGroupInRowCol();
  // // refreshSudoku()
  // console.log(sudokuTableValues);

  // solveValueHaveOnlyOneCell();

  sudokuTableValues.forEach((cell) => {
    if (cell.note.length === 1) {
      cell.value = cell.note[0];
      cell.note = "";
    }
  });

  //   return result
  showSudoku(sudokuTableValues);
}


// button function
const clearSudoku = () => {
  sudokuTableValues.forEach((cell) => {
    cell.value = "";
    cell.note = [];
  });
  showSudoku(sudokuTableValues);
};

const saveSudoku = () => {
  updateSudoku();
  localStorage.setItem("saveSudoku", JSON.stringify(sudokuTableValues));
};

const loadSudoku = () => {
  showSudoku(JSON.parse(localStorage.getItem("saveSudoku")));
};

const startButton = document.querySelector(".start");
startButton.addEventListener("click", solveSudoku);

const saveButton = document.querySelector(".save");
saveButton.addEventListener("click", saveSudoku);

const loadButton = document.querySelector(".load");
loadButton.addEventListener("click", loadSudoku);

const clearButton = document.querySelector(".clear");
clearButton.addEventListener("click", clearSudoku);
