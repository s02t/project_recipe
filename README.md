# 🍽️ Dish Recommender - Recipe Generator

A web application that recommends recipes based on ingredients using TheMealDB API. Built with FastAPI, Firebase Authentication, and Bootstrap.

## ✨ Features

- 🔍 **Search Recipes** by ingredients using TheMealDB API
- 🔐 **Email/Password Authentication** with Firebase
- 💾 **Save Favorite Recipes** to your personal collection
- 📱 **Responsive Design** with Bootstrap 5
- 🐳 **Docker Support** for easy deployment

## 🛠️ Tech Stack

- **Backend**: FastAPI, Python 3.11
- **Frontend**: Jinja2, Bootstrap 5, Vanilla JS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email/Password)
- **API**: TheMealDB API
- **Containerization**: Docker/Podman

## 📋 Prerequisites

- Python 3.11+
- Docker and Docker Compose (for containerized deployment)
- Firebase account (free)
- Git

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "dish-recommender")
4. Follow the setup wizard (Google Analytics is optional)

### Step 2: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Email/Password**
3. Toggle **Enable** to ON
4. Click **Save**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select a region close to your users
4. Click **Enable**

### Step 4: Get Firebase Web Configuration

1. Go to **Project Settings** (gear icon ⚙️) → **General** tab
2. Scroll to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register your app with a nickname (e.g., "dish-recommender-web")
5. **Choose "Use script tag"** (NOT npm)
6. Copy the `firebaseConfig` object values

### Step 5: Get Service Account Key

1. Still in **Project Settings**, go to **Service Accounts** tab
2. Click **Generate new private key**
3. Click **Generate key** in the popup
4. A JSON file will be downloaded - **keep this file secure!**

## ⚙️ Configuration

### 1. Configure Environment Variables

Edit the `.env` file and replace the placeholder values with your Firebase configuration:

```env
FIREBASE_API_KEY=your_actual_api_key_here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id

PORT=8000
```

### 2. Configure Service Account Credentials

Replace the entire content of `firebase-credentials.json` with the JSON file you downloaded in Step 5 of Firebase Setup.

The file should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-actual-project-id",
  "private_key_id": "actual_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour actual private key\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

## 🚀 Running the Application

### Option 1: Using Docker (Recommended)

#### Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at: **http://localhost:8000**

#### Or use Docker directly

```bash
# Build the image
docker build -t dish-recommender .

# Run the container
docker run -d \
  --name dish-recommender \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/firebase-credentials.json:/app/firebase-credentials.json:ro \
  dish-recommender

# View logs
docker logs -f dish-recommender

# Stop the container
docker stop dish-recommender
docker rm dish-recommender
```

### Option 2: Running Locally (Without Docker)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app/main.py

# Or use uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The application will be available at: **http://localhost:8000**

## 🌐 Deploying to VPS

### Prerequisites on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
```

### Deployment Steps

1. **Clone or Upload the Project to VPS**

```bash
# Option 1: Clone from Git
git clone <your-repo-url>
cd dish-recommender

# Option 2: Upload via SCP
scp -r dish-recommender user@your-vps-ip:/home/user/
```

2. **Configure Firebase Credentials**

Upload your `.env` and `firebase-credentials.json` files to the VPS:

```bash
# From your local machine
scp .env user@your-vps-ip:/home/user/dish-recommender/
scp firebase-credentials.json user@your-vps-ip:/home/user/dish-recommender/
```

Or edit them directly on the VPS:

```bash
nano .env
nano firebase-credentials.json
```

3. **Build and Run**

```bash
# Build the image
docker-compose build

# Start the application
docker-compose up -d

# Check if running
docker-compose ps
docker-compose logs
```

4. **Configure Firewall**

```bash
# Allow port 8000
sudo ufw allow 8000/tcp
sudo ufw reload
```

5. **Access the Application**

Open your browser and go to: `http://YOUR_VPS_IP:8000`

### Using Nginx as Reverse Proxy (Optional)

1. **Install Nginx**

```bash
sudo apt install nginx -y
```

2. **Create Nginx Configuration**

```bash
sudo nano /etc/nginx/sites-available/dish-recommender
```

Add the following content:

```nginx
server {ways use environment variables for sensitive data
    listen 80;
    server_name your-domain.com;  # Replace with your domain or VPS IP

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Enable the Configuration**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dish-recommender /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Allow HTTP traffic
sudo ufw allow 'Nginx Full'
```

4. **Optional: Setup SSL with Let's Encrypt**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

Now access your app at: `http://your-domain.com` (or `https://` if SSL is configured)

## 🔧 Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# View logs
docker logs dish-recommender
docker-compose logs -f

# Restart container
docker restart dish-recommender
docker-compose restart

# Stop and remove
docker stop dish-recommender
docker rm dish-recommender
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Remove unused images
docker image prune -a
```

## 📱 Usage Guide

### For Users

1. **Homepage** - Search for recipes by ingredient
   - Type an ingredient in the search box
   - Autocomplete will suggest available ingredients
   - Click "Search" to find recipes

2. **Recipe Details** - View full recipe
   - Click on any recipe card to see details
   - View ingredients, instructions, and video tutorial (if available)
   - Click "Save Recipe" to add to your collection (requires login)

3. **Authentication**
   - Click "Login" in the navigation bar
   - Switch between Login and Sign Up tabs
   - Enter your email and password
   - After signup, you can start saving recipes

4. **Saved Recipes** - Access your collection
   - Click "Saved Recipes" in the navigation (only visible when logged in)
   - View all your saved recipes
   - Click to view details
   - Delete recipes you no longer want

## 🔒 Security Notes

- Use Firebase security rules in production

### Example Firestore Security Rules (for production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Apply these rules in Firebase Console → Firestore Database → Rules

## 🐛 Troubleshooting

### Firebase Initialization Fails

- Check that `firebase-credentials.json` is valid JSON
- Verify all values in `.env` are correct
- Ensure Firestore is enabled in Firebase Console

### Authentication Not Working

- Verify Email/Password is enabled in Firebase Console
- Check browser console for errors
- Ensure `.env` values match Firebase config exactly

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000
# or
netstat -nlp | grep 8000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=8080
```

### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Credits

- Recipe data from [TheMealDB API](https://www.themealdb.com/)
- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Authentication by [Firebase](https://firebase.google.com/)
- UI by [Bootstrap](https://getbootstrap.com/)

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Firebase and Docker documentation
3. Check application logs: `docker-compose logs`

---

**Happy Cooking! 🍳👨‍🍳**
