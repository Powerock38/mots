const fs = require('fs')

const dico = [
  ...fs.readFileSync('liste_francais.txt', 'utf-8').split('\n'),
  ...fs.readFileSync('gutenberg.txt', 'utf-8').split('\n'),
  ...fs.readFileSync('ods6.txt', 'utf-8').split('\n'),
]

let words = new Set()

for (const mot of dico) {
  if (mot.length > 1) {
    const motClean = mot.normalize('NFKD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
    if (/^[a-z]+$/.test(motClean)) {
      words.add(motClean)
    }
  }
}

words = [...words]
words.sort()

for (const word of words) {
  console.log(word)
}