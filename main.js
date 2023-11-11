const MIN_SOLUTIONS = 10

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
  checkSolution(getSave())
}

document.addEventListener('keydown', e => {
  if (e.key === 'Backspace') {
    wordBackspace.click()
  } else if (e.key === 'Enter') {
    wordSubmit.click()
  } else if (e.key === 'Escape') {
    resetButton.click()
  }

  wordInput.focus()
})

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

  for (const solution of solutionsFound) {
    const solutionLi = document.createElement('li')
    solutionLi.innerText = solution.toUpperCase()
    solutionsDiv.appendChild(solutionLi)
  }

  scoreDiv.innerText = solutionsFound.length + '/' + solutions.length
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
      wordInputWrapper.classList.remove('error')
    }, 500)
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
      wordInput.focus()
    }
  }

  // Init solutions
  updateSolutionsFound()
}

game()