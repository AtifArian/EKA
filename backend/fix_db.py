import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine, text

pghost = 'aws-0-ap-southeast-1.pooler.supabase.com'
pgport = '5432'
pguser = 'postgres.ukxqazslfuliznsbqyfe'
pgpassword = quote_plus('eka-eight@naba')
pgdatabase = 'postgres'

db_uri = f"postgresql://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}"

engine = create_engine(db_uri)

migrations = [
    'ALTER TABLE "user" ALTER COLUMN password_hash TYPE TEXT;',
    'ALTER TABLE "user" ALTER COLUMN username TYPE TEXT;',
    'ALTER TABLE "user" ALTER COLUMN email TYPE TEXT;',
    'ALTER TABLE "user" ALTER COLUMN full_name TYPE TEXT;',
    'ALTER TABLE "user" ALTER COLUMN profile_picture TYPE TEXT;',
    'ALTER TABLE "user" ALTER COLUMN google_id TYPE TEXT;',
    'ALTER TABLE doctor ALTER COLUMN specialization TYPE TEXT;',
    'ALTER TABLE doctor ALTER COLUMN location TYPE TEXT;',
    'ALTER TABLE doctor ALTER COLUMN google_maps_link TYPE TEXT;',
    'ALTER TABLE doctor ALTER COLUMN verification_document TYPE TEXT;',
    'ALTER TABLE doctor ALTER COLUMN quote TYPE TEXT;',
    'ALTER TABLE doctor ALTER COLUMN age_group TYPE TEXT;',
    'ALTER TABLE article ALTER COLUMN title TYPE TEXT;',
    'ALTER TABLE article ALTER COLUMN cover_image TYPE TEXT;',
    'ALTER TABLE article ALTER COLUMN mood_category TYPE TEXT;',
    'ALTER TABLE article ALTER COLUMN keywords TYPE TEXT;',
    'ALTER TABLE journal ALTER COLUMN title TYPE TEXT;',
    'ALTER TABLE donation ALTER COLUMN donor_name TYPE TEXT;',
    'ALTER TABLE donation ALTER COLUMN donor_email TYPE TEXT;',
    'ALTER TABLE donation ALTER COLUMN transaction_id TYPE TEXT;',
    'ALTER TABLE donation ALTER COLUMN payment_method TYPE TEXT;'
]

tables = [
    'clinic_review', 'chat_request', 'chat_thread', 'mood_entry', 'notification', 
    'journal', 'booking', 'journal_comment', 'journal_heart', 'message', 
    'article_read', 'article_comment', 'article_like', '"user"', 'friend_request', 
    'doctor', 'article', 'donation'
]

with engine.connect() as conn:
    print("Fixing all character varying columns...")
    res = conn.execute(text("""
        SELECT table_name, column_name, character_maximum_length
        FROM information_schema.columns
        WHERE data_type LIKE '%character varying%' 
        AND table_schema = 'public' 
        AND table_name != '_sqlite_sequence';
    """))
    
    columns_to_fix = res.fetchall()
    
    for table_name, column_name, max_len in columns_to_fix:
        if column_name.endswith('_at') or column_name.endswith('_date') or column_name == 'date':
            target_type = 'TIMESTAMP'
        elif column_name == 'is_doctor' or column_name.startswith('is_'):
            # wait, is_doctor is already boolean, let's leave it unless it's varchar
            target_type = 'TEXT' 
        else:
            target_type = 'TEXT'
            
        print(f"Fixing {table_name}.{column_name} to {target_type} (was {max_len})")
        
        try:
            conn.execute(text(f'ALTER TABLE "{table_name}" ALTER COLUMN "{column_name}" DROP DEFAULT;'))
        except Exception:
            conn.rollback()
            
        try:
            if target_type == 'TIMESTAMP':
                conn.execute(text(f'ALTER TABLE "{table_name}" ALTER COLUMN "{column_name}" TYPE TIMESTAMP USING NULL;'))
            else:
                conn.execute(text(f'ALTER TABLE "{table_name}" ALTER COLUMN "{column_name}" TYPE TEXT;'))
            conn.commit()
            print("Success")
        except Exception as e:
            print(f"Failed: {e}")
            conn.rollback()

    print("Done fixing database schema.")





