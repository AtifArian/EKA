from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Article, ArticleLike, ArticleComment, Doctor
from app.utils.decorators import doctor_required
import os

articles_bp = Blueprint('articles', __name__)

@articles_bp.route('/', methods=['GET'])
@articles_bp.route('', methods=['GET'])
def get_articles():
    search = request.args.get('search', '')
    keywords = request.args.get('keywords', '')
    sort_by = request.args.get('sort', 'highest')
    
    query = Article.query
    
    if search:
        query = query.filter(Article.title.ilike(f'%{search}%'))
    
    if keywords:
        keyword_list = [k.strip() for k in keywords.split(',')]
        for keyword in keyword_list:
            query = query.filter(Article.keywords.ilike(f'%{keyword}%'))
    
    articles = query.all()
    
    if sort_by == 'highest':
        articles = sorted(articles, key=lambda a: a.like_count(), reverse=True)
    else:
        articles = sorted(articles, key=lambda a: a.like_count())
    
    return jsonify([article.to_dict() for article in articles]), 200

@articles_bp.route('/<int:article_id>', methods=['GET'])
@jwt_required(optional=True)
def get_article(article_id):
    article = Article.query.get(article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    comments = ArticleComment.query.filter_by(article_id=article_id).order_by(
        ArticleComment.created_at.desc()
    ).all()
    
    data = article.to_dict(include_content=True)
    data['comments'] = [comment.to_dict() for comment in comments]
    
    # Check if current user is the author (doctor who wrote it)
    current_user_id = get_jwt_identity()
    is_author = False
    if current_user_id:
        doctor = Doctor.query.filter_by(user_id=int(current_user_id)).first()
        if doctor and doctor.id == article.doctor_id:
            is_author = True
    
    data['is_author'] = is_author
    
    return jsonify(data), 200

@articles_bp.route('/my', methods=['GET'])
@jwt_required()
@doctor_required
def get_my_articles():
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    articles = Article.query.filter_by(doctor_id=doctor.id).order_by(
        Article.created_at.desc()
    ).all()
    
    return jsonify([article.to_dict(include_content=True) for article in articles]), 200

@articles_bp.route('/', methods=['POST'])
@articles_bp.route('', methods=['POST'])
@jwt_required()
@doctor_required
def create_article():
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    # Support both JSON and form data
    data = request.get_json(silent=True) or {}
    title = data.get('title') or request.form.get('title')
    content = data.get('content') or request.form.get('content')
    mood_category = data.get('mood_category') or request.form.get('mood_category')
    keywords = data.get('keywords') or request.form.get('keywords')
    
    if not title or not content:
        return jsonify({'error': 'title and content are required'}), 400
    
    article = Article(
        doctor_id=doctor.id,
        title=title,
        content=content,
        mood_category=mood_category,
        keywords=keywords
    )
    
    if 'cover_image' in request.files:
        file = request.files['cover_image']
        filename = f"article_{file.filename}"
        filepath = os.path.join('uploads', 'articles', filename)
        file.save(filepath)
        article.cover_image = filepath
    
    db.session.add(article)
    db.session.commit()
    
    return jsonify(article.to_dict(include_content=True)), 201

@articles_bp.route('/<int:article_id>', methods=['PUT'])
@jwt_required()
@doctor_required
def update_article(article_id):
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    article = Article.query.get(article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    # Check if this doctor is the author
    if article.doctor_id != doctor.id:
        return jsonify({'error': 'Not authorized to edit this article'}), 403
    
    data = request.get_json(silent=True) or {}
    
    if 'title' in data and data['title']:
        article.title = data['title']
    if 'content' in data and data['content']:
        article.content = data['content']
    if 'mood_category' in data:
        article.mood_category = data['mood_category']
    if 'keywords' in data:
        article.keywords = data['keywords']
    
    if 'cover_image' in request.files:
        file = request.files['cover_image']
        filename = f"article_{file.filename}"
        filepath = os.path.join('uploads', 'articles', filename)
        file.save(filepath)
        article.cover_image = filepath
    
    db.session.commit()
    
    return jsonify(article.to_dict(include_content=True)), 200

@articles_bp.route('/<int:article_id>', methods=['DELETE'])
@jwt_required()
@doctor_required
def delete_article(article_id):
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    article = Article.query.get(article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    # Check if this doctor is the author
    if article.doctor_id != doctor.id:
        return jsonify({'error': 'Not authorized to delete this article'}), 403
    
    db.session.delete(article)
    db.session.commit()
    
    return jsonify({'message': 'Article deleted successfully'}), 200

@articles_bp.route('/<int:article_id>/like', methods=['POST'])
@jwt_required()
def like_article(article_id):
    current_user_id = int(get_jwt_identity())
    
    article = Article.query.get(article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    existing = ArticleLike.query.filter_by(
        user_id=current_user_id,
        article_id=article_id
    ).first()
    
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'message': 'Article unliked', 'liked': False}), 200
    
    like = ArticleLike(
        user_id=current_user_id,
        article_id=article_id
    )
    
    db.session.add(like)
    db.session.commit()
    
    return jsonify({'message': 'Article liked', 'liked': True}), 201

@articles_bp.route('/<int:article_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(article_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    
    article = Article.query.get(article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    if not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
    
    comment = ArticleComment(
        user_id=current_user_id,
        article_id=article_id,
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201
