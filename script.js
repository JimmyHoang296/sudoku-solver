const sudokuTableValues = []

const cellTemplate = (row,col) => {
    let template = 
    `
        <div class="cell" row=${row} col=${col}>
            <input type="text" class="cell-value">
            <div class="cell-note"></div>
        </div>
    `
    return template
}

const validateCell = () => {
    const cells  = [...document.querySelectorAll('.cell-value')]
    cells.forEach(cell => {
        cell.addEventListener("input", ()=>{
            if(isNaN(cell.value)||!(cell.value > 0) || !(cell.value < 10)){
                cell.value = cell.value.length==1 ? "": cell.value[0]
            }
        })
    })
}

const createSudokuTemplate = () =>{
    let sudokuTable = ""
    let sudokuElement = document.querySelector('.sudoku-table')
    for (let row = 1; row < 10; row++){
        for (let col= 1; col<10; col++){
            sudokuTableValues.push({
                row: row,
                col: col,
                table: Math.floor((row-1)/3)*3 + Math.floor((col-1)/3)+1,
            })
            
            sudokuTable = sudokuTable + cellTemplate(row,col)
            
        }
    }
    sudokuElement.innerHTML = sudokuTable

    validateCell()
}

// create sudoku template
createSudokuTemplate()

// start to solve sudoku
const solveSudoku = () => {
    // update value
    sudokuTableValues.forEach(cell =>{
        let value = document.querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`).querySelector('.cell-value').value
        let note = document.querySelector(`.cell[row='${cell.row}'][col='${cell.col}']`).querySelector('.cell-note').innerHTML
        cell.value = value
        cell.note = note
    })
    console.log(sudokuTableValues)
}

const startButton = document.querySelector('.start')
startButton.addEventListener('click', solveSudoku)