/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { config } from "../utils/config";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";
import NavigationButton from "./NavigationButton";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function WordMorph({ session }: { session: any }) {
  const [wordLength, setWordLength] = useState(null);
  const [dailyWord, setDailyWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState<(string)[][]>([]);
  const [gameOver, setGameOver] = useState(Cookies.get("gameOver") === "true");
  const [notification, setNotification] = useState("");
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const isDebug = config.debugMode;
  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (session) {
      axios.get(`/api/game/${session.user.id}`).then((res) => {
        if (res.data) {
          setGameData(res.data);
          setStreak(res.data.streak);
        }
      });
    }
  }, [session]);

  // Fetch word length on load
  useEffect(() => {
    // Load saved game state from localStorage
    const savedGameData = localStorage.getItem("wordMorphGameState");

    if (savedGameData) {
      const parsedData = JSON.parse(savedGameData);

      // Restore the game state
      setWordLength(parsedData.wordLength);
      setDailyWord(parsedData.dailyWord);
      setGuesses(parsedData.guesses);
      setFeedback(parsedData.feedback);
      setCurrentGuess(parsedData.currentGuess);
      setGameOver(parsedData.gameOver);
      setNotification(parsedData.notification);
    } else {

      axios.get("/api/word-length").then((response) => {
        console.log(response);

        setWordLength(response.data.length);
      });

      axios.get("/api/word").then((response) => {
        setDailyWord(response.data.word);
      });

    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (gameOver && !notification.includes("You Won")) {
      setNotification("You've already played today, come back tomorrow for the next WordMorph!");
    }
  }, []);

  const handleInputChange = (e: { target: { value: string; }; }) => {
    const value = e.target.value.toLowerCase();
    if (value.length <= (wordLength || 0)) {
      setCurrentGuess(value);
    }
  };

  const getLetterStatus = (letter: string) => {
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
  const handleSubmit = async () => {
    if (gameOver) return;

    if (!dailyWord) {
      alert("The game is still loading. Please wait a moment.");
      return;
    }

    if (!/^[a-zA-Z]+$/.test(currentGuess)) {
      setNotification("❌ Only letters (A-Z) are allowed! ❌");
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

    const updatedGuesses = [...guesses, currentGuess];
    const updatedFeedback = [...feedback, feedbackArray];
    let newGameOver = false;
    let newNotification = "";

    if (currentGuess === dailyWord) {
      newGameOver = true;
      newNotification = "🎉 You Won! 🎉";
      Cookies.set("gameOver", "true", { expires: 1 }); // Cookie expires in 1 day
      setStreak(streak + 1); // Increase streak

      if (session?.user) {
        await axios.post("/api/game/update", {
          userId: session.user.id,
          lastPlayed: new Date(),
          streak: streak + 1,
        });
      }
    } else if (updatedGuesses.length === wordLength) {
      newGameOver = true;
      newNotification = `Game Over! The word was: ${dailyWord}`;
      Cookies.set("gameOver", "true", { expires: 1 });
      setStreak(0); // Reset streak if the user loses

      if (session?.user) {
        await axios.post("/api/game/update", {
          userId: session.user.id,
          lastPlayed: new Date(),
          streak: 0,
        });
      }
    }

    // Update state
    setGuesses(updatedGuesses);
    setFeedback(updatedFeedback);
    setCurrentGuess("");
    setGameOver(newGameOver);
    setNotification(newNotification);

    // Save updated game state in localStorage
    localStorage.setItem("wordMorphGameState", JSON.stringify({
      wordLength,
      dailyWord,
      guesses: updatedGuesses,
      feedback: updatedFeedback,
      currentGuess: "",
      gameOver: newGameOver,
      notification: newNotification,
    }));
  };

  return (
    <>
      <div className="App">
        <div className="nes-box">
          <div className="header-container">
            {!isLoading &&
              <NavigationButton text="BACK" path="/" classes="nav-button secondary-button" />
            }
            <h1>WordMorph</h1>
          </div>


          {!isLoading ?
            <div>
              <p>Today&apos;s Word Length: {wordLength || "Loading..."}</p>

              {/* Game Grid */}
              <div className="grid">
                {
                  Array.from({ length: wordLength || 0 }).map((_, rowIndex) => (
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
            </div>
            : <LoadingSpinner />
          }

          {notification && (
            <div className="nes-box notification">
              {notification}
              <br />
              <button onClick={() => setNotification("")} className="nes-button">
                OK
              </button>
            </div>
          )}
          <div className="crt"></div>

          {wordLength !== null && guesses.length >= wordLength && (
            <p style={{ marginTop: "20px", fontSize: "18px" }}>Game Over! Try again tomorrow.</p>
          )}
        </div>
      </div>
      {
        isDebug ?
          <button onClick={() => {
            localStorage.removeItem("wordMorphGameState");
            Cookies.remove("gameOver");
            window.location.reload();
          }} className="button" style={{ marginTop: "20px" }}>
            Reset Game
          </button> : null
      }

    </>

  );
};
