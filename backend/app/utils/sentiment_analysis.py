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
            'suicid', 'kill myself', 'end my life', 'want to die', 
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
    """Classify a journal entry into one of five emotion categories using Gemini + robust context rules.

    Notes:
    - Uses temperature=0 for deterministic classification
    - Applies crisis/negative-pattern overrides to avoid false Neutral/Happy for clearly distressed text
    - Falls back to TextBlob polarity when LLM is unavailable or returns an unexpected output
    """

    # If Gemini not available, fallback to polarity
    if not GEMINI_API_KEY or genai is None:
        polarity = analyze_sentiment(text)
        return _fallback_polarity_to_emotion(polarity)

    text_trimmed = text.strip()[:4000]
    text_lower = text_trimmed.lower()

    # --- SAFETY OVERRIDES for crisis detection ---
    crisis_keywords = [
        'suicid', 'kill myself', 'end my life', 'want to die', 'self harm',
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
        # Prefer deterministic output for classification tasks
        generation_config = {"temperature": 0}
        try:
            # If types are available, use the typed config (future-proof)
            from google.generativeai.types import GenerationConfig  # type: ignore
            generation_config = GenerationConfig(temperature=0)
        except Exception:
            pass

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt, generation_config=generation_config)
        if not response or not response.text:
            raise ValueError("Empty Gemini response")

        raw = response.text.strip()

        # Helper to extract the best matching label from arbitrary text
        def _extract_label(candidate: str) -> str | None:
            c = candidate.lower().strip()
            # quick exact/startswith checks
            for label in EMOTION_LABELS:
                if c == label.lower() or c.startswith(label.lower()):
                    return label
            # remove common punctuation and spaces for fuzzy contains
            import re
            c_norm = re.sub(r"[^a-z]+", "", c)
            label_map = {label: re.sub(r"[^a-z]+", "", label.lower()) for label in EMOTION_LABELS}
            for label, lnorm in label_map.items():
                if lnorm in c_norm:
                    return label
            return None

        emotion = _extract_label(raw) or _fallback_polarity_to_emotion(analyze_sentiment(text_trimmed))

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

