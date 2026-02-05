# 🚀 Dish Recommender - Deployment Commands Reference

## Quick Commands Cheat Sheet

### Local Development

#### Using Docker Compose (Recommended)
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart the application
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# View running containers
docker-compose ps
```

#### Using Docker Directly
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

# Stop and remove
docker stop dish-recommender
docker rm dish-recommender
```

#### Without Docker (Local Python)
```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app/main.py

# Or with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## VPS Deployment

### Initial Setup on Fresh VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group (optional)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

### Upload Project to VPS

#### Option 1: Using SCP
```bash
# From your local machine
scp -r dish-recommender user@your-vps-ip:/home/user/
```

#### Option 2: Using Git
```bash
# On VPS
git clone https://github.com/yourusername/dish-recommender.git
cd dish-recommender
```

#### Option 3: Using rsync
```bash
# From your local machine
rsync -avz --exclude 'venv' --exclude '__pycache__' \
  dish-recommender/ user@your-vps-ip:/home/user/dish-recommender/
```

### Deploy on VPS

```bash
# Navigate to project directory
cd dish-recommender

# Upload/edit configuration files
nano .env
nano firebase-credentials.json

# Option 1: Use the deployment script
chmod +x deploy.sh
./deploy.sh

# Option 2: Manual deployment
docker-compose build
docker-compose up -d

# Configure firewall
sudo ufw allow 8000/tcp
sudo ufw reload
```

---

## Nginx Reverse Proxy Setup

### Install Nginx
```bash
sudo apt install nginx -y
```

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/dish-recommender
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP

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

### Enable Configuration
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dish-recommender /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Allow HTTP through firewall
sudo ufw allow 'Nginx Full'
```

### Setup SSL (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Maintenance Commands

### View Logs
```bash
# Docker Compose logs
docker-compose logs -f
docker-compose logs -f --tail=100

# Specific container logs
docker logs dish-recommender-app
docker logs -f dish-recommender-app --tail=50
```

### Update Application
```bash
# Pull latest changes (if using Git)
git pull

# Rebuild and restart
docker-compose up -d --build

# Or with Docker directly
docker build -t dish-recommender .
docker stop dish-recommender
docker rm dish-recommender
docker run -d --name dish-recommender -p 8000:8000 --env-file .env \
  -v $(pwd)/firebase-credentials.json:/app/firebase-credentials.json:ro \
  dish-recommender
```

### Backup Commands
```bash
# Backup configuration files
tar -czf backup-$(date +%Y%m%d).tar.gz .env firebase-credentials.json

# Backup entire project
tar -czf dish-recommender-backup-$(date +%Y%m%d).tar.gz \
  --exclude='venv' --exclude='__pycache__' dish-recommender/
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

### Monitor Resources
```bash
# Check container stats
docker stats dish-recommender-app

# Check disk usage
docker system df

# Check running processes
docker-compose ps
docker ps
```

---

## Troubleshooting Commands

### Check if port is in use
```bash
# Linux
sudo lsof -i :8000
sudo netstat -tulpn | grep 8000

# Kill process on port
sudo kill -9 <PID>
```

### Test Firebase connection
```bash
# Check if credentials file is valid
cat firebase-credentials.json | python -m json.tool

# Test environment variables
docker-compose config
```

### Restart services
```bash
# Restart Docker daemon
sudo systemctl restart docker

# Restart Nginx
sudo systemctl restart nginx

# Restart application
docker-compose restart
```

### Check application health
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test from outside
curl http://YOUR_VPS_IP:8000/health
```

---

## Firewall Commands

### UFW (Ubuntu)
```bash
# Check status
sudo ufw status

# Allow port
sudo ufw allow 8000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny port
sudo ufw deny 8000/tcp

# Delete rule
sudo ufw delete allow 8000/tcp

# Enable/Disable firewall
sudo ufw enable
sudo ufw disable
```

---

## System Service (Optional)

To run as a system service instead of manually:

### Create systemd service
```bash
sudo nano /etc/systemd/system/dish-recommender.service
```

Add:
```ini
[Unit]
Description=Dish Recommender Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/user/dish-recommender
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### Enable and start
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable dish-recommender

# Start service
sudo systemctl start dish-recommender

# Check status
sudo systemctl status dish-recommender

# View logs
sudo journalctl -u dish-recommender -f
```

---

## Environment-Specific Commands

### Development
```bash
# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run with debug logs
docker-compose up
```

### Production
```bash
# Run detached
docker-compose up -d

# Set worker count in docker-compose.yml or run:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Quick Tips

1. **Always backup before updates**: `cp -r dish-recommender dish-recommender.backup`
2. **Check logs first**: `docker-compose logs -f`
3. **Test locally before deploying**: Use Docker Compose locally
4. **Keep credentials secure**: Never commit `.env` or `firebase-credentials.json`
5. **Monitor resources**: Use `docker stats` to check resource usage
6. **Use Nginx in production**: Better performance and SSL support
7. **Regular updates**: Keep Docker and system packages updated

---

## Need More Help?

- Full documentation: See `README.md`
- Quick start: See `QUICKSTART.md`
- Check logs: `docker-compose logs -f`
- Verify config: `docker-compose config`

---

**Happy Deploying! 🚀**
