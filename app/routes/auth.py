from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from app.firebase_config import verify_firebase_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class TokenVerification(BaseModel):
    token: str

class UserInfo(BaseModel):
    uid: str
    email: Optional[str] = None
    email_verified: Optional[bool] = False

@router.post("/verify")
async def verify_token(token_data: TokenVerification):
    """Verify Firebase authentication token"""
    try:
        decoded_token = verify_firebase_token(token_data.token)
        return {
            "success": True,
            "user": {
                "uid": decoded_token['uid'],
                "email": decoded_token.get('email'),
                "email_verified": decoded_token.get('email_verified', False)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to get current authenticated user from token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        decoded_token = verify_firebase_token(token)
        return {
            "uid": decoded_token['uid'],
            "email": decoded_token.get('email')
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
