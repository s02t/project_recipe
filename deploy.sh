#!/bin/bash

# Dish Recommender Deployment Script
# This script helps deploy the application on a VPS

set -e  # Exit on error

echo "=================================="
echo "Dish Recommender Deployment Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "Step 1: Checking prerequisites..."
echo ""

# Check Docker
if command_exists docker; then
    echo -e "${GREEN}✓ Docker is installed${NC}"
else
    echo -e "${YELLOW}⚠ Docker is not installed${NC}"
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed successfully${NC}"
    echo -e "${YELLOW}Note: You may need to log out and back in for Docker group changes to take effect${NC}"
fi

# Check Docker Compose
if command_exists docker-compose; then
    echo -e "${GREEN}✓ Docker Compose is installed${NC}"
else
    echo -e "${YELLOW}⚠ Docker Compose is not installed${NC}"
    echo "Installing Docker Compose..."
    sudo apt update
    sudo apt install docker-compose -y
    echo -e "${GREEN}✓ Docker Compose installed successfully${NC}"
fi

echo ""
echo "Step 2: Checking configuration files..."
echo ""

# Check .env file
if [ -f ".env" ]; then
    if grep -q "YOUR_FIREBASE_API_KEY" .env; then
        echo -e "${RED}✗ .env file contains placeholder values${NC}"
        echo "Please edit .env and add your actual Firebase configuration"
        exit 1
    else
        echo -e "${GREEN}✓ .env file configured${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

# Check firebase-credentials.json
if [ -f "firebase-credentials.json" ]; then
    if grep -q "YOUR_PROJECT_ID" firebase-credentials.json; then
        echo -e "${RED}✗ firebase-credentials.json contains placeholder values${NC}"
        echo "Please replace firebase-credentials.json with your actual service account key"
        exit 1
    else
        echo -e "${GREEN}✓ firebase-credentials.json configured${NC}"
    fi
else
    echo -e "${RED}✗ firebase-credentials.json not found${NC}"
    exit 1
fi

echo ""
echo "Step 3: Building Docker image..."
echo ""

docker-compose build

echo -e "${GREEN}✓ Docker image built successfully${NC}"

echo ""
echo "Step 4: Starting application..."
echo ""

docker-compose up -d

echo -e "${GREEN}✓ Application started successfully${NC}"

echo ""
echo "Step 5: Checking application status..."
echo ""

sleep 5  # Wait for app to start

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Application is running${NC}"
    
    # Get the port
    PORT=$(grep "^PORT=" .env | cut -d '=' -f2)
    PORT=${PORT:-8000}
    
    echo ""
    echo "=================================="
    echo -e "${GREEN}Deployment Successful!${NC}"
    echo "=================================="
    echo ""
    echo "Application is running at:"
    echo "  Local: http://localhost:$PORT"
    echo "  Network: http://$(hostname -I | awk '{print $1}'):$PORT"
    echo ""
    echo "Useful commands:"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop app:      docker-compose down"
    echo "  Restart app:   docker-compose restart"
    echo "  Rebuild app:   docker-compose up -d --build"
    echo ""
    echo "Firewall configuration (if needed):"
    echo "  sudo ufw allow $PORT/tcp"
    echo ""
else
    echo -e "${RED}✗ Application failed to start${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

# Optional: Configure firewall
echo "Would you like to configure the firewall to allow port $PORT? (y/n)"
read -r CONFIGURE_FIREWALL

if [ "$CONFIGURE_FIREWALL" = "y" ] || [ "$CONFIGURE_FIREWALL" = "Y" ]; then
    if command_exists ufw; then
        sudo ufw allow $PORT/tcp
        echo -e "${GREEN}✓ Firewall configured to allow port $PORT${NC}"
    else
        echo -e "${YELLOW}⚠ UFW not found, skipping firewall configuration${NC}"
    fi
fi

echo ""
echo "Deployment complete! 🎉"
echo ""
