from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
from dotenv import load_dotenv

from app.firebase_config import initialize_firebase, get_firebase_config
from app.routes import auth, recipes

# Load environment variables
load_dotenv()

# Initialize Firebase
try:
    initialize_firebase()
except Exception as e:
    print(f"Warning: Firebase initialization failed: {e}")

# Create FastAPI app
app = FastAPI(title="Dish Recommender", version="1.0.0")

# Setup templates and static files
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(recipes.router)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page - Recipe search"""
    firebase_config = get_firebase_config()
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "firebase_config": firebase_config
        }
    )

@app.get("/saved", response_class=HTMLResponse)
async def saved_recipes(request: Request):
    """Saved recipes page"""
    firebase_config = get_firebase_config()
    return templates.TemplateResponse(
        "saved_recipes.html",
        {
            "request": request,
            "firebase_config": firebase_config
        }
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Dish Recommender API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
