# 🚀 Quick Start Guide

This is a condensed guide to get your Dish Recommender app running quickly.

## Step 1: Firebase Setup (5 minutes)

1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable **Authentication** → **Email/Password**
4. Create **Firestore Database** (test mode)
5. Get **Web Config**:
   - Project Settings → General → Your apps → Web icon
   - Choose "Use script tag"
   - Copy the config values
6. Get **Service Account Key**:
   - Project Settings → Service Accounts → Generate new private key

## Step 2: Configure App (2 minutes)

1. **Edit `.env` file** - paste your Firebase config:
```env
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
PORT=8000
```

2. **Replace `firebase-credentials.json`** with your downloaded service account key file

## Step 3: Run the App

### Using Docker (Easiest):
```bash
docker-compose up -d
```

### Without Docker:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app/main.py
```

## Step 4: Access App

Open browser: **http://localhost:8000**

## Step 5: Test It

1. Click "Login" → "Sign Up"
2. Create an account
3. Search for an ingredient (e.g., "chicken")
4. Click on a recipe
5. Click "Save Recipe"
6. Go to "Saved Recipes" to see your collection

---

## Deploy to VPS (Quick Steps)

```bash
# On VPS
sudo apt update
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y

# Upload project
scp -r dish-recommender user@vps-ip:/home/user/

# On VPS
cd dish-recommender
docker-compose up -d

# Allow port
sudo ufw allow 8000/tcp
```

Access at: `http://YOUR_VPS_IP:8000`

---

## Need Help?

- Check the full `README.md` for detailed instructions
- View logs: `docker-compose logs -f`
- Restart: `docker-compose restart`

**That's it! Happy cooking! 🍽️**
