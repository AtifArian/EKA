import numpy as np
from datetime import datetime, timedelta
from app.models import MoodEntry, ArticleLike, Journal, Article

def predict_suicide_risk(user_id):
    """
    Predict suicide risk based on:
    - Mood tracker data (35% weight)
    - Articles liked (25% weight)
    - Journal sentiment scores (40% weight) - increased because journals reflect direct expression
    
    Returns a risk score from 0 (low) to 100 (high)
    """
    risk_score = 0
    
    # 1. Analyze mood tracker
    mood_score = analyze_mood_trend(user_id)
    risk_score += mood_score * 0.20
    
    # 2. Analyze article likes
    article_score = analyze_article_preferences(user_id)
    risk_score += article_score * 0.15
    
    # 3. Analyze journal sentiments (most important - direct expression)
    journal_score = analyze_journal_sentiments(user_id)
    risk_score += journal_score * 0.65
    
    return min(100, max(0, risk_score))

def analyze_mood_trend(user_id):
    """Analyze mood entries over last 30 days"""
    thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)
    moods = MoodEntry.query.filter(
        MoodEntry.user_id == user_id,
        MoodEntry.date >= thirty_days_ago
    ).order_by(MoodEntry.date.desc()).all()
    
    if not moods:
        return 10  # Reduced default - no data shouldn't be high risk
    
    avg_mood = sum(m.mood_level for m in moods) / len(moods)
    
    # Count very low moods (1 or 2 out of 5)
    very_low_count = sum(1 for m in moods if m.mood_level <= 2)
    low_mood_penalty = min(25, very_low_count * 5)
    
    recent_moods = [m.mood_level for m in moods[:7]]
    older_moods = [m.mood_level for m in moods[7:14]] if len(moods) > 7 else []
    
    trend_score = 0
    if older_moods:
        recent_avg = sum(recent_moods) / len(recent_moods)
        older_avg = sum(older_moods) / len(older_moods)
        if recent_avg < older_avg - 0.5:  # Significant decline
            trend_score = 20
    
    # Base risk from average mood (mood 1 = 80 risk, mood 5 = 0 risk)
    base_risk = (5 - avg_mood) / 4 * 60
    mood_risk = base_risk + trend_score + low_mood_penalty
    
    return min(100, mood_risk)

def analyze_article_preferences(user_id):
    """Analyze mood categories of liked articles"""
    liked_articles = ArticleLike.query.filter_by(user_id=user_id).all()
    
    if not liked_articles:
        return 10  # Reduced default
    
    sad_anxious_count = 0
    total_count = len(liked_articles)
    
    for like in liked_articles:
        article = Article.query.get(like.article_id)
        if article and article.mood_category in ['sad', 'anxious', 'stressed']:
            sad_anxious_count += 1
    
    ratio = sad_anxious_count / total_count if total_count > 0 else 0
    return ratio * 100

def analyze_journal_sentiments(user_id):
    """
    Analyze sentiment scores with magnitude-based weighting.
    Uses abs(score) so -1.0 (worst) weighs much more than -0.5.
    Multiple negative journals compound risk significantly.
    """
    journals = Journal.query.filter_by(user_id=user_id).order_by(
        Journal.created_at.desc()
    ).limit(15).all()

    if not journals:
        return 10

    sentiments = [j.sentiment_score for j in journals if j.sentiment_score is not None]
    if not sentiments:
        return 10

    # Filter only negative sentiments
    negative_sentiments = [s for s in sentiments if s < 0]

    if not negative_sentiments:
        return 10  # Low risk if journals are neutral/positive

    # 1. Base Risk (Starting point for having ANY negative journals)
    risk_score = 15

    # 2. Magnitude Calculation
    # Each negative journal adds risk proportional to severity
    # A score of -1.0 adds 18 points. A score of -0.5 adds 9 points.
    for score in negative_sentiments:
        magnitude = abs(score)
        risk_score += (magnitude * 18)

    # 3. Recency Impact (Heavily weighted for the most recent entry)
    # If the most recent journal is negative, add extra risk proportional to severity
    latest_sentiment = sentiments[0]
    if latest_sentiment < 0:
        risk_score += (abs(latest_sentiment) * 25)

    # 4. Consistency Penalty
    # If more than 50% of recent journals are negative
    if len(negative_sentiments) > len(sentiments) / 2:
        risk_score += 10

    return min(100, risk_score)


