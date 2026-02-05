import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials"""
    try:
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        raise

def get_firestore_client():
    """Get Firestore client instance"""
    return firestore.client()

def verify_firebase_token(id_token: str):
    """
    Verify Firebase ID token and return decoded token
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        dict: Decoded token with user information
        
    Raises:
        Exception: If token is invalid
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise Exception(f"Invalid token: {str(e)}")

# Firebase config for frontend (from .env)
def get_firebase_config():
    """Get Firebase configuration for frontend"""
    return {
        "apiKey": os.getenv("FIREBASE_API_KEY"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID"),
        "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
        "appId": os.getenv("FIREBASE_APP_ID")
    }
