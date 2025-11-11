"""Sentiment & emotion analysis utilities using Gemini API.

Falls back to simple polarity analysis if Gemini isn't configured.
"""

import os
from textblob import TextBlob  # fallback polarity

try:
    import google.generativeai as genai
except ImportError:  # library may not be installed yet
    genai = None

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

EMOTION_LABELS = [
    "Very sad",
    "Sad",
    "Neutral",
    "Happy",
    "Very Happy"
]

def _fallback_polarity_to_emotion(polarity: float) -> str:
    """Map TextBlob polarity (-1..1) to one of the discrete emotion labels."""
    # Define thresholds (tunable)
    if polarity <= -0.6:
        return "Very sad"
    if polarity <= -0.2:
        return "Sad"
    if polarity < 0.2:
        return "Neutral"
    if polarity < 0.6:
        return "Happy"
    return "Very Happy"

def analyze_sentiment(text: str) -> float:
    """Return continuous polarity score (-1..1). Retained for compatibility."""
    try:
        blob = TextBlob(text)
        return blob.sentiment.polarity
    except Exception:
        return 0.0

def analyze_emotion(text: str) -> str:
    """Return one of the EMOTION_LABELS using Gemini if available, else fallback.

    Uses a concise prompt to classify overall emotional tone of the journal entry.
    """
    # If Gemini not configured, use fallback
    if not GEMINI_API_KEY or genai is None:
        polarity = analyze_sentiment(text)
        return _fallback_polarity_to_emotion(polarity)

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-pro")
        prompt = (
            "Classify the emotional tone of the following journal entry into exactly one of these labels: "
            + ", ".join(EMOTION_LABELS) + ".\n"
            "Return ONLY the label with no explanation.\n\nEntry:\n" + text[:4000]  # guard length
        )
        response = model.generate_content(prompt)
        if response and response.text:
            raw = response.text.strip()
            # Normalize matching
            for label in EMOTION_LABELS:
                if raw.lower().startswith(label.lower()):
                    return label
        # Fallback if Gemini response unexpected
        polarity = analyze_sentiment(text)
        return _fallback_polarity_to_emotion(polarity)
    except Exception:
        polarity = analyze_sentiment(text)
        return _fallback_polarity_to_emotion(polarity)
