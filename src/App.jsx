import { useState } from 'react'
import './App.css'
import { languages } from '../src/data/languages.js'
import { getFarewellText, getRandomWord } from '../src/data/utils.js'
import { clsx } from 'clsx';
import Confetti from 'react-confetti'

function App() {
  // State values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())
  const [guessedLetters, setGuessedLetters] = useState([])

  // Derived values
  const numGuessesLeft = languages.length - 1
  const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length
  const isGameWon = currentWord.split('').every(letter => guessedLetters.includes(letter))
  const isGameLost = wrongGuessCount >= numGuessesLeft
  const isGameOver = isGameWon || isGameLost
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
  const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

  // Static values
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'

  function addGuessedLetter(letter) {
    setGuessedLetters(prevLetters =>
      !prevLetters.includes(letter) ? [...prevLetters, letter] : prevLetters
    )
  }

  const gameStatusClass = clsx('game-status', {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect
  })

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <>
          <p className='farewell-message'>{getFarewellText(languages[wrongGuessCount - 1].name)}</p>
        </>
      )
    }
    else if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      )
    } else if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      )
    }
    return null
  }

  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color
    }
    const className = clsx('chip', isLanguageLost && 'lost')
    return (
      <span
        className={className}
        style={styles}
        key={lang.name}
      >
        {lang.name}
      </span>
    )
  })

  let letterElements = currentWord.split('').map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && 'missed-letter'
    )
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ''}
      </span>
    )
  })

  let keyboardElements = alphabet.split('').map(letter => {
    const isGuessed = guessedLetters.includes(letter)
    const isCorrect = isGuessed && currentWord.includes(letter)
    const isWrong = isGuessed && !currentWord.includes(letter)
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    })

    return (
      <button
        className={className}
        key={letter}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
        onClick={() => addGuessedLetter(letter)}
      >
        {letter.toUpperCase()}
      </button>
    )
  })

  function startNewGame() {
    setCurrentWord(getRandomWord())
    setGuessedLetters([])
  }

  return (
    <>
      {isGameWon && <Confetti />}
      <main>
        <header>
          <h1>Assembly: Endgame</h1>
          <p>Guess the word in under 8 attempts to keep the programming world safe from Assembly!</p>
        </header>

        <section
          aria-live='polite'
          role='status'
          className={gameStatusClass}
        >
          {renderGameStatus()}
        </section>

        <section className='language-chips'>
          {languageElements}
        </section>

        <section className='word'>
          {letterElements}
        </section>

        {/* Combined visually-hidden aria-live region for status updates */}
        <section
          className='sr-only'
          aria-live='polite'
          role='status'
        >
          <p>
            {currentWord.includes(lastGuessedLetter) ?
              `Correct! The letter ${lastGuessedLetter} is in the word.` :
              `Sorry, the letter ${lastGuessedLetter} is not in the word.`
            }
            You have {numGuessesLeft} attempts left.
          </p>
          <p>Current word: {currentWord.split('').map(letter => guessedLetters.includes(letter) ?
            letter + '.' : 'blank')
            .join(' ')}</p>
          {/* '.' adds a pause. '' gets ignored by sr so 'blank' is used instead*/}
        </section>

        <section className='keyboard'>
          {keyboardElements}
        </section>
        
        {isGameOver && <button className='new-game' onClick={startNewGame}>New Game</button>}
      </main>
    </>
  )
}

export default App
