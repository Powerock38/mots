import unicodedata

MIN_LETTERS_SOLUTION = 3
MIN_LETTERS_GUESSWORD = 4
MAX_LETTERS = 8

# https://raw.githubusercontent.com/hbenbel/French-Dictionary/master/dictionary/dictionary.csv
with open('dictionary.csv', 'r') as f:
    lines = f.read().splitlines()

    words = set()

    for raw_word in lines:
        word = unicodedata.normalize('NFD', raw_word).encode('ascii', 'ignore').decode("utf-8")
        
        if MIN_LETTERS_SOLUTION <= len(word) <= MAX_LETTERS:

            if word in words or any([c not in 'azertyuiopqsdfghjklmwxcvbn' for c in word]) or len(set(word)) != len(word):
                continue

            words.add(word)

    for word in words:
        if len(word) >= MIN_LETTERS_GUESSWORD:
            letters = set(word)

            solutions = set()

            for other_word in words:
                if other_word != word:
                    other_letters = set(other_word)
                    if other_letters <= letters:
                        solutions.add(other_word)

            if len(solutions) >= 3:
                print(word + ',' + ','.join(solutions))
