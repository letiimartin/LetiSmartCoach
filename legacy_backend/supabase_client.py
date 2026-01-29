import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        # We don't raise here to allow the app to boot on Render without secrets
        # for routes that don't need Supabase (like Wahoo redirect).
        print("⚠️ WARNING: SUPABASE_URL or SUPABASE_KEY missing. Supabase client will be None.")
        return None
        
    return create_client(url, key)

# This will be None if env vars are missing, avoiding crash on import.
supabase = get_supabase_client()
