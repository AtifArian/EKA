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
# Model selection: allow override via GEMINI_MODEL, default to the requested flash preview model.
# Will fallback to 'gemini-pro' if the specified model is unavailable.
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-preview-09-2025")
EMOTION_DEBUG = os.environ.get("EMOTION_DEBUG")  # set to any value to enable debug prints

EMOTION_LABELS = [
    "Very sad",
    "Sad",
    "Neutral",
    "Happy",
    "Very Happy"
]

def _fallback_polarity_to_emotion(polarity: float) -> str:
    """Map TextBlob polarity (-1..1) to one of the discrete emotion labels."""
    # Define thresholds (tunable) - made more sensitive to negative emotions
    if polarity <= -0.4:  # Lowered from -0.6 to catch more negative emotions
        return "Very sad"
    if polarity <= -0.1:  # Lowered from -0.2
        return "Sad"
    if polarity < 0.15:   # Narrowed neutral range
        return "Neutral"
    if polarity < 0.5:    # Lowered from 0.6
        return "Happy"
    return "Very Happy"

def analyze_sentiment(text: str) -> float:
    """Return continuous polarity score (-1..1). Retained for compatibility.
    
    Also checks for critical keywords related to mental health crises.
    """
    try:
        # Check for critical mental health keywords first
        text_lower = text.lower()
        critical_keywords = [
            'suicide', 'kill myself', 'end my life', 'want to die', 
            'self harm', 'self-harm', 'cut myself', 'no point living',
            'better off dead', 'hopeless', 'can\'t go on'
        ]
        if any(keyword in text_lower for keyword in critical_keywords):
            return -1.0  # Force maximum negative polarity
        
        blob = TextBlob(text)
        return blob.sentiment.polarity
    except Exception:
        return 0.0

def analyze_emotion(text: str) -> str:
    """Classify a journal entry into one of five emotion categories using Gemini + robust context rules."""

    # If Gemini not available, fallback to polarity
    if not GEMINI_API_KEY or genai is None:
        polarity = analyze_sentiment(text)
        return _fallback_polarity_to_emotion(polarity)

    text_trimmed = text.strip()[:4000]
    text_lower = text_trimmed.lower()

    # --- SAFETY OVERRIDES for crisis detection ---
    crisis_keywords = [
        'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
        'self-harm', 'no point living', 'better off dead', 'hopeless', 'can’t go on'
    ]
    if any(k in text_lower for k in crisis_keywords):
        return "Very sad"

    # --- PROMPT (universal & context-aware) ---
    prompt = (
        "You are an expert emotion classifier for personal mental health journals.\n"
        "Read the text carefully and determine the *dominant emotional tone*.\n\n"
        "Return exactly one of: Very sad, Sad, Neutral, Happy, Very Happy.\n\n"
        "Definitions:\n"
        "- Very sad: Deep despair, loneliness, rejection, hopelessness, grief, crying, self-hate, suicidal ideas.\n"
        "- Sad: Unhappiness, worry, rejection, anxiety, stress, disappointment, boredom, or mild self-doubt.\n"
        "- Neutral: Factual or balanced statements with little emotion.\n"
        "- Happy: Calm satisfaction, gratitude, love, optimism, peace.\n"
        "- Very Happy: Joy, celebration, pride, excitement, euphoria.\n\n"
        "Important rules:\n"
        "- Give higher weight to *emotional meaning* (feeling unloved, unwanted, ignored) even if not explicitly stated.\n"
        "- If the tone expresses loneliness, rejection, or not being wanted → classify as Sad or Very sad.\n"
        "- If the text mixes positive and negative cues, choose the stronger or more emotionally charged side.\n"
        "- Never assume happiness just because desire or attraction words appear (e.g. 'want', 'love', 'girlfriend').\n"
        "- If sarcasm or masking is present ('I'm fine' but context is pain), infer the true feeling.\n\n"
        "Examples:\n"
        "1. 'No one wants me.' → Very sad\n"
        "2. 'I want a girlfriend but she ignores me.' → Sad\n"
        "3. 'I'm tired but surviving.' → Sad\n"
        "4. 'Had lunch with friends, good vibes.' → Happy\n"
        "5. 'Life is meaningless.' → Very sad\n"
        "6. 'Just studying as usual.' → Neutral\n"
        "7. 'Got promoted today!' → Very Happy\n\n"
        f"Journal entry:\n{text_trimmed}"
    )

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        chosen_model = GEMINI_MODEL
        try:
            model = genai.GenerativeModel(chosen_model)
        except Exception:
            # Fallback if preview model not available
            chosen_model = "gemini-pro"
            model = genai.GenerativeModel(chosen_model)
        if EMOTION_DEBUG:
            print(f"[emotion] Using Gemini model: {chosen_model}")
        response = model.generate_content(prompt)
        if not response or not response.text:
            raise ValueError("Empty Gemini response")

        raw = response.text.strip()
        # Normalize output
        for label in EMOTION_LABELS:
            if raw.lower().startswith(label.lower()):
                emotion = label
                break
        else:
            emotion = _fallback_polarity_to_emotion(analyze_sentiment(text_trimmed))

        # --- HEURISTIC CORRECTION LAYER ---
        negative_patterns = [
            "no one wants me", "unwanted", "ignored", "alone", "lonely",
            "rejected", "hate myself", "worthless", "nobody", "cry", "empty"
        ]
        if any(p in text_lower for p in negative_patterns):
            if emotion in ("Neutral", "Happy", "Very Happy"):
                # escalate sadness level
                emotion = "Sad" if "alone" in text_lower else "Very sad"

        return emotion

    except Exception:
        polarity = analyze_sentiment(text_trimmed)
        return _fallback_polarity_to_emotion(polarity)

