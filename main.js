const MIN_SOLUTIONS = 50
const HINT_POINTS_VALUE = 10

// WORD INPUT
const wordInput = document.getElementById('word-input')
const solutionsDiv = document.getElementById('solutions')
const scoreDiv = document.getElementById('score')

const wordBackspace = document.getElementById('word-backspace')
wordBackspace.onclick = () => {
  wordInput.value = wordInput.value.slice(0, -1)
}

const wordSubmit = document.getElementById('word-submit')
wordSubmit.onclick = () => {
  checkSolution()
}

document.addEventListener('keydown', e => {
  if (settingsOverlayWrapper.classList.contains('show')) return

  if (e.key === 'Backspace') {
    e.preventDefault()
    wordBackspace.click()
  } else if (e.key === 'Enter') {
    wordSubmit.click()
  }

  wordInput.focus()
})

function addRemoveClass(element, className, duration, callback) {
  element.classList.add(...className.split(' '))
  return setTimeout(() => {
    element.classList.remove(...className.split(' '))
    if (callback) callback()
  }, duration)
}

// CONFIRM : RESET & GIVE UP
for (const confirm of document.querySelectorAll('.confirm')) {
  const confirmButton = confirm.querySelector(':scope > button')
  const confirmYes = confirm.querySelector(':scope > div > button:first-child')
  const confirmNo = confirm.querySelector(':scope > div > button:last-child')

  let timeout = null

  confirmButton.onclick = () => {
    timeout = addRemoveClass(confirm, 'show', 3000)
  }

  const action = confirm.getAttribute('data-action')
  confirmYes.onclick = () => {
    eval(action)
    confirm.classList.remove('show')
    clearTimeout(timeout)
  }

  confirmNo.onclick = () => {
    confirm.classList.remove('show')
    clearTimeout(timeout)
  }
}

// SETTINGS: SHOW OVERLAY
const settingsButton = document.getElementById('settings-button')
const settingsOverlayWrapper = document.getElementById('settings-overlay-wrapper')
settingsButton.onclick = () => {
  if (settingsOverlayWrapper.classList.contains('show')) {
    settingsOverlayWrapper.classList.remove('show')
  } else {
    settingsOverlayWrapper.classList.add('show')
  }

  settingsLetters.value = getSave().letters
}

settingsOverlayWrapper.onclick = e => {
  if (e.target === settingsOverlayWrapper) {
    settingsOverlayWrapper.classList.remove('show')
  }
}

// SETTINGS: SAVE & LOAD
const cssRoot = document.querySelector(':root')

const settings = [
  { id: 'primary-color', default: '#7f2ccb' },
  { id: 'secondary-color', default: '#dddddd' },
  { id: 'cheated-color', default: '#ff0000' },
  { id: 'letter-shape', default: 'url(assets/hexagon.svg)' },
  { id: 'wallpaper', default: 'none' },
  { id: 'font', default: 'sans-serif' },
]

for (const setting of settings) {
  const element = document.getElementById('settings-' + setting.id)
  element.value = localStorage.getItem('settings-' + setting.id) || setting.default
  element.onchange = () => {
    cssRoot.style.setProperty('--' + setting.id, element.value)
    localStorage.setItem('settings-' + setting.id, element.value)
  }
  element.onchange()
}

// SET LETTERS
const settingsLetters = document.getElementById('settings-letters')
settingsLetters.onclick = () => {
  if (document.activeElement !== settingsLetters) {
    settingsLetters.select()
  }
}
settingsLetters.onchange = () => {
  settingsLetters.value = settingsLetters.value.toLowerCase().replace(/[^a-z]/g, '')
  if (settingsLetters.value.length === 7
    && new Set(settingsLetters.value).size === settingsLetters.value.length
    && confirm(`Recommencer avec les lettres '${settingsLetters.value}' ?`)
  ) {
    localStorage.setItem('save', JSON.stringify({ letters: settingsLetters.value }))
    game()
  }
}

// GAME
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const WORDLIST = await fetch('mots.txt').then(res => res.text()).then(text => text.split('\n'))

function addSolutionCheatedNoUpdate(solution) {
  const save = getSave()
  if (!save.solutionsFound.includes(solution) && !save.solutionsCheated.includes(solution)) {
    save.solutionsCheated.push(solution)
    localStorage.setItem('save', JSON.stringify(save))
  }
}

function addSolutionFound(solution) {
  const save = getSave()
  if (!save.solutionsFound.includes(solution) && !save.solutionsCheated.includes(solution)) {
    save.solutionsFound.push(solution)
    save.points += solution.length
    localStorage.setItem('save', JSON.stringify(save))
    updateSolutions()
  }
}

function updateSolutions() {
  const { solutionsFound, solutionsCheated } = getSave()

  const solutionsAll = [...new Set([
    ...solutionsFound.map(solution => ({ solution, cheated: false })),
    ...solutionsCheated.map(solution => ({ solution, cheated: true }))
  ])]

  solutionsDiv.innerHTML = ''

  solutionsAll.sort((a, b) => a.solution.localeCompare(b.solution))

  for (const sol of solutionsAll) {
    const solutionElement = document.createElement('a')
    solutionElement.innerText = sol.solution.toUpperCase()
    solutionElement.href = "https://dictionnaire.lerobert.com/definition/" + sol.solution
    solutionElement.target = "_blank"
    solutionElement.rel = "noopener noreferrer"
    if (sol.cheated) {
      solutionElement.classList.add('cheated')
    }
    solutionsDiv.appendChild(solutionElement)
  }

  updateScore()
}

