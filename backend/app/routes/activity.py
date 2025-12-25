from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from app.models import db, User, MoodEntry, Journal, ArticleLike, ArticleRead, ArticleComment, Doctor
from collections import defaultdict

activity_bp = Blueprint('activity', __name__)

def group_by_date(items, date_field='created_at'):
    """Group items by date for charting"""
    grouped = defaultdict(int)
    for item in items:
        date = getattr(item, date_field)
        if isinstance(date, datetime):
            date_key = date.date().isoformat()
        else:
            date_key = date.isoformat() if date else None
        if date_key:
            grouped[date_key] += 1
    return dict(grouped)

@activity_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_activity():
    """Get comprehensive activity data for current user"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time_period from query params (default: 30 days)
        time_period = request.args.get('time_period', '30')
        
        # Calculate date range based on time_period
        end_date = datetime.utcnow()
        start_date = None
        period_type = 'days'
        
        if time_period == 'all':
            # All time - get user's registration date or earliest activity
            start_date = user.created_at if hasattr(user, 'created_at') else datetime(2020, 1, 1)
            period_type = 'all'
        elif time_period in ['2024', '2025', '2026', '2027']:
            # Specific year
            year = int(time_period)
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 12, 31, 23, 59, 59)
            period_type = 'year'
        else:
            # Days (7, 15, 30, etc.)
            days = int(time_period)
            start_date = end_date - timedelta(days=days)
            period_type = 'days'
        
        # Mood check-ins over time
        mood_query = MoodEntry.query.filter(MoodEntry.user_id == current_user_id)
        if start_date:
            mood_query = mood_query.filter(MoodEntry.created_at >= start_date)
        if period_type != 'all':
            mood_query = mood_query.filter(MoodEntry.created_at <= end_date)
        mood_entries = mood_query.order_by(MoodEntry.created_at).all()
        
        mood_timeline = []
        for mood in mood_entries:
            # For year views, use short month + year (e.g., "Jan 2024")
            # For all time, use short month + year (e.g., "Jan 2024")
            if period_type == 'year':
                month_label = mood.created_at.strftime('%b %Y')  # Short month + year: Jan 2024, Feb 2025, etc.
            elif period_type == 'all':
                month_label = mood.created_at.strftime('%b %Y')  # Short month + year: Jan 2024, Feb 2025, etc.
            else:
                month_label = None
            
            year_month = mood.created_at.strftime('%Y-%m') if period_type in ['year', 'all'] else None
            
            mood_timeline.append({
                'date': mood.date.isoformat() if mood.date else mood.created_at.date().isoformat(),
                'mood_level': mood.mood_level,
                'energy_level': mood.energy_level,
                'stress_level': mood.stress_level,
                'created_at': mood.created_at.isoformat(),
                'month': month_label,
                'year_month': year_month
            })
        
        # Journal entries over time
        journals_query = Journal.query.filter(Journal.user_id == current_user_id)
        if start_date:
            journals_query = journals_query.filter(Journal.created_at >= start_date)
        if period_type != 'all':
            journals_query = journals_query.filter(Journal.created_at <= end_date)
        journals = journals_query.order_by(Journal.created_at).all()
        
        journal_timeline = group_by_date(journals)
        journal_list = [{'id': j.id, 'title': j.title, 'created_at': j.created_at.isoformat(),
                         'sentiment_score': j.sentiment_score, 'emotion': j.emotion} for j in journals]
        
        # Articles read
        articles_read_query = ArticleRead.query.filter(ArticleRead.user_id == current_user_id)
        if start_date:
            articles_read_query = articles_read_query.filter(ArticleRead.created_at >= start_date)
        if period_type != 'all':
            articles_read_query = articles_read_query.filter(ArticleRead.created_at <= end_date)
        articles_read = articles_read_query.order_by(ArticleRead.created_at).all()
        
        articles_read_timeline = group_by_date(articles_read)
        articles_read_list = [ar.to_dict() for ar in articles_read]
        
        # Articles liked
        articles_liked_query = ArticleLike.query.filter(ArticleLike.user_id == current_user_id)
        if start_date:
            articles_liked_query = articles_liked_query.filter(ArticleLike.created_at >= start_date)
        if period_type != 'all':
            articles_liked_query = articles_liked_query.filter(ArticleLike.created_at <= end_date)
        articles_liked = articles_liked_query.order_by(ArticleLike.created_at).all()
        
        articles_liked_timeline = group_by_date(articles_liked)
        articles_liked_list = [{'id': al.id, 'article_id': al.article_id, 
                                'article_title': al.article.title if al.article else None,
                                'created_at': al.created_at.isoformat()} for al in articles_liked]
        
        # Article comments
        article_comments_query = ArticleComment.query.filter(ArticleComment.user_id == current_user_id)
        if start_date:
            article_comments_query = article_comments_query.filter(ArticleComment.created_at >= start_date)
        if period_type != 'all':
            article_comments_query = article_comments_query.filter(ArticleComment.created_at <= end_date)
        article_comments = article_comments_query.order_by(ArticleComment.created_at).all()
        
        article_comments_timeline = group_by_date(article_comments)
        article_comments_list = [{'id': ac.id, 'article_id': ac.article_id, 
                                  'article_title': ac.article.title if ac.article else None,
                                  'content': ac.content, 'created_at': ac.created_at.isoformat()} 
                                 for ac in article_comments]
        
        # Summary statistics
        summary = {
            'total_mood_entries': len(mood_entries),
            'total_journals': len(journals),
            'total_articles_read': len(articles_read),
            'total_articles_liked': len(articles_liked),
            'total_article_comments': len(article_comments),
            'avg_mood_level': sum(m.mood_level for m in mood_entries) / len(mood_entries) if mood_entries else 0
        }
        
        return jsonify({
            'summary': summary,
            'mood_timeline': mood_timeline,
            'journal_timeline': journal_timeline,
            'journal_list': journal_list,
            'articles_read_timeline': articles_read_timeline,
            'articles_read_list': articles_read_list,
            'articles_liked_timeline': articles_liked_timeline,
            'articles_liked_list': articles_liked_list,
            'article_comments_timeline': article_comments_timeline,
            'article_comments_list': article_comments_list,
            'date_range': {
                'start': start_date.date().isoformat() if start_date else None,
                'end': end_date.date().isoformat()
            },
            'period_type': period_type,
            'time_period': time_period
        }), 200
        
    except Exception as e:
        print(f"ERROR in get_my_activity: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@activity_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_activity(patient_id):
    """Get activity data for a specific patient - doctors only"""
    try:
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.is_doctor:
            return jsonify({'error': 'Only doctors can access patient activity'}), 403
        
        # Get doctor profile
        doctor = Doctor.query.filter_by(user_id=current_user_id).first()
        if not doctor:
            return jsonify({'error': 'Doctor profile not found'}), 404
        
        # Check if patient is under this doctor's care
        patient = User.query.get(patient_id)
        if not patient or patient not in doctor.patients:
            return jsonify({'error': 'Patient not found or not under your care'}), 404
        
        # Get date range (last 60 days for doctor view)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=60)
        
        # Mood check-ins over time
        mood_entries = MoodEntry.query.filter(
            MoodEntry.user_id == patient_id,
            MoodEntry.created_at >= start_date
        ).order_by(MoodEntry.created_at).all()
        
        mood_timeline = []
        for mood in mood_entries:
            mood_timeline.append({
                'date': mood.date.isoformat() if mood.date else mood.created_at.date().isoformat(),
                'mood_level': mood.mood_level,
                'energy_level': mood.energy_level,
                'stress_level': mood.stress_level,
                'notes': mood.notes,
                'created_at': mood.created_at.isoformat()
            })
        
        # Journal entries over time
        journals = Journal.query.filter(
            Journal.user_id == patient_id,
            Journal.created_at >= start_date
        ).order_by(Journal.created_at).all()
        
        journal_timeline = group_by_date(journals)
        journal_list = [{'id': j.id, 'title': j.title, 'content': j.content,
                         'created_at': j.created_at.isoformat(),
                         'sentiment_score': j.sentiment_score, 'emotion': j.emotion} for j in journals]
        
        # Articles read
        articles_read = ArticleRead.query.filter(
            ArticleRead.user_id == patient_id,
            ArticleRead.created_at >= start_date
        ).order_by(ArticleRead.created_at).all()
        
        articles_read_timeline = group_by_date(articles_read)
        articles_read_list = [ar.to_dict() for ar in articles_read]
        
        # Articles liked
        articles_liked = ArticleLike.query.filter(
            ArticleLike.user_id == patient_id,
            ArticleLike.created_at >= start_date
        ).order_by(ArticleLike.created_at).all()
        
        articles_liked_timeline = group_by_date(articles_liked)
        articles_liked_list = [{'id': al.id, 'article_id': al.article_id, 
                                'article_title': al.article.title if al.article else None,
                                'created_at': al.created_at.isoformat()} for al in articles_liked]
        
        # Article comments
        article_comments = ArticleComment.query.filter(
            ArticleComment.user_id == patient_id,
            ArticleComment.created_at >= start_date
        ).order_by(ArticleComment.created_at).all()
        
        article_comments_timeline = group_by_date(article_comments)
        article_comments_list = [{'id': ac.id, 'article_id': ac.article_id, 
                                  'article_title': ac.article.title if ac.article else None,
                                  'content': ac.content, 'created_at': ac.created_at.isoformat()} 
                                 for ac in article_comments]
        
        # Summary statistics
        summary = {
            'total_mood_entries': len(mood_entries),
            'total_journals': len(journals),
            'total_articles_read': len(articles_read),
            'total_articles_liked': len(articles_liked),
            'total_article_comments': len(article_comments),
            'avg_mood_level': sum(m.mood_level for m in mood_entries) / len(mood_entries) if mood_entries else 0
        }
        
        return jsonify({
            'patient': patient.to_dict(),
            'summary': summary,
            'mood_timeline': mood_timeline,
            'journal_timeline': journal_timeline,
            'journal_list': journal_list,
            'articles_read_timeline': articles_read_timeline,
            'articles_read_list': articles_read_list,
            'articles_liked_timeline': articles_liked_timeline,
            'articles_liked_list': articles_liked_list,
            'article_comments_timeline': article_comments_timeline,
            'article_comments_list': article_comments_list,
            'date_range': {
                'start': start_date.date().isoformat(),
                'end': end_date.date().isoformat()
            }
        }), 200
        
    except Exception as e:
        print(f"ERROR in get_patient_activity: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@activity_bp.route('/track-article-read/<int:article_id>', methods=['POST'])
@jwt_required()
def track_article_read(article_id):
    """Track when a user reads an article"""
    try:
        current_user_id = int(get_jwt_identity())
        
        # Check if already tracked today
        today = datetime.utcnow().date()
        existing = ArticleRead.query.filter(
            ArticleRead.user_id == current_user_id,
            ArticleRead.article_id == article_id,
            func.date(ArticleRead.created_at) == today
        ).first()
        
        if existing:
            return jsonify({'message': 'Already tracked today'}), 200
        
        # Create new read record
        article_read = ArticleRead(
            user_id=current_user_id,
            article_id=article_id
        )
        db.session.add(article_read)
        db.session.commit()
        
        return jsonify({'message': 'Article read tracked', 'read': article_read.to_dict()}), 201
        
    except Exception as e:
        print(f"ERROR in track_article_read: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
