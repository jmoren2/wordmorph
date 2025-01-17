import axios from "axios";
import { useEffect, useState } from "react";
import './App.css';

const App = () => {
  const [wordLength, setWordLength] = useState(null);
  const [dailyWord, setDailyWord] = useState(""); // Store the word of the day
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [notification, setNotification] = useState("");
  const maxGuesses = 6;
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  // Fetch word length on load
  useEffect(() => {
    axios.get("http://localhost:5000/api/word-length").then((response) => {
      setWordLength(response.data.length);
    });

    axios.get("http://localhost:5000/api/word").then((response) => {
      setDailyWord(response.data.word);
    });
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    if (value.length <= wordLength) {
      setCurrentGuess(value);
    }
  };

  const getLetterStatus = (letter) => {
    if (guesses.some((word) => word.includes(letter))) {
      if (dailyWord.includes(letter)) {
        return "present";
      } else {
        return "absent";
      }
    }
    return "";
  };

  // Handle guess submission
  const handleSubmit = () => {
    if (gameOver) return;

    if (!dailyWord) {
      alert("The game is still loading. Please wait a moment.");
      return;
    }
    if (currentGuess.length !== wordLength) {
      setNotification(`Enter a ${wordLength}-letter word!`);
      return;
    }

    const feedbackArray = currentGuess.split("").map((char, index) => {
      if (char === dailyWord[index]) return "green";
      if (dailyWord.includes(char)) return "yellow";
      return "gray";
    });

    setGuesses([...guesses, currentGuess]);
    setFeedback([...feedback, feedbackArray]);
    setCurrentGuess("");

    if (currentGuess === dailyWord) {
      setNotification("🎉 You Won! 🎉");
      setGameOver(true);
    } else if (guesses.length + 1 === maxGuesses) {
      setNotification(`Game Over! The word was: ${dailyWord}`);
      setGameOver(true);
    }
  };

  return (
    <>
      <div className="App">
        <div className="nes-box">
          <h1>WordMorph</h1>
          <p>Today's Word Length: {wordLength || "Loading..."}</p>

          {/* Game Grid */}
          <div className="grid">
            {
              Array.from({ length: maxGuesses }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                  {Array.from({ length: wordLength || 0 }).map((_, colIndex) => {
                    const feedbackClass = guesses[rowIndex]
                      ? feedback[rowIndex][colIndex] === "green"
                        ? "correct"
                        : feedback[rowIndex][colIndex] === "yellow"
                          ? "present"
                          : "absent"
                      : "white";
                    return (
                      <div
                        key={colIndex} className={`grid-cell ${guesses[rowIndex] ? feedbackClass : ""}`} >
                        {
                          guesses[rowIndex]?.[colIndex] || ""
                        }
                      </div>
                    );
                  }
                  )}
                </div>
              ))}
          </div>
          <div className="keyboard">
            {alphabet.split("").map((letter) => (
              <div key={letter} className={`key ${getLetterStatus(letter)}`}>
                {letter.toUpperCase()}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={currentGuess}
              onChange={handleInputChange}
              maxLength={wordLength || 0}
              disabled={!wordLength || gameOver}
              placeholder={`Enter a ${wordLength || 0}-letter word`}
              className="input-box"
            />
            <button
              onClick={handleSubmit}
              className="button"
              disabled={gameOver}
            >
              Submit
            </button>
          </div>
          {notification && (
            <div className="nes-box notification">
              {notification}
              <button onClick={() => setNotification("")} className="nes-button">
                OK
              </button>
            </div>
          )}
          <div className="crt"></div>

          {guesses.length >= maxGuesses && (
            <p style={{ marginTop: "20px", fontSize: "18px" }}>Game Over! Try again tomorrow.</p>
          )}
        </div>
      </div>

    </>

  );
};

export default App;
