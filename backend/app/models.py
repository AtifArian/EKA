from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

# Association tables
friendships = db.Table('friendships',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('friend_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

doctor_patients = db.Table('doctor_patients',
    db.Column('doctor_id', db.Integer, db.ForeignKey('doctor.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    full_name = db.Column(db.String(120))
    profile_picture = db.Column(db.String(255))
    is_doctor = db.Column(db.Boolean, default=False)
    google_id = db.Column(db.String(255), unique=True)
    free_booking_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    mood_entries = db.relationship('MoodEntry', backref='user', lazy=True, cascade='all, delete-orphan')
    journals = db.relationship('Journal', backref='author', lazy=True, cascade='all, delete-orphan')
    article_likes = db.relationship('ArticleLike', backref='user', lazy=True, cascade='all, delete-orphan')
    article_comments = db.relationship('ArticleComment', backref='user', lazy=True, cascade='all, delete-orphan')
    journal_hearts = db.relationship('JournalHeart', backref='user', lazy=True, cascade='all, delete-orphan')
    journal_comments = db.relationship('JournalComment', backref='user', lazy=True, cascade='all, delete-orphan')
    
    friends = db.relationship('User', 
                            secondary=friendships,
                            primaryjoin=(friendships.c.user_id == id),
                            secondaryjoin=(friendships.c.friend_id == id),
                            backref=db.backref('friend_of', lazy='dynamic'),
                            lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        # Convert profile_picture path to URL
        profile_picture_url = None
        if self.profile_picture:
            # Remove 'uploads/' prefix if present and construct URL
            path = self.profile_picture.replace('\\', '/')
            if path.startswith('uploads/'):
                path = path[8:]  # Remove 'uploads/' prefix
            profile_picture_url = f'/uploads/{path}'
        
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'profile_picture': profile_picture_url,
            'is_doctor': self.is_doctor,
            'created_at': self.created_at.isoformat()
        }

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    specialization = db.Column(db.String(100))
    bio = db.Column(db.Text)
    quote = db.Column(db.String(500))
    expertise = db.Column(db.Text)
    education = db.Column(db.Text)
    age_group = db.Column(db.String(50))
    location = db.Column(db.String(200))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    session_charge = db.Column(db.Float, default=0.0)
    google_maps_link = db.Column(db.String(500))
    is_verified = db.Column(db.Boolean, default=False)
    verification_document = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='doctor_profile')
    patients = db.relationship('User', secondary=doctor_patients, backref='doctors')
    
    # ADD THIS METHOD:
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'specialization': self.specialization,
            'bio': self.bio,
            'quote': self.quote,
            'expertise': self.expertise,
            'education': self.education,
            'age_group': self.age_group,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'session_charge': self.session_charge,
            'google_maps_link': self.google_maps_link,
            'is_verified': self.is_verified,
            'average_rating': self.average_rating,
            'review_count': len(self.reviews) if hasattr(self, 'reviews') else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @property
    def average_rating(self):
        if hasattr(self, 'reviews') and self.reviews:
            return sum(r.rating for r in self.reviews) / len(self.reviews)
        return 0.0

class MoodEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mood_level = db.Column(db.Integer, nullable=False)  # 1-5
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # ADD THIS METHOD:
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'mood_level': self.mood_level,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(255))
    mood_category = db.Column(db.String(50))  # happy, sad, anxious, stressed, neutral
    keywords = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    author = db.relationship('Doctor', backref='articles', lazy=True)
    likes = db.relationship('ArticleLike', backref='article', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('ArticleComment', backref='article', lazy=True, cascade='all, delete-orphan')
    
    def like_count(self):
        return len(self.likes)
    
    def to_dict(self, include_content=False):
        data = {
            'id': self.id,
            'author': self.author.user.to_dict(),
            'title': self.title,
            'cover_image': self.cover_image,
            'keywords': self.keywords,
            'like_count': self.like_count(),
            'comment_count': len(self.comments),
            'created_at': self.created_at.isoformat()
        }
        if include_content:
            data['content'] = self.content
            data['mood_category'] = self.mood_category
        return data

class ArticleLike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'article_id', name='unique_article_like'),)

class ArticleComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.to_dict(),
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }

class Journal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_public = db.Column(db.Boolean, default=False)
    sentiment_score = db.Column(db.Float)
    # New: discrete emotion label from {Very sad, Sad, Neutral, Happy, Very Happy}
    emotion = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    hearts = db.relationship('JournalHeart', backref='journal', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('JournalComment', backref='journal', lazy=True, cascade='all, delete-orphan')
    
    def heart_count(self):
        return len(self.hearts)
    
    def to_dict(self, include_sentiment=False):
        data = {
            'id': self.id,
            'author': self.author.to_dict(),
            'title': self.title,
            'content': self.content,
            'is_public': self.is_public,
            'heart_count': self.heart_count(),
            'comment_count': len(self.comments),
            'created_at': self.created_at.isoformat()
        }
        if include_sentiment:
            data['sentiment_score'] = self.sentiment_score
            data['emotion'] = self.emotion
        return data

class JournalHeart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    journal_id = db.Column(db.Integer, db.ForeignKey('journal.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'journal_id', name='unique_journal_heart'),)

class JournalComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    journal_id = db.Column(db.Integer, db.ForeignKey('journal.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.to_dict(),
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }

class ClinicReview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='reviews')
    doctor = db.relationship('Doctor', backref='reviews')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.to_dict(),
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='bookings')
    doctor = db.relationship('Doctor', backref='bookings')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.to_dict(),
            'doctor': self.doctor.to_dict(),
            'appointment_date': self.appointment_date.isoformat(),
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class ChatRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    to_doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    from_user = db.relationship('User', foreign_keys=[from_user_id], backref='sent_chat_requests')
    to_doctor = db.relationship('Doctor', foreign_keys=[to_doctor_id], backref='received_chat_requests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'from_user': self.from_user.to_dict(),
            'to_doctor': self.to_doctor.to_dict(),
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
