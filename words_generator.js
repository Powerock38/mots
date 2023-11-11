const fs = require('fs')

const MIN_LETTERS = 3;
const MAX_LETTERS = 7;

const dico = fs.readFileSync('dico.txt', 'utf-8').split('\n')

for (const mot of dico) {
  if (mot.length >= MIN_LETTERS && mot.length <= MAX_LETTERS) {

    const motClean = mot.normalize('NFKD').replace(/[\u0300-\u036f]/g, "").toLowerCase()

    console.log(motClean)
  }
}

