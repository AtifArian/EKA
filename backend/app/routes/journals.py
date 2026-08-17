from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Journal, JournalHeart, JournalComment
from app.utils.sentiment_analysis import analyze_sentiment, analyze_emotion
from sqlalchemy.orm import joinedload

journals_bp = Blueprint('journals', __name__)

@journals_bp.route('/', methods=['GET'])
@journals_bp.route('', methods=['GET'])
def get_journals():
    search = request.args.get('search', '')
    sort_by = request.args.get('sort', 'recent')
    
    query = Journal.query.filter_by(is_public=True)
    
    if search:
        query = query.filter(
            (Journal.title.ilike(f'%{search}%')) |
            (Journal.content.ilike(f'%{search}%'))
        )
    
    journals = query.options(joinedload(Journal.author)).all()
    
    if sort_by == 'hearts':
        journals = sorted(journals, key=lambda j: j.heart_count(), reverse=True)
    else:
        journals = sorted(journals, key=lambda j: j.created_at, reverse=True)
    
    return jsonify([journal.to_dict() for journal in journals]), 200

@journals_bp.route('/top', methods=['GET'])
def get_top_journals():
    """Get journals with most hearts for slideshow"""
    journals = Journal.query.filter_by(is_public=True).options(joinedload(Journal.author)).all()
    top_journals = sorted(journals, key=lambda j: j.heart_count(), reverse=True)[:10]
    
    return jsonify([journal.to_dict() for journal in top_journals]), 200

@journals_bp.route('/<int:journal_id>', methods=['GET'])
@jwt_required(optional=True)
def get_journal(journal_id):
    journal = Journal.query.get(journal_id)
    if not journal:
        return jsonify({'error': 'Journal not found'}), 404
    
    # Allow access if journal is public OR user is the owner
    current_user_id = get_jwt_identity()
    is_owner = current_user_id and int(current_user_id) == journal.user_id
    
    if not journal.is_public and not is_owner:
        return jsonify({'error': 'Journal is private'}), 403
    
    comments = JournalComment.query.filter_by(journal_id=journal_id).order_by(
        JournalComment.created_at.desc()
    ).all()
    
    data = journal.to_dict()
    data['comments'] = [comment.to_dict() for comment in comments]
    data['is_owner'] = is_owner  # Let frontend know if current user owns this
    
    return jsonify(data), 200

@journals_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_journals():
    current_user_id = int(get_jwt_identity())
    
    journals = Journal.query.filter_by(user_id=current_user_id).options(joinedload(Journal.author)).order_by(
        Journal.created_at.desc()
    ).all()
    
    return jsonify([journal.to_dict() for journal in journals]), 200

@journals_bp.route('/', methods=['POST'])
@journals_bp.route('', methods=['POST'])
@jwt_required()
def create_journal():
    current_user_id = int(get_jwt_identity())

    # Support both JSON and form submissions
    data = request.get_json(silent=True) or {}
    title = data.get('title') or request.form.get('title')
    content = data.get('content') or request.form.get('content')
    is_public_raw = data.get('is_public', request.form.get('is_public', False))

    # Normalize is_public from various types
    if isinstance(is_public_raw, str):
        is_public = is_public_raw.strip().lower() in ['true', '1', 'yes', 'y']
    else:
        is_public = bool(is_public_raw)

    if not title or not content:
        return jsonify({'error': 'title and content are required'}), 400

    try:
        sentiment_score = analyze_sentiment(content)
    except Exception:
        sentiment_score = 0.0

    try:
        emotion = analyze_emotion(content)
    except Exception:
        emotion = None

    journal = Journal(
        user_id=current_user_id,
        title=title,
        content=content,
        is_public=is_public,
        sentiment_score=sentiment_score,
        emotion=emotion
    )

    db.session.add(journal)
    db.session.commit()

    return jsonify(journal.to_dict()), 201

@journals_bp.route('/<int:journal_id>', methods=['PUT'])
@jwt_required()
def update_journal(journal_id):
    current_user_id = int(get_jwt_identity())
    journal = Journal.query.get(journal_id)
    
    if not journal or journal.user_id != current_user_id:
        return jsonify({'error': 'Journal not found'}), 404
    
    data = request.get_json(silent=True) or {}
    
    if 'title' in data and data['title']:
        journal.title = data['title']
    if 'content' in data and data['content']:
        journal.content = data['content']
        try:
            journal.sentiment_score = analyze_sentiment(data['content'])
        except Exception:
            journal.sentiment_score = 0.0
        try:
            journal.emotion = analyze_emotion(data['content'])
        except Exception:
            journal.emotion = journal.emotion  # keep previous
    if 'is_public' in data:
        raw_public = data['is_public']
        if isinstance(raw_public, str):
            journal.is_public = raw_public.strip().lower() in ['true','1','yes','y']
        else:
            journal.is_public = bool(raw_public)
    
    db.session.commit()
    
    return jsonify(journal.to_dict()), 200

@journals_bp.route('/<int:journal_id>', methods=['DELETE'])
@jwt_required()
def delete_journal(journal_id):
    current_user_id = int(get_jwt_identity())
    journal = Journal.query.get(journal_id)
    
    if not journal or journal.user_id != current_user_id:
        return jsonify({'error': 'Journal not found'}), 404
    
    db.session.delete(journal)
    db.session.commit()
    
    return jsonify({'message': 'Journal deleted'}), 200

@journals_bp.route('/<int:journal_id>/heart', methods=['POST'])
@jwt_required()
def heart_journal(journal_id):
    current_user_id = int(get_jwt_identity())
    
    journal = Journal.query.get(journal_id)
    if not journal:
        return jsonify({'error': 'Journal not found'}), 404
    
    # Only allow liking public journals or own journals
    is_owner = current_user_id == journal.user_id
    if not journal.is_public and not is_owner:
        return jsonify({'error': 'Cannot like a private journal'}), 403
    
    existing = JournalHeart.query.filter_by(
        user_id=current_user_id,
        journal_id=journal_id
    ).first()
    
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'message': 'Journal unhearted', 'hearted': False}), 200
    
    heart = JournalHeart(
        user_id=current_user_id,
        journal_id=journal_id
    )
    
    db.session.add(heart)
    db.session.commit()
    
    return jsonify({'message': 'Journal hearted', 'hearted': True}), 201

@journals_bp.route('/<int:journal_id>/comments', methods=['POST'])
@jwt_required()
def add_journal_comment(journal_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    
    journal = Journal.query.get(journal_id)
    if not journal:
        return jsonify({'error': 'Journal not found'}), 404
    
    # Only allow commenting on public journals or own journals
    is_owner = current_user_id == journal.user_id
    if not journal.is_public and not is_owner:
        return jsonify({'error': 'Cannot comment on a private journal'}), 403
    
    if not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
    
    comment = JournalComment(
        user_id=current_user_id,
        journal_id=journal_id,
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

@journals_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_journals(user_id):
    """Get public journals of a specific user"""
    journals = Journal.query.filter_by(
        user_id=user_id,
        is_public=True
    ).options(joinedload(Journal.author)).order_by(Journal.created_at.desc()).all()
    
    return jsonify([journal.to_dict() for journal in journals]), 200
