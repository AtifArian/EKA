from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Article, ArticleLike, ArticleComment, Doctor
from app.utils.decorators import doctor_required
import os

articles_bp = Blueprint('articles', __name__)

@articles_bp.route('/', methods=['GET'])
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
def get_article(article_id):
    article = Article.query.get(article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    comments = ArticleComment.query.filter_by(article_id=article_id).order_by(
        ArticleComment.created_at.desc()
    ).all()
    
    data = article.to_dict(include_content=True)
    data['comments'] = [comment.to_dict() for comment in comments]
    
    return jsonify(data), 200

@articles_bp.route('/', methods=['POST'])
@jwt_required()
@doctor_required
def create_article():
    current_user_id = int(get_jwt_identity())
    doctor = Doctor.query.filter_by(user_id=current_user_id).first()
    if not doctor:
        return jsonify({'error': 'Doctor profile not found'}), 404
    
    data = request.get_json()
    
    article = Article(
        doctor_id=doctor.id,
        title=data['title'],
        content=data['content'],
        mood_category=data.get('mood_category'),
        keywords=data.get('keywords')
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
        return jsonify({'message': 'Article unliked'}), 200
    
    like = ArticleLike(
        user_id=current_user_id,
        article_id=article_id
    )
    
    db.session.add(like)
    db.session.commit()
    
    return jsonify({'message': 'Article liked'}), 201

@articles_bp.route('/<int:article_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(article_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    article = Article.query.get(article_id)
    if not article:
        return jsonify({'error': 'Article not found'}), 404
    
    comment = ArticleComment(
        user_id=current_user_id,
        article_id=article_id,
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201
