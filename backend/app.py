from flask import Flask, jsonify
from flask_cors import CORS
import datetime
import math
import requests
import os
import hashlib
import re

app = Flask(__name__)
CORS(app)

WORDNIK_API_KEY = os.environ['WORDNIK_API_KEY']
WORDNIK_RANDOM_WORDS_URL = "https://api.wordnik.com/v4/words.json/randomWords"
WORDNIK_WORD_DEFINITION_URL = "https://api.wordnik.com/v4/word.json/{}/definitions"

# In-memory cache
daily_word_cache = {
    "date": None,
    "word": None,
    "length": None
}

word_lengths = [4, 5, 6, 7]

def get_daily_word():
    """
    Retrieve the word of the day from memory if available.
    Otherwise, fetch it from Wordnik, verify it exists in the dictionary,
    and ensure it has no spaces or special characters.
    """
    today = datetime.datetime.now().strftime("%Y-%m-%d")

    # If today's word is already cached, return it
    if daily_word_cache["date"] == today:
        return daily_word_cache["word"], daily_word_cache["length"]

    # Define word length based on the day of the month
    word_length = word_lengths[datetime.datetime.now().day % len(word_lengths)]

    # Hash today's date to get a deterministic index
    params = {
        "api_key": WORDNIK_API_KEY,
        "minLength": word_length,
        "maxLength": word_length,
        "hasDictionaryDef": True,
        "limit": 10
    }

    for _ in range(10):  # Attempt up to 5 retries to find a valid word
        response = requests.get(WORDNIK_RANDOM_WORDS_URL, params=params)

        if response.status_code == 200:
            words = response.json()
            if not words:
                print("❌ No words found for today.")
                return None, word_length
            
            for word_data in words:
                selected_word = word_data.get("word", "")

                # Validate the word (must contain only letters & have a dictionary definition)
                if is_valid_word(selected_word) and word_has_definition(selected_word):
                    # Cache the word
                    daily_word_cache["date"] = today
                    daily_word_cache["word"] = selected_word.lower()
                    daily_word_cache["length"] = word_length
                    return selected_word, word_length
                else:
                    print(f"⚠️ Rejected word: {selected_word} (Invalid or no definition). Retrying...")

        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            break

    print("❌ Unable to find a valid word after 10 attempts.")
    return None, word_length


def is_valid_word(word):
    """
    Check if the word is valid: no spaces, numbers, or special characters.
    """
    return bool(re.fullmatch(r"^[A-Za-z]+$", word))  # Ensures only letters A-Z/a-z


def word_has_definition(word):
    """
    Check if a word has a valid definition in the dictionary.
    """
    response = requests.get(WORDNIK_WORD_DEFINITION_URL.format(word), params={"api_key": WORDNIK_API_KEY})
    if response.status_code == 200:
        definitions = response.json()
        return len(definitions) > 0  # Returns True if definitions exist
    return False

@app.route("/api/word-length", methods=["GET"])
def word_length():
    """
    API endpoint to get the length of today's word.
    """
    _, word_length = get_daily_word()
    print(f"Today's length: ({word_length} letters")
    return jsonify({"length": word_length})

@app.route("/api/word", methods=["GET"])
def word():
    """
    API endpoint to get today's word (for validation).
    """
    word, _ = get_daily_word()
    print(f"Today's word: {word}")
    return jsonify({"word": word})

if __name__ == "__main__":
    print("Backend is running on http://localhost:5000")
    app.run(debug=True)
