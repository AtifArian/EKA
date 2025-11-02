from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Journal, JournalHeart, JournalComment
from app.utils.sentiment_analysis import analyze_sentiment

journals_bp = Blueprint('journals', __name__)

@journals_bp.route('/', methods=['GET'])
def get_journals():
    search = request.args.get('search', '')
    sort_by = request.args.get('sort', 'recent')
    
    query = Journal.query.filter_by(is_public=True)
    
    if search:
        query = query.filter(
            (Journal.title.ilike(f'%{search}%')) |
            (Journal.content.ilike(f'%{search}%'))
        )
    
    journals = query.all()
    
    if sort_by == 'hearts':
        journals = sorted(journals, key=lambda j: j.heart_count(), reverse=True)
    else:
        journals = sorted(journals, key=lambda j: j.created_at, reverse=True)
    
    return jsonify([journal.to_dict() for journal in journals]), 200

@journals_bp.route('/top', methods=['GET'])
def get_top_journals():
    """Get journals with most hearts for slideshow"""
    journals = Journal.query.filter_by(is_public=True).all()
    top_journals = sorted(journals, key=lambda j: j.heart_count(), reverse=True)[:10]
    
    return jsonify([journal.to_dict() for journal in top_journals]), 200

@journals_bp.route('/<int:journal_id>', methods=['GET'])
def get_journal(journal_id):
    journal = Journal.query.get(journal_id)
    if not journal:
        return jsonify({'error': 'Journal not found'}), 404
    
    if not journal.is_public:
        return jsonify({'error': 'Journal is private'}), 403
    
    comments = JournalComment.query.filter_by(journal_id=journal_id).order_by(
        JournalComment.created_at.desc()
    ).all()
    
    data = journal.to_dict()
    data['comments'] = [comment.to_dict() for comment in comments]
    
    return jsonify(data), 200

@journals_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_journals():
    current_user_id = int(get_jwt_identity())
    
    journals = Journal.query.filter_by(user_id=current_user_id).order_by(
        Journal.created_at.desc()
    ).all()
    
    return jsonify([journal.to_dict() for journal in journals]), 200

@journals_bp.route('/', methods=['POST'])
@jwt_required()
def create_journal():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    sentiment_score = analyze_sentiment(data['content'])
    
    journal = Journal(
    user_id=current_user_id,
        title=data['title'],
        content=data['content'],
        is_public=data.get('is_public', False),
        sentiment_score=sentiment_score
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
    
    data = request.get_json()
    
    if 'title' in data:
        journal.title = data['title']
    if 'content' in data:
        journal.content = data['content']
        journal.sentiment_score = analyze_sentiment(data['content'])
    if 'is_public' in data:
        journal.is_public = data['is_public']
    
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
    
    existing = JournalHeart.query.filter_by(
        user_id=current_user_id,
        journal_id=journal_id
    ).first()
    
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'message': 'Journal unhearted'}), 200
    
    heart = JournalHeart(
        user_id=current_user_id,
        journal_id=journal_id
    )
    
    db.session.add(heart)
    db.session.commit()
    
    return jsonify({'message': 'Journal hearted'}), 201

@journals_bp.route('/<int:journal_id>/comments', methods=['POST'])
@jwt_required()
def add_journal_comment(journal_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    journal = Journal.query.get(journal_id)
    if not journal:
        return jsonify({'error': 'Journal not found'}), 404
    
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
    ).order_by(Journal.created_at.desc()).all()
    
    return jsonify([journal.to_dict() for journal in journals]), 200
