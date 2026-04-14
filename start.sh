#!/bin/bash

# Imperium CEO System Startup Script

echo "🚀 Starting Imperium CEO System..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Please update .env with your credentials"
    fi
fi

# Start services
print_status "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 5

# Check status
print_status "Checking service status..."
docker-compose ps

print_status "Imperium CEO System started successfully!"
echo ""
echo "Services:"
echo "  - Imperium CEO API: http://localhost:8081"
echo "  - n8n Workflows: http://localhost:5678"
echo "  - Redis: localhost:6380"
echo ""
print_warning "Default n8n credentials:"
echo "  Username: admin"
echo "  Password: imperium"
