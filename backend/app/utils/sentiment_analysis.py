from textblob import TextBlob

def analyze_sentiment(text):
    """
    Analyze sentiment of text
    Returns a score between -1 (negative) and 1 (positive)
    """
    try:
        blob = TextBlob(text)
        return blob.sentiment.polarity
    except:
        return 0.0
