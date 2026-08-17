import os
import time
import requests
from werkzeug.utils import secure_filename

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'}

def is_allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_content_type(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    content_types = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf',
        'svg': 'image/svg+xml'
    }
    return content_types.get(ext, 'application/octet-stream')

def get_supabase_config():
    """Returns Supabase URL, Key, and Bucket name from environment."""
    supabase_url = os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ.get('VITE_SUPABASE_URL')
    if supabase_url:
        supabase_url = supabase_url.rstrip('/')
        if not supabase_url.startswith('http'):
            supabase_url = f'https://{supabase_url}'
            
    supabase_key = (
        os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or 
        os.environ.get('SUPABASE_SERVICE_KEY') or 
        os.environ.get('SUPABASE_KEY') or
        os.environ.get('SUPABASE_ANON_KEY')
    )
    bucket_name = os.environ.get('SUPABASE_STORAGE_BUCKET', 'uploads')
    return supabase_url, supabase_key, bucket_name

def upload_file_to_storage(file, folder='profiles', prefix=''):
    """
    Uploads a file to Supabase Storage if configured; otherwise saves to local uploads directory.
    
    Args:
        file: Werkzeug FileStorage object or file-like object
        folder: Subdirectory name ('profiles', 'articles', 'verifications')
        prefix: Optional prefix for filename (e.g. user_id or doctor_id)
        
    Returns:
        str: Public URL (for Supabase) or relative path '/uploads/...' (for local)
    """
    if not file or not hasattr(file, 'filename') or not file.filename:
        return None
        
    orig_name = secure_filename(file.filename) or 'file.png'
    timestamp = int(time.time())
    
    if prefix:
        filename = f"{prefix}_{timestamp}_{orig_name}"
    else:
        filename = f"{timestamp}_{orig_name}"
        
    storage_path = f"{folder}/{filename}"
    content_type = get_content_type(orig_name)
    
    supabase_url, supabase_key, bucket = get_supabase_config()
    
    # Try uploading to Supabase Storage if credentials are configured
    if supabase_url and supabase_key:
        try:
            file.seek(0)
            file_bytes = file.read()
            
            upload_url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
            headers = {
                'Authorization': f'Bearer {supabase_key}',
                'apikey': supabase_key,
                'Content-Type': content_type,
                'x-upsert': 'true'
            }
            
            resp = requests.post(upload_url, headers=headers, data=file_bytes, timeout=15)
            
            if resp.status_code in [200, 201]:
                public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
                print(f"Successfully uploaded to Supabase Storage: {public_url}")
                return public_url
            else:
                print(f"Supabase Storage upload warning ({resp.status_code}): {resp.text}")
                # If bucket doesn't exist, attempt auto-creating it
                if resp.status_code == 404 or 'bucket not found' in resp.text.lower():
                    try:
                        create_bucket_url = f"{supabase_url}/storage/v1/bucket"
                        requests.post(
                            create_bucket_url,
                            headers={'Authorization': f'Bearer {supabase_key}', 'apikey': supabase_key, 'Content-Type': 'application/json'},
                            json={'id': bucket, 'name': bucket, 'public': True},
                            timeout=10
                        )
                        # Retry upload once
                        retry_resp = requests.post(upload_url, headers=headers, data=file_bytes, timeout=15)
                        if retry_resp.status_code in [200, 201]:
                            return f"{supabase_url}/storage/v1/object/public/{bucket}/{storage_path}"
                    except Exception as b_err:
                        print(f"Failed to auto-create bucket: {b_err}")
        except Exception as err:
            print(f"Supabase upload error: {err}")
    
    # Fallback: Save to local filesystem or /tmp in serverless
    try:
        base_upload = os.environ.get('UPLOAD_FOLDER', 'uploads')
        target_dir = os.path.join(base_upload, folder)
        os.makedirs(target_dir, exist_ok=True)
        local_filepath = os.path.join(target_dir, filename)
        
        file.seek(0)
        file.save(local_filepath)
        return f"/uploads/{folder}/{filename}"
    except Exception as local_err:
        print(f"Local file save error: {local_err}")
        # Try /tmp directory as last resort on serverless
        try:
            tmp_dir = os.path.join('/tmp', 'uploads', folder)
            os.makedirs(tmp_dir, exist_ok=True)
            tmp_path = os.path.join(tmp_dir, filename)
            file.seek(0)
            file.save(tmp_path)
            return f"/uploads/{folder}/{filename}"
        except Exception as tmp_err:
            print(f"Tmp file save error: {tmp_err}")
            return None

def delete_file_from_storage(file_path_or_url):
    """
    Deletes a file from Supabase Storage or local filesystem.
    """
    if not file_path_or_url:
        return
        
    supabase_url, supabase_key, bucket = get_supabase_config()
    
    # If it's a Supabase public URL
    if supabase_url and supabase_url in file_path_or_url:
        try:
            # Extract path after bucket
            prefix_to_strip = f"{supabase_url}/storage/v1/object/public/{bucket}/"
            if prefix_to_strip in file_path_or_url:
                rel_path = file_path_or_url.replace(prefix_to_strip, '')
                delete_url = f"{supabase_url}/storage/v1/object/{bucket}/{rel_path}"
                headers = {
                    'Authorization': f'Bearer {supabase_key}',
                    'apikey': supabase_key
                }
                requests.delete(delete_url, headers=headers, timeout=10)
        except Exception as err:
            print(f"Error deleting from Supabase: {err}")
        return
        
    # If it's a local file
    try:
        clean_path = file_path_or_url.lstrip('/')
        if os.path.exists(clean_path):
            os.remove(clean_path)
    except Exception as err:
        print(f"Error deleting local file: {err}")
