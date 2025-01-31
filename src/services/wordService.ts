/* eslint-disable @typescript-eslint/no-explicit-any */

const WORDNIK_API_KEY = process.env.WORDNIK_API_KEY;
const WORDNIK_RANDOM_WORDS_URL = "https://api.wordnik.com/v4/words.json/randomWords";
const WORDNIK_WORD_DEFINITION_URL = "https://api.wordnik.com/v4/word.json/{}/definitions";

const wordLengths = [4, 5, 6, 7];

// In-memory cache
const dailyWordCache: any = {
  date: null,
  word: null,
  length: null,
};

export async function getDailyWord() {
  /**
   * Retrieve the word of the day from memory if available.
   * Otherwise, fetch it from Wordnik, verify it exists in the dictionary,
   * and ensure it has no spaces or special characters.
   */
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // If cached word is from today, return it
  if (dailyWordCache.date === today) {
    return { word: dailyWordCache.word, length: dailyWordCache.length };
  }

  // Determine word length for today
  const wordLength = wordLengths[new Date().getDate() % wordLengths.length];

  const params = new URLSearchParams();
  params.append("api_key", WORDNIK_API_KEY || "");
  params.append("minLength", wordLength.toString());
  params.append("maxLength", wordLength.toString());
  params.append("hasDictionaryDef", "true");
  params.append("limit", "10"); 

  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch(`${WORDNIK_RANDOM_WORDS_URL}?${params}`);
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} - ${response.statusText}`);
        break;
      }

      const words = await response.json();
      if (!words.length) {
        console.error("❌ No words found for today.");
        return { word: null, length: wordLength };
      }

      for (const wordData of words) {
        const selectedWord = wordData.word.toLowerCase();

        // Validate and check if word has a definition
        if (isValidWord(selectedWord) && (await wordHasDefinition(selectedWord))) {
          dailyWordCache.date = today;
          dailyWordCache.word = selectedWord;
          dailyWordCache.length = wordLength;
          return { word: selectedWord, length: wordLength };
        } else {
          console.warn(`⚠️ Rejected word: ${selectedWord} (Invalid or no definition). Retrying...`);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching word:", error);
      break;
    }
  }

  console.error("❌ Unable to find a valid word after 10 attempts.");
  return { word: null, length: wordLength };
}

function isValidWord(word: string) {
  /**
   * Check if the word is valid: no spaces, numbers, or special characters.
   */
  return /^[A-Za-z]+$/.test(word);
}

async function wordHasDefinition(word: string) {
  /**
   * Check if a word has a valid definition in the dictionary.
   */
  try {
    const response = await fetch(WORDNIK_WORD_DEFINITION_URL.replace("{}", word) + `?api_key=${WORDNIK_API_KEY}`);
    if (!response.ok) return false;

    const definitions = await response.json();
    return definitions.length > 0;
  } catch (error) {
    console.error(`❌ Error checking definition for ${word}:`, error);
    return false;
  }
}
