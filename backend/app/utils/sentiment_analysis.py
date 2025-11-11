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
        # prompt = (
        #     "You are analyzing a mental health journal entry. Classify the emotional state into exactly one of these categories:\n\n"
        #     "- Very sad: Severe distress, depression, suicidal thoughts, hopelessness, extreme sadness, self-harm ideation, crisis\n"
        #     "- Sad: Feeling down, unhappy, anxious, worried, stressed, lonely, disappointed\n"
        #     "- Neutral: Calm, mundane daily activities, factual observations, neither positive nor negative\n"
        #     "- Happy: Feeling good, content, positive experiences, grateful, optimistic\n"
        #     "- Very Happy: Extremely joyful, excited, euphoric, celebrating, very grateful\n\n"
        #     "IMPORTANT: If the entry mentions suicidal thoughts, self-harm, extreme hopelessness, or severe depression, it MUST be classified as 'Very sad'.\n\n"
        #     "Return ONLY one of these exact labels: Very sad, Sad, Neutral, Happy, Very Happy\n\n"
        #     "Journal entry:\n" + text[:4000]
        # )
        prompt = (
                "You are an expert emotion analysis model specializing in interpreting human mental health journal entries. "
                "Your task is to classify the **dominant emotional tone** of the journal into one of exactly five discrete categories:\n\n"
                "1. Very sad — severe emotional distress, hopelessness, loneliness, crying, grief, heartbreak, despair, self-hate, or suicidal ideation.\n"
                "2. Sad — mild to moderate sadness, disappointment, anxiety, fear, worry, rejection, feeling unwanted, low energy, or general unhappiness.\n"
                "3. Neutral — emotionally balanced, descriptive, factual, reflective, routine, or analytical writing with no strong emotion.\n"
                "4. Happy — contentment, peace, gratitude, satisfaction, optimism, affection, motivation, or positive reflection.\n"
                "5. Very Happy — excitement, joy, pride, enthusiasm, celebration, euphoria, strong love, or achievement.\n\n"
                "Guidelines for interpretation:\n"
                "- Always base your decision on the **overall emotional tone**, not isolated words.\n"
                "- If both positive and negative emotions appear, choose the one that is **more dominant or intense**.\n"
                "- If sarcasm, irony, or emotional masking is detected (e.g. 'I'm totally fine' but tone suggests pain), infer the true emotional state.\n"
                "- If hopelessness, despair, or suicidal thoughts appear → classify as 'Very sad'.\n"
                "- If both emotional highs and lows appear, prioritize the **emotion driving the reflection**.\n"
                "- Do NOT invent new labels; respond with exactly one of: Very sad, Sad, Neutral, Happy, Very Happy.\n"
                "- Be consistent and humanly empathetic in interpretation.\n\n"
                "Examples:\n"
                "A. 'I failed again. Maybe I’m just not good enough.' → Very sad\n"
                "B. 'Feeling tired but getting through the day.' → Sad\n"
                "C. 'Did some cleaning and watched TV.' → Neutral\n"
                "D. 'Had lunch with a friend, feeling grateful.' → Happy\n"
                "E. 'Got accepted into my dream job!!!' → Very Happy\n"
                "F. 'I laughed a lot today but deep down I feel empty.' → Sad\n"
                "G. 'Life is pointless. I want to end it all.' → Very sad\n"
                "H. 'Meditated today and felt calm and centered.' → Happy\n"
                "I. 'Finally finished my big project. So proud!' → Very Happy\n\n"
                "Now analyze the following journal entry carefully and output only one label:\n\n"
                f"Journal entry:\n{text[:4000]}"
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
