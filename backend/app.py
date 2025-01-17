from flask import Flask, jsonify
from flask_cors import CORS
import datetime
import math

app = Flask(__name__)
CORS(app)

# Word list for the game
words = {
    4: ["sand", "iron", "mist"],
    5: ["apple", "stone", "grape"],
    6: ["butter", "smooth", "strain"],
    7: ["plaster", "cabinet", "fishing"],
}

def get_daily_word():
    """
    Determine the word of the day based on the current date.
    """
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    word_lengths = [4, 5, 6, 7]
    word_length = word_lengths[datetime.datetime.now().day % len(word_lengths)]
    
    # Generate a consistent hash index from today's date
    index = sum(ord(char) for char in today) % len(words[word_length])
    word = words[word_length][index]
    return word, word_length

@app.route("/api/word-length", methods=["GET"])
def word_length():
    """
    API endpoint to get the length of today's word.
    """
    _, word_length = get_daily_word()
    return jsonify({"length": word_length})

@app.route("/api/word", methods=["GET"])
def word():
    """
    API endpoint to get today's word (for validation).
    """
    word, _ = get_daily_word()
    return jsonify({"word": word})

if __name__ == "__main__":
    print("Backend is running on http://localhost:5000")
    app.run(debug=True)