function updateScore() {
  const { solutions, solutionsFound, points } = getSave()

  scoreDiv.innerText = solutionsFound.length + " / " + solutions.length
  scoreDiv.innerText += ` (${points} pts)`
  scoreDiv.innerText += "\n‎"

  if (solutionsFound.length === solutions.length) {
    scoreDiv.innerText += "BRAVO 🎉"
  } else if (solutionsFound.length >= solutions.length - 3) {
    scoreDiv.innerText += "PRESQUE 😅"
  } else if (solutionsFound.length >= solutions.length / 2) {
    scoreDiv.innerText += "PLUS QUE LA MOITIÉ 😊"
  } else if (solutionsFound.length >= solutions.length / 4) {
    scoreDiv.innerText += "PAS MAL 😃"
  }

  addRemoveClass(scoreDiv, 'score-shake', 800)
}

function generateSolutions(letters) {
  return WORDLIST.filter(word => word && word.split('').some(letter => letter === letters[0]) && word.split('').every(letter => letters.includes(letter)))
}

function getSave() {
  let save;

  try {
    save = JSON.parse(localStorage.getItem('save'))
  } catch (e) {
    console.warn(e)
  }

  if (!save || !save.letters) {
    let solutions = []
    let letters = ""

    let tries = 0

    while (solutions.length < MIN_SOLUTIONS) {
      letters = ""

      let alphabet = ALPHABET
      for (let i = 0; i < 7; i++) {
        letters += alphabet[Math.floor(Math.random() * alphabet.length)]
        alphabet = alphabet.replace(letters[i], '')
      }

      solutions = generateSolutions(letters)

      tries++
    }

    console.log("tries", tries)

    save = {
      letters,
      solutions,
      solutionsFound: [],
      solutionsCheated: [],
      points: 0,
    }

    localStorage.setItem('save', JSON.stringify(save))
  }

  if (!save.solutions) {
    save.solutions = generateSolutions(save.letters)
    localStorage.setItem('save', JSON.stringify(save))
  }

  if (!save.solutionsFound) {
    save.solutionsFound = []
    save.solutionsCheated = []
    save.points = 0
    localStorage.setItem('save', JSON.stringify(save))
  }

  if (save.points === undefined) {
    save.points = 0
    localStorage.setItem('save', JSON.stringify(save))
  }

  if (!save.solutionsCheated) {
    save.solutionsCheated = []
    localStorage.setItem('save', JSON.stringify(save))
  }

  console.log(save)
  return save
}

function checkSolution() {
  const input = wordInput.value.toLowerCase()
  const { solutions, solutionsFound, solutionsCheated } = getSave()

  if (solutions.includes(input)) {
    if (!solutionsFound.includes(input) && !solutionsCheated.includes(input)) {
      addSolutionFound(input)
      wordInput.value = ''
    } else {
      console.log("le mot a déjà été trouvé")
      addRemoveClass(wordInput, 'warning', 800, () => {
        wordInput.value = ''
      })
    }
  } else {
    console.log("le mot n'est pas dans la liste des solutions")
    addRemoveClass(wordInput, 'error', 800, () => {
      wordInput.value = ''
    })
  }
}

function buyHint() {
  const save = getSave()

  if (save.points >= HINT_POINTS_VALUE) {
    const possibleHints = save.solutions.filter(solution => !save.solutionsFound.includes(solution) && !save.solutionsCheated.includes(solution))

    if (possibleHints.length === 0) {
      console.log("plus de solutions")
      return
    }

    const hint = possibleHints[Math.floor(Math.random() * possibleHints.length)]

    save.points -= HINT_POINTS_VALUE

    localStorage.setItem('save', JSON.stringify(save))

    // pop up word
    const wordDisplay = document.createElement('div')
    wordDisplay.innerText = hint.toUpperCase()
    document.body.appendChild(wordDisplay)
    addRemoveClass(wordDisplay, 'pop-word text-outline cheated', 3000, () => {
      wordDisplay.remove()
    })

    addSolutionCheatedNoUpdate(hint)
    updateSolutions()
  } else {
    console.log("pas assez de points")
  }
}

function giveUp() {
  const { solutions } = getSave()
  for (const solution of solutions) {
    addSolutionCheatedNoUpdate(solution)
  }
  updateSolutions()

  wordInput.value = ''
}

function resetSave() {
  wordInput.value = ''
  localStorage.removeItem('save')
  game()
}

function game() {
  const { letters } = getSave()

  // Init letters
  for (let i = 0; i < letters.length; i++) {
    const letter = document.querySelector('.letter-' + i)
    letter.innerText = letters[i].toUpperCase()

    letter.onclick = () => {
      wordInput.value += letters[i].toUpperCase()
      wordInput.scrollLeft = wordInput.scrollWidth
    }
  }

  // Init solutions
  updateSolutions()
}

game()
