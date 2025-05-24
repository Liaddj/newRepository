'use strict'


const gLevel = {
    SIZE: 4,
    MINES: 2,
}

const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isHint: false,
    isVictory: false,
}


const mine = {
    i: 0,
    j: 0,
}

const MINE = '💣'
const FLAG = '⛳️'
const EMPTY = ''

const HAPPYSMILEY = '😀'
const SADYSMILEY = '😭'
const SUNSMILEY = '😎'

var gBoard = []
var isFirstClick = false
var lives = 3
var isCount = false
var gTimeInterval
var gHintsLeft = 3
var gLastBestScore = Infinity
var gHint = 0
var gSafeLeft = 3
var gLastTable = saveLastTable(gBoard)
var gLastStats = null

function onInit() {
    if (gTimeInterval) clearInterval(gTimeInterval)
    const elSmiley = document.querySelector('.smiley')

    elSmiley.innerText = HAPPYSMILEY

    const saveBestScore = localStorage.getItem('time')
    gLastBestScore = saveBestScore ? +saveBestScore : Infinity
    const elLastTime = document.querySelector('.lasttime')
    elLastTime.innerText = `${gLastBestScore}`


    gHintsLeft = 3
    gSafeLeft = 3
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0

    gGame.isVictory = false
    gGame.isOn = true
    isFirstClick = true

    gBoard = buildBoard()
    renderBoard(gBoard)
    gTimeInterval = setInterval(updateTime, 1000)
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

function setBoard(i, j) {
    if (isFirstClick) {
        createMines(gLevel.MINES, gBoard, i, j)
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

    gLastStats = {
        board: saveLastTable(gBoard),
        lives: lives,
        revealedCount: gGame.revealedCount,
        markedCount: gGame.markedCount,
        isFirstClick: isFirstClick,
    }


    if (!lives) return


    if (isFirstClick) {
        setBoard(i, j)
    }

    if (gBoard[i][j].isRevealed) return


    if (gGame.isHint) {
        gGame.isHint = true
        hintMode(elCell, i, j)
        return
    }

    console.log(gLastStats)

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

function onHints(elBtn) {
    if (!gHintsLeft) return
    gGame.isHint = true

    elBtn.classList.add('hintRevealed')

    setTimeout(() => {
        elBtn.classList.remove('hintRevealed')
    }, 2200);
}


function hintMode(elCell, i, j) {
    if (gBoard[i][j].isRevealed) return
    if (gHint) return
    gHintsLeft--
    gHint++
    elCell.classList.add('revealed')

    if (gBoard[i][j].isMine) elCell.innerText = MINE
    if (gBoard[i][j].minesAroundCount) {
        elCell.innerText = gBoard[i][j].minesAroundCount
    }
    setTimeout(() => {
        elCell.classList.remove('revealed')
        elCell.innerText = EMPTY
        gHint--
        gGame.isHint = false
    }, 1700);
}


function onCellMarked(elCell, i, j) {
    if (gBoard[i][j].isMarked) {
        elCell.innerText = EMPTY
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        return
    }
    elCell.addEventListener('contextmenu', (event) => event.preventDefault())
    event.preventDefault()
    gGame.markedCount++
    gBoard[i][j].isMarked = true
    console.log(gGame.markedCount)

    elCell.innerText = FLAG
    CheckGameOver()
}



function createMines(minesNum, board, i, j) {
    const size = board.length
    var placed = 0

    while (placed < minesNum) {
        
        const p = getRandomInt(0, size)
        const c = getRandomInt(0, size)
        if (p === i && c === j) continue

        if (!board[p][c].isMine) {
            board[p][c].isMine = true
            console.log(p, c)
            placed++
        }
    }
}

function CheckGameOver() {
    const maxCells = gLevel.SIZE ** 2 - gLevel.MINES

    if (gGame.revealedCount === maxCells && gGame.markedCount === gLevel.MINES) {
        console.log('victory')

        const smiley = document.querySelector('.smiley')
        smiley.innerText = SUNSMILEY

        gGame.isOn = false
        gGame.isVictory = true

        showLastLocalStorage()

        setTimeout(() => {
            clearInterval(gTimeInterval)
            onInit()
        }, 1000);
    }
}

function expandReveal(board, elCell, i, j) {
    if (board[i][j].minesAroundCount === 0) {
        for (var p = i - 1; p <= i + 1; p++) {
            for (var c = j - 1; c <= j + 1; c++) {
                if (p >= 0 && p < board.length && c >= 0 && c < board.length) {
                    if (board[p][c].isRevealed) continue

                    const elNeg = document.querySelector(`.cell-${p}-${c}`)

                    if (!board[p][c].isMine && !gBoard[p][c].isRevealed) {
                        board[p][c].isRevealed = true
                        gGame.revealedCount++
                        gBoard[p][c].isRevealed = true
                        if (board[p][c].minesAroundCount) elNeg.innerText = board[p][c].minesAroundCount
                    }
                    elNeg.classList.add('revealed')

                    if (!board[p][c].minesAroundCount) expandReveal(board, elNeg, p, c)

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
        }, 100);
        return
    }
}

function findRandomSafeCell(board) {
    const safeCells = []
    var safeCell
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isRevealed) {
                if (!gBoard[i][j].isMine) {
                    safeCells.push({ i: i, j: j })
                }
            }
        }
    }
    const randNum = getRandomInt(0, safeCells.length - 1)
    return safeCells[randNum]
}

function revealedSafeCell() {
    if (!gSafeLeft) return
    if (isFirstClick) return
    gSafeLeft--

    var pos = findRandomSafeCell(gBoard)

    var safeCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    safeCell.classList.add('revealed')
    safeCell.innerText = gBoard[pos.i][pos.j].minesAroundCount

    setTimeout(() => {
        safeCell.classList.remove('revealed')
        safeCell.innerText = EMPTY
    }, 1500);
}

function gameOver() {
    console.log('gameOver')

    const smiley = document.querySelector('.smiley')
    smiley.innerText = SADYSMILEY

    setTimeout(() => {
        gGame.isOn = false
        gGame.isVictory = true
        clearInterval(gTimeInterval)
        onInit()

    }, 1000);
}

// function chooseLevel(elButton) {
//     if (elButton.innerText === 'Beginner') {
//         gLevel.SIZE = 4
//         gLevel.MINES = 2
//         closeModal('.modal')
//         onInit()

//     } else if (elButton.innerText === 'Medium') {
//         gLevel.SIZE = 8
//         gLevel.MINES = 14
//         closeModal('.modal')
//         onInit()

//     } else if (elButton.innerText === 'Expert') {
//         gLevel.SIZE = 12
//         gLevel.MINES = 32
//         closeModal('.modal')
//         onInit()
//     }
// }
function chooseLevel(elButton) {
    if (elButton.classList.contains('begginer')) {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        onInit()
    } else if (elButton.classList.contains('medium')) {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        onInit()
    } else if (elButton.classList.contains('Expert')) {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        onInit()
    }
}


function updateTime() {
    if (gGame.isOn) {
        const elWatch = document.querySelector('.watch')
        gGame.secsPassed++

        elWatch.innerText = `${gGame.secsPassed}`
    }
}

function showLastLocalStorage() {
    if (!gGame.isVictory) return

    const elLastTime = document.querySelector('.lasttime')
    if (gGame.secsPassed < gLastBestScore) {
        gLastBestScore = gGame.secsPassed
        localStorage.setItem('time', gGame.secsPassed)
    }

    elLastTime.innerText = `${gLastBestScore}`

}

function darkMode() {
    console.log('dark')
    const elBody = document.querySelector('body')
    elBody.classList.toggle('dark')
    const elButtons = document.querySelectorAll('button')
    elButtons.classList.toggle('darkButton')
}

function saveLastTable(board) {
    var newBoard = []

    for (var i = 0; i < board.length; i++) {
        newBoard.push([])
        for (var j = 0; j < board[0].length; j++) {
            newBoard[i][j] = {
                minesAroundCount: board[i][j].minesAroundCount,
                isRevealed: board[i][j].isRevealed,
                isMine: board[i][j].isMine,
                isMarked: board[i][j].isMarked
            }
        }

    }
    return newBoard
}

function undo() {
    if (!gLastTable) return

    gBoard = saveLastTable(gLastStats.board)
    lives = gLastStats.lives
    gGame.revealedCount = gLastStats.revealedCount
    gGame.markedCount = gLastStats.markedCount
    isFirstClick = gLastStats.isFirstClick


    renderBoard(gBoard)

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const elCell = document.querySelector(`.cell-${i}-${j}`)

            if (gBoard[i][j].isRevealed) {
                elCell.classList.add('revealed')
                if (gBoard[i][j].isMine) {
                    elCell.innerText = MINE

                } else if (gBoard[i][j].minesAroundCount > 0) {
                    elCell.innerText = gBoard[i][j].minesAroundCount
                } else {
                    elCell.innerText = EMPTY
                }
            } else {
                elCell.classList.remove('revealed')
                if (!gBoard[i][j].isMarked) elCell.innerText = gBoard[i][j] ? EMPTY : FLAG
            }
        }
    }

    const elLives = document.querySelector('.lives')
    elLives.innerText = `${lives} lives left`
}
