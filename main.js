const MIN_SOLUTIONS = 10

// WORD INPUT
const wordInputWrapper = document.getElementById('word-input-wrapper')
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
  if (e.key === 'Backspace') {
    e.preventDefault()
    wordBackspace.click()
  } else if (e.key === 'Enter') {
    wordSubmit.click()
  } else if (e.key === 'Escape') {
    resetButton.click()
  }

  wordInput.focus()
})

// RESET
const resetWrapper = document.getElementById('reset-wrapper')
const resetButton = document.getElementById('reset-button')
const resetYes = document.getElementById('reset-yes')
const resetNo = document.getElementById('reset-no')
resetButton.onclick = () => {
  resetWrapper.classList.add('show')
  setTimeout(() => {
    resetWrapper.classList.remove('show')
  }, 3000)
}

resetYes.onclick = () => {
  resetSave()
  resetWrapper.classList.remove('show')
}

resetNo.onclick = () => {
  resetWrapper.classList.remove('show')
}

// SETTINGS: SHOW OVERLAY
const settingsButton = document.getElementById('settings-button')
const settingsOverlay = document.getElementById('settings-overlay')
settingsButton.onclick = () => {
  if (settingsOverlay.classList.contains('show')) {
    settingsOverlay.classList.remove('show')
  } else {
    settingsOverlay.classList.add('show')
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

// GAME
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const WORDLIST = await fetch('mots.txt').then(res => res.text()).then(text => text.split('\n'))

function addSolutionFound(solution) {
  const save = getSave()
  save.solutionsFound.push(solution)
  localStorage.setItem('save', JSON.stringify(save))

  updateSolutionsFound()
}

function updateSolutionsFound() {
  const { solutions, solutionsFound } = getSave()

  solutionsDiv.innerHTML = ''

  solutionsFound.sort()

  for (const solution of solutionsFound) {
    const solutionLi = document.createElement('div')
    solutionLi.innerText = solution.toUpperCase()
    solutionsDiv.appendChild(solutionLi)
  }

  scoreDiv.innerText = solutionsFound.length + " / " + solutions.length
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

function getSave() {
  let save;

  try {
    save = JSON.parse(localStorage.getItem('save'))
  } catch (e) {
    console.warn(e)
  }

  if (!save || !save.letters || !save.solutions) {
    let solutions = []
    let letters = ""

    while (solutions.length < MIN_SOLUTIONS) {
      solutions = []
      letters = ""

      let alphabet = ALPHABET
      for (let i = 0; i < 7; i++) {
        letters += alphabet[Math.floor(Math.random() * alphabet.length)]
        alphabet = alphabet.replace(letters[i], '')
      }

      for (const word of WORDLIST) {
        if (word && word.split('').some(letter => letter === letters[0]) && word.split('').every(letter => letters.includes(letter))) {
          solutions.push(word)
        }
      }
    }

    save = {
      letters,
      solutions,
      solutionsFound: []
    }

    localStorage.setItem('save', JSON.stringify(save))
  }

  if (!save.solutionsFound) {
    save.solutionsFound = []
    localStorage.setItem('save', JSON.stringify(save))
  }

  console.log(save)
  return save
}

function checkSolution() {
  const input = wordInput.value.toLowerCase()
  const { solutions, solutionsFound } = getSave()

  if (input === "iwanttocheat") {
    for (const solution of solutions) {
      if (!solutionsFound.includes(solution)) {
        addSolutionFound(solution)
      }
    }
    wordInput.value = ''
    return
  }

  if (solutions.includes(input)) {
    if (!solutionsFound.includes(input)) {
      addSolutionFound(input)

      wordInput.value = ''
    } else {
      console.log("le mot a déjà été trouvé")
    }
  } else {
    console.log("le mot n'est pas dans la liste des solutions")
    wordInputWrapper.classList.add('error')
    setTimeout(() => {
      wordInput.value = ''
      wordInputWrapper.classList.remove('error')
    }, 800)
  }
}

function resetSave() {
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
    }
  }

  // Init solutions
  updateSolutionsFound()
}

game()