const sudokuTableValues = [];

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
        table: Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1
      });

      sudokuTable = sudokuTable + cellTemplate(row, col);
    }
  }
  sudokuElement.innerHTML = sudokuTable;

  validateCell();
};

// create sudoku template
createSudokuTemplate();

// start to solve sudoku
const solveSudoku = () => {
  // update value
  sudokuTableValues.forEach((cell) => {
    let value = document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-value").value;
    let note = document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-note").innerHTML;
    cell.value = value;
    cell.note = note;
  });

  //   solveSudoku
  sudokuTableValues.forEach((cell) => {
    cell.note = "";
    if (cell.value) {
      return;
    }

    let cellNote = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    // sovle the cell have only one value
    sudokuTableValues.forEach((cellCompare) => {
      if (!cellCompare.value) {
        return;
      }
      if (
        cellCompare.row === cell.row ||
        cellCompare.col === cell.col ||
        cellCompare.table === cell.table
      ) {
        if (cellNote.includes(cellCompare.value)) {
          console.log(cellNote);
          cellNote = cellNote.filter((value) => value !== cellCompare.value);
        }
      }
    });
    if (cellNote.length === 1) {
      cell.value = cellNote[0];
    } else {
      cell.note = cellNote;
    }
  });

  // solve the value have only one cell
  for (let i = 1; i < 10; i++) {
    let rngValues = sudokuTableValues.filter((value) => (value.table = i));
    let rngNote = [];
    rngValues.forEach((cell) => {
      if (!cell.value) {
        rngNote.push(cell.note);
      }
    });
    for (let note = 1; note < 10; note++) {
      if (rngNote.filter((value) => value === note).length === 1) {
        let cell = rngValues.filter((value) => value.note.includes(note));
        cell.value = note;
        cell.note = "";
      }
    }
  }

  //solve the value appear only in row or col of rng
  for (let i = 1; i < 10; i++) {
    let rngValues = sudokuTableValues.filter((value) => value.table === i);
    rngValues.forEach((rng) => {
      for (let note = 1; note < 10; note++) {
        // check in row
        let rowListInRng = [
          ...rng
            .filter((cell) => cell.note.includes(note))
            .map((cell) => cell.row)
        ];
        if (rowListInRng.length === 1) {
          let rowValues = sudokuTableValues.filter(
            (cell) => (cell.row = rowListInRng[0])
          );
          rowValues.forEach((cell) => {
            if (cell.table !== i) {
              cell.note = cell.note.filter((value) => value !== note);
            }
          });
        }
        // check in col
        let colListInRng = [
          ...rng
            .filter((cell) => cell.note.includes(note))
            .map((cell) => cell.col)
        ];
        if (colListInRng.length === 1) {
          let colValues = sudokuTableValues.fill(
            (cell) => (cell.col = colListInRng[0])
          );
          colValues.forEach((cell) => {
            if (cell.table !== i) {
              cell.note = cell.note.filter((value) => value !== note);
            }
          });
        }
      }
    });
  }

  // solve group of value in one row, col
  for (let rngIndex = 1; rngIndex < 10; rngIndex++) {
    let rngValues = sudokuTableValues.filter((cell) => cell.table === rngIndex);
    rngValues.forEach((rng) => {
      for (let i = 1; i < 10; i++) {
        // check row
        let blankRowCellInRng = rng.filter(
          (cell) => cell.row === i && cell.value === ""
        );
        let noteRowList = blankRowCellInRng.reduce(
          (prev, cur) => prev.push(cur),
          []
        );
        if (new Set(noteRowList).size === blankRowCellInRng.length) {
          let rowValues = sudokuTableValues.filter((cell) => cell.row === i);
          rowValues.forEach((cell) => {
            if (cell.table !== i) {
              cell.note = cell.note.filter(
                (value) => !noteRowList.includes(value)
              );
            }
          });
        }
        // check col
        let blankColCellInRng = rng.filter(
          (cell) => cell.row === i && cell.value === ""
        );
        let noteColList = blankColCellInRng.reduce(
          (prev, cur) => prev.push(cur),
          []
        );
        if (new Set(noteColList).size === blankColCellInRng.length) {
          let colValues = sudokuTableValues.filter((cell) => cell.col === i);
          colValues.forEach((cell) => {
            if (cell.table !== i) {
              cell.note = cell.note.filter(
                (value) => !noteColList.includes(value)
              );
            }
          });
        }
      }
    });
  }

  sudokuTableValues.forEach((cell) => {
    if (cell.note.length === 1) {
      cell.value = cell.note[0];
      cell.note = "";
    }
  });

  //   return result
  sudokuTableValues.forEach((cell) => {
    document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-value").value = cell.value;
    document
      .querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`)
      .querySelector(".cell-note").innerHTML = cell.note.toString();
  });
};

const startButton = document.querySelector(".start");
startButton.addEventListener("click", solveSudoku);
