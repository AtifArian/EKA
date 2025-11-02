import numpy as np
from datetime import datetime, timedelta
from app.models import MoodEntry, ArticleLike, Journal, Article

def predict_suicide_risk(user_id):
    """
    Predict suicide risk based on:
    - Mood tracker data (40% weight)
    - Articles liked (30% weight)
    - Journal sentiment scores (30% weight)
    
    Returns a risk score from 0 (low) to 100 (high)
    """
    risk_score = 0
    
    # 1. Analyze mood tracker
    mood_score = analyze_mood_trend(user_id)
    risk_score += mood_score * 0.4
    
    # 2. Analyze article likes
    article_score = analyze_article_preferences(user_id)
    risk_score += article_score * 0.3
    
    # 3. Analyze journal sentiments
    journal_score = analyze_journal_sentiments(user_id)
    risk_score += journal_score * 0.3
    
    return min(100, max(0, risk_score))

def analyze_mood_trend(user_id):
    """Analyze mood entries over last 30 days"""
    thirty_days_ago = datetime.utcnow().date() - timedelta(days=30)
    moods = MoodEntry.query.filter(
        MoodEntry.user_id == user_id,
        MoodEntry.date >= thirty_days_ago
    ).order_by(MoodEntry.date.desc()).all()
    
    if not moods:
        return 50
    
    avg_mood = sum(m.mood_level for m in moods) / len(moods)
    
    recent_moods = [m.mood_level for m in moods[:7]]
    older_moods = [m.mood_level for m in moods[7:14] if len(moods) > 7]
    
    trend_score = 0
    if older_moods:
        recent_avg = sum(recent_moods) / len(recent_moods)
        older_avg = sum(older_moods) / len(older_moods)
        if recent_avg < older_avg:
            trend_score = 20
    
    mood_risk = (5 - avg_mood) / 4 * 80 + trend_score
    return mood_risk

def analyze_article_preferences(user_id):
    """Analyze mood categories of liked articles"""
    liked_articles = ArticleLike.query.filter_by(user_id=user_id).all()
    
    if not liked_articles:
        return 50
    
    sad_anxious_count = 0
    total_count = len(liked_articles)
    
    for like in liked_articles:
        article = Article.query.get(like.article_id)
        if article and article.mood_category in ['sad', 'anxious', 'stressed']:
            sad_anxious_count += 1
    
    ratio = sad_anxious_count / total_count if total_count > 0 else 0
    return ratio * 100

def analyze_journal_sentiments(user_id):
    """Analyze sentiment scores of journals"""
    journals = Journal.query.filter_by(user_id=user_id).order_by(
        Journal.created_at.desc()
    ).limit(10).all()
    
    if not journals:
        return 50
    
    sentiments = [j.sentiment_score for j in journals if j.sentiment_score is not None]
    
    if not sentiments:
        return 50
    
    avg_sentiment = sum(sentiments) / len(sentiments)
    risk = (1 - (avg_sentiment + 1) / 2) * 100
    
    return risk
