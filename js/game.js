'use strict'


const gLevel = {
    SIZE: 6,
    MINES: 4,

}

const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}


const mine = {
    i: 0,
    j: 0,
}

const MINE = '💣'
const FLAG = '⛳️'
const EMPTY = ''

var gBoard = []
var isFirstClick = false
var lives = 3
var isCount = false


function onInit() {
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gBoard = buildBoard()
    renderBoard(gBoard)
    gGame.isOn = true
}

function buildBoard() {
    const board = []
    lives = 3
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    console.log(board)
    isFirstClick = true
    return board

}

function setBoard() {
    if (isFirstClick) {
        createMines(gLevel.MINES, gBoard)
        setMinesNegsCount(gBoard)
        isFirstClick = false

    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {

            if (!board[i][j].isMine) {

                for (var p = i - 1; p <= i + 1; p++) {
                    for (var c = j - 1; c <= j + 1; c++) {

                        if (p >= 0 && p < board.length && c >= 0 && c < board.length)
                            if (board[p][c].isMine) board[i][j].minesAroundCount++
                    }
                }
            }

        }
    }
}

function renderBoard(board) {
    const elLives = document.querySelector('.lives')
    elLives.innerText = `${lives} lives left`
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,${i},${j})" ></td>`
        }
        strHTML += '</tr>'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    if (isFirstClick) setBoard()

    if (gBoard[i][j].isRevealed) return

    thereMine(elCell, i, j)

    isFirstClick = false
  
    if (!gBoard[i][j].isMine && !gBoard[i][j].isRevealed) {
        gBoard[i][j].isRevealed = true
        elCell.classList.add('revealed')
        gGame.revealedCount++
       
    }
    if (!isFirstClick && !gBoard[i][j].isMine) expandReveal(gBoard, elCell, i, j)


    if (gBoard[i][j].minesAroundCount) {
        elCell.innerText = gBoard[i][j].minesAroundCount
    }
    CheckGameOver()
}


function onCellMarked(elCell, i, j) {
    elCell.addEventListener('contextmenu', (event) => event.preventDefault())
    event.preventDefault()
    gGame.markedCount++
    gBoard[i][j].isMarked = true

    elCell.innerText = FLAG


}



function createMines(minesNum, board) {
    const size = board.length
    var placed = 0

    while (placed < minesNum) {
        const i = getRandomInt(0, size)
        const j = getRandomInt(0, size)


        if (!board[i][j].isMine) {
            board[i][j].isMine = true
            console.log(i, j)
            placed++
        }
    }
}

function CheckGameOver() {
    const maxCells = gLevel.SIZE ** 2 - gLevel.MINES
    // console.log(maxCells,'max')
    // console.log(gGame.revealedCount,'reveald')
    // console.log(gGame.markedCount,'marked')
    console.log(gGame.revealedCount,'rev')

    if (gGame.revealedCount === maxCells && gGame.markedCount === gLevel.MINES) {
        console.log('victory')
        gGame.isOn = false
        onInit()
    }
}

function expandReveal(board, elCell, i, j) {
    if (board[i][j].minesAroundCount === 0) {
        for (var p = i - 1; p <= i + 1; p++) {
            for (var c = j - 1; c <= j + 1; c++) {
                if (p >= 0 && p < board.length && c >= 0 && c < board.length) {
                    if (board[p][c].isRevealed) continue




                    const elNeg = document.querySelector(`.cell-${p}-${c}`)

                    if (!board[p][c].isMine && !gBoard[p][c].isRevealed ) {
                        board[p][c].isRevealed = true
                        gGame.revealedCount++
                        gBoard[p][c].isRevealed = true
                        if ( board[p][c].minesAroundCount) elNeg.innerText = board[p][c].minesAroundCount

                    }
                    elNeg.classList.add('revealed')
                }
                CheckGameOver()
            }
        }
    }
}

function thereMine(elCell, i, j) {
    if (gBoard[i][j].isMine) {
        
        lives--

        const elLives = document.querySelector('.lives')
        elLives.innerText = `${lives} lives left`
        elCell.innerText = MINE

        setTimeout(() => {
            elCell.innerText = EMPTY
            if (!lives) gameOver()
        }, 300);
        return
    }
}

function gameOver() {
    console.log('gameOver')
    gGame.isOn = false
    onInit()
}