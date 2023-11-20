const MIN_SOLUTIONS = 50
const SOLUTION_POINTS_VALUE = 1
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

// CONFIRM : RESET & GIVE UP
for (const confirm of document.querySelectorAll('.confirm')) {
  const confirmButton = confirm.querySelector(':scope > button')
  const confirmYes = confirm.querySelector(':scope > div > button:first-child')
  const confirmNo = confirm.querySelector(':scope > div > button:last-child')

  let timeout = null

  confirmButton.onclick = () => {
    confirm.classList.add('show')
    timeout = setTimeout(() => {
      confirm.classList.remove('show')
    }, 3000)
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

const settingsPrimaryColor = document.getElementById('settings-primary-color')
settingsPrimaryColor.value = localStorage.getItem('settings-primary-color') || '#7f2ccb'
settingsPrimaryColor.onchange = () => {
  cssRoot.style.setProperty('--primary', settingsPrimaryColor.value)
  localStorage.setItem('settings-primary-color', settingsPrimaryColor.value)
}
settingsPrimaryColor.onchange()

const settingsSecondaryColor = document.getElementById('settings-secondary-color')
settingsSecondaryColor.value = localStorage.getItem('settings-secondary-color') || '#dddddd'
settingsSecondaryColor.onchange = () => {
  cssRoot.style.setProperty('--secondary', settingsSecondaryColor.value)
  localStorage.setItem('settings-secondary-color', settingsSecondaryColor.value)
}
settingsSecondaryColor.onchange()

const settingsLetterShape = document.getElementById('settings-letter-shape')
settingsLetterShape.value = localStorage.getItem('settings-letter-shape') || 'url(assets/hexagon.svg)'
settingsLetterShape.onchange = () => {
  cssRoot.style.setProperty('--letter-shape', settingsLetterShape.value)
  localStorage.setItem('settings-letter-shape', settingsLetterShape.value)
}
settingsLetterShape.onchange()

const settingsWallpaper = document.getElementById('settings-wallpaper')
settingsWallpaper.value = localStorage.getItem('settings-wallpaper') || 'none'
settingsWallpaper.onchange = () => {
  cssRoot.style.setProperty('--wallpaper', settingsWallpaper.value)
  localStorage.setItem('settings-wallpaper', settingsWallpaper.value)
}
settingsWallpaper.onchange()

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

function addSolutionsFound(solutions) {
  const save = getSave()
  save.solutionsFound = [...new Set([...save.solutionsFound, ...solutions])]
  localStorage.setItem('save', JSON.stringify(save))

  updateSolutionsFound()
}

function updateSolutionsFound() {
  const { solutionsFound } = getSave()

  solutionsDiv.innerHTML = ''

  solutionsFound.sort()

  for (const solution of solutionsFound) {
    const solutionElement = document.createElement('a')
    solutionElement.innerText = solution.toUpperCase()
    solutionElement.href = "https://dictionnaire.lerobert.com/definition/" + solution
    solutionElement.target = "_blank"
    solutionElement.rel = "noopener noreferrer"
    solutionsDiv.appendChild(solutionElement)
  }

  updateScore()
}

function getPoints() {
  const { solutionsFound, hintsBought } = getSave()
  return (solutionsFound.length - hintsBought) * SOLUTION_POINTS_VALUE - hintsBought * HINT_POINTS_VALUE
}

function updateScore() {
  const { solutions, solutionsFound } = getSave()

  scoreDiv.innerText = solutionsFound.length + " / " + solutions.length
  scoreDiv.innerText += ` (${getPoints()} pts)`
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
      hintsBought: 0,
    }

    localStorage.setItem('save', JSON.stringify(save))
  }

  if (!save.solutions) {
    save.solutions = generateSolutions(save.letters)
    localStorage.setItem('save', JSON.stringify(save))
  }

  if (!save.solutionsFound) {
    save.solutionsFound = []
    save.hintsBought = 0
    localStorage.setItem('save', JSON.stringify(save))
  }

  if (save.hintsBought === undefined) {
    save.hintsBought = 0
    localStorage.setItem('save', JSON.stringify(save))
  }

  console.log(save)
  return save
}

function checkSolution() {
  const input = wordInput.value.toLowerCase()
  const { solutions, solutionsFound } = getSave()

  if (solutions.includes(input)) {
    if (!solutionsFound.includes(input)) {
      addSolutionsFound([input])
      wordInput.value = ''
    } else {
      console.log("le mot a déjà été trouvé")
      wordInput.classList.add('warning')
      setTimeout(() => {
        wordInput.value = ''
        wordInput.classList.remove('warning')
      }, 800)
    }
  } else {
    console.log("le mot n'est pas dans la liste des solutions")
    wordInput.classList.add('error')
    setTimeout(() => {
      wordInput.value = ''
      wordInput.classList.remove('error')
    }, 800)
  }
}

function buyHint(element) {
  console.log(element)
  const { solutions, solutionsFound, hintsBought } = getSave()

  if (getPoints() >= HINT_POINTS_VALUE) {
    const possibleHints = solutions.filter(solution => !solutionsFound.includes(solution))
    if (possibleHints.length === 0) {
      console.log("plus de solutions")
      return
    }
    const hint = possibleHints[Math.floor(Math.random() * possibleHints.length)]
    localStorage.setItem('save', JSON.stringify({ ...getSave(), hintsBought: hintsBought + 1 }))
    updateScore()
    wordInput.value = hint
    addSolutionsFound([hint])
  } else {
    console.log("pas assez de points")
  }
}

function giveUp() {
  const { solutions } = getSave()
  addSolutionsFound(solutions)

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
  updateSolutionsFound()
}

game()
