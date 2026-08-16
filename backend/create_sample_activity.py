"""
Create sample activity data for testing the Activity Dashboard
This will create mood entries, journals, and article reads for a test user
"""
from app import create_app
from app.models import db, User, MoodEntry, Journal, Article, ArticleLike, ArticleRead, ArticleComment
from datetime import datetime, timedelta
import random

def create_sample_activity():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("Creating Sample Activity Data")
        print("=" * 60)
        
        # Find or create a test user
        user = User.query.filter_by(email='test@example.com').first()
        if not user:
            print("\n❌ No test user found. Creating one...")
            user = User(
                username='testuser',
                email='test@example.com',
                is_doctor=False
            )
            user.set_password('password123')
            db.session.add(user)
            db.session.commit()
            print(f"✅ Created test user: {user.username}")
        else:
            print(f"\n✅ Found test user: {user.username}")
        
        # Create mood entries for last 30 days
        print("\n📊 Creating mood entries...")
        mood_count = 0
        for i in range(30):
            date = datetime.utcnow() - timedelta(days=i)
            # Check if mood entry already exists for this date
            existing = MoodEntry.query.filter(
                MoodEntry.user_id == user.id,
                MoodEntry.date == date.date()
            ).first()
            
            if not existing:
                mood = MoodEntry(
                    user_id=user.id,
                    mood_level=random.randint(2, 5),
                    energy_level=random.randint(2, 5),
                    stress_level=random.randint(1, 4),
                    notes=f"Sample mood entry for {date.date()}",
                    date=date.date(),
                    created_at=date
                )
                db.session.add(mood)
                mood_count += 1
        
        db.session.commit()
        print(f"✅ Created {mood_count} mood entries")
        
        # Create journal entries
        print("\n📝 Creating journal entries...")
        journal_titles = [
            "Reflecting on Today",
            "Feeling Better",
            "A Challenging Day",
            "Grateful Moments",
            "Progress and Growth",
            "Understanding My Emotions",
            "Self-Care Sunday",
            "Weekly Reflection"
        ]
        
        journal_count = 0
        for i in range(8):
            date = datetime.utcnow() - timedelta(days=i*3)
            existing = Journal.query.filter(
                Journal.user_id == user.id,
                Journal.title == journal_titles[i]
            ).first()
            
            if not existing:
                journal = Journal(
                    user_id=user.id,
                    title=journal_titles[i],
                    content=f"This is a sample journal entry created for testing. It contains my thoughts and feelings about {journal_titles[i].lower()}. I'm working on understanding my emotions better.",
                    is_public=random.choice([True, False]),
                    sentiment_score=random.uniform(-0.5, 0.8),
                    emotion=random.choice(['Happy', 'Neutral', 'Sad', 'Anxious', 'Hopeful']),
                    created_at=date
                )
                db.session.add(journal)
                journal_count += 1
        
        db.session.commit()
        print(f"✅ Created {journal_count} journal entries")
        
        # Create article interactions
        print("\n📰 Creating article interactions...")
        articles = Article.query.limit(5).all()
        
        if articles:
            read_count = 0
            like_count = 0
            comment_count = 0
            
            for article in articles:
                # Create article reads
                for i in range(random.randint(1, 3)):
                    date = datetime.utcnow() - timedelta(days=i*2)
                    existing_read = ArticleRead.query.filter(
                        ArticleRead.user_id == user.id,
                        ArticleRead.article_id == article.id,
                        func.date(ArticleRead.created_at) == date.date()
                    ).first()
                    
                    if not existing_read:
                        read = ArticleRead(
                            user_id=user.id,
                            article_id=article.id,
                            created_at=date
                        )
                        db.session.add(read)
                        read_count += 1
                
                # Create article likes
                if random.choice([True, False]):
                    existing_like = ArticleLike.query.filter_by(
                        user_id=user.id,
                        article_id=article.id
                    ).first()
                    
                    if not existing_like:
                        like = ArticleLike(
                            user_id=user.id,
                            article_id=article.id,
                            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 10))
                        )
                        db.session.add(like)
                        like_count += 1
                
                # Create comments
                if random.choice([True, False]):
                    comment = ArticleComment(
                        user_id=user.id,
                        article_id=article.id,
                        content=f"This is a helpful article! Thanks for sharing.",
                        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 15))
                    )
                    db.session.add(comment)
                    comment_count += 1
            
            db.session.commit()
            print(f"✅ Created {read_count} article reads")
            print(f"✅ Created {like_count} article likes")
            print(f"✅ Created {comment_count} article comments")
        else:
            print("⚠️  No articles found in database")
        
        print("\n" + "=" * 60)
        print("✅ Sample Activity Data Created Successfully!")
        print("=" * 60)
        print(f"\n👤 Test User Credentials:")
        print(f"   Email: test@example.com")
        print(f"   Password: password123")
        print(f"\n🎯 Now you can:")
        print(f"   1. Login with the test user")
        print(f"   2. Go to My Profile → Activity tab")
        print(f"   3. View the activity dashboard with graphs!")
        print("=" * 60)

if __name__ == '__main__':
    from sqlalchemy import func
    create_sample_activity()
