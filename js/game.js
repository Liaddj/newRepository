'use strict'

const gBoard = {
    minesAroundCount: 0,
    isReveald: false,
    isMine: false,
    isMarked: false
}

const gLevel = {
    SIZE: 4,
    MINES: 2,

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

var gCreateBoard
var mineCount = 0
var cellCount = 0






function onInit() {
    gGame.isOn = true
    const gBoard = {
        minesAroundCount: 0,
        isReveald: false,
        isMine: false,
        isMarked: false
    }
    gCreateBoard = buildBoard()
    createMines(gLevel.MINES, gCreateBoard)
    setMinesNegsCount(gCreateBoard)
    renderBoard(gCreateBoard)

}

function buildBoard() {
    const board = []
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
    return board

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
    if (gCreateBoard[i][j].isReveald) return
    if (gCreateBoard[i][j].isMine) {
        elCell.innerText = MINE
        setTimeout(() => {
            gameOver()
        }, 500);
    }

    gCreateBoard[i][j].isReveald = true

    expandReveal(gCreateBoard, elCell, i, j)

    if (!gCreateBoard[i][j].isMine) gGame.revealedCount++

    if (gCreateBoard[i][j].minesAroundCount) {
        elCell.innerText = gCreateBoard[i][j].minesAroundCount
    }

    CheckGameOver()
}


function onCellMarked(elCell, i, j) {
    elCell.addEventListener('contextmenu', (event) => event.preventDefault())
    event.preventDefault()
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

    if (gGame.revealedCount === maxCells) {
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
                    if (board[p][c].isReveald) continue

                    board[p][c].isReveald = true

                    if (!board[p][c].isMine) gGame.revealedCount++

                    if (board[p][c].minesAroundCount) {
                        const elNeg = document.querySelector(`.cell-${p}-${c}`)
                        elNeg.innerText = board[p][c].minesAroundCount
                    }
                }
                CheckGameOver()
            }
        }
    }
}

function gameOver() {
    console.log('gameOver')
    gGame.isOn = false
    onInit()
}