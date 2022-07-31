const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const letterSize = 50
const spacing = 300

const centerX = canvas.width / 2
const centerY = canvas.height / 2

function resetEventsListener() {
    const clone = canvas.cloneNode()
    canvas.parentNode.replaceChild(clone, canvas)
}

function getScore() {
    const score = localStorage.getItem('score')
    return Number(score) || 0
}

function addScore(score) {
    localStorage.setItem('score', getScore() + score)
}

function letterPosition(word, i) {
    const angle = ((i / word.length) * 2 * Math.PI - Math.PI / 2)
    return {
        x: Math.cos(angle) * spacing + centerX,
        y: Math.sin(angle) * spacing + centerY
    }
}

function draw(word, selection, solutionsFound) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawSelectionLines(word, selection)
    ctx.font = letterSize + 'px Arial'

    ctx.fillStyle = '#0000ff'
    for (let i = 0; i < solutionsFound.length; i++) {
        ctx.fillText(solutionsFound[i], letterSize / 4, (solutionsFound.length - i + 1) * letterSize)
    }
    ctx.fillStyle = '#ff0000'
    ctx.fillText(getScore(), letterSize / 4, letterSize)

    for (let i = 0; i < word.length; i++) {
        const { x, y } = letterPosition(word, i)
        if (selection.includes(word[i])) {
            ctx.fillStyle = '#ff0000'
            ctx.beginPath()
            ctx.arc(x, y, letterSize, 0, 2 * Math.PI)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
        } else {
            ctx.fillStyle = '#000000'
        }
        ctx.fillText(word[i].toUpperCase(), x, y)
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function drawSelectionLines(word, selection) {
    let lastX, lastY

    for (let i = 0; i < selection.length; i++) {
        const { x: letterX, y: letterY } = letterPosition(word, word.indexOf(selection[i]))
        if (i > 0) {
            drawLine(lastX, lastY, letterX, letterY)
        }
        lastX = letterX
        lastY = letterY
    }
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function beginSelection(e, word, selection, solutionsFound) {
    const x = e.clientX
    const y = e.clientY

    for (let i = 0; i < word.length; i++) {
        const { x: letterX, y: letterY } = letterPosition(word, i)

        if (getDistance(x, y, letterX, letterY) < letterSize) {
            selection.push(word[i])
        }
    }

    draw(word, selection, solutionsFound)
}

function dragSelection(e, word, selection, solutionsFound) {
    if (!selection.length) return

    const x = e.clientX
    const y = e.clientY

    for (let i = 0; i < word.length; i++) {
        const { x: letterX, y: letterY } = letterPosition(word, i)

        if (!selection.includes(word[i]) && getDistance(x, y, letterX, letterY) < letterSize) {
            selection.push(word[i])
        }
    }

    draw(word, selection, solutionsFound)

    const { x: letterX, y: letterY } = letterPosition(word, word.indexOf(selection[selection.length - 1]))
    drawLine(letterX, letterY, x, y)
}

/* function getSolutions(words, word) {
    const solutions = []

    const letters = word.split('').sort()

    for (const otherWord of words) {
        const otherLetters = otherWord.split('').sort()

        if (otherLetters.every(letter => letters.includes(letter))) {
            solutions.push(otherWord)
        }
    }

    return solutions
} */

function checkSolution(selection, index, solutionsFound, wordlist) {
    const sel = selection.join('')

    if (wordlist[index].includes(sel) && !solutionsFound.includes(sel)) {
        solutionsFound.push(sel)
        addScore(1)

        selection.length = 0
        draw(wordlist[index][0], selection, solutionsFound)

        if (solutionsFound.length >= Math.min(5, wordlist[index].length)) {
            game(wordlist, solutionsFound)
        }
    } else {
        selection.length = 0
        draw(wordlist[index][0], selection, solutionsFound)
    }
}

async function main() {
    const wordlist = (await fetch('mots.csv').then(res => res.text()))
        .split('\n')
        .map(line => line.split(','))
    game(wordlist)
}

function game(wordlist, solutionsFound = []) {
    const rndIndex = Math.floor(Math.random() * wordlist.length)
    const word = wordlist[rndIndex][0]

    const selection = []
    draw(word, selection, solutionsFound)
    canvas.addEventListener('pointerdown', e => beginSelection(e, word, selection, solutionsFound))
    canvas.addEventListener('pointermove', e => dragSelection(e, word, selection, solutionsFound))
    canvas.addEventListener('pointerup', () => checkSolution(selection, rndIndex, solutionsFound, wordlist))
}

main()