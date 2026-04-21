#!/bin/bash

# Eburon Realtime Transcription - Local Deployment Script
# This script clones the repository and deploys it locally

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/lovegold120221-dot/stt-realtime.git"
APP_NAME="stt-realtime"
TARGET_PORT="5173"
DEFAULT_DIR="$HOME/Projects"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$TARGET_PORT >/dev/null 2>&1
}

# Function to open browser
open_browser() {
    local url="http://localhost:$TARGET_PORT"
    print_status "Opening browser at $url"
    
    # Detect OS and open browser accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$url"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists xdg-open; then
            xdg-open "$url"
        elif command_exists gnome-open; then
            gnome-open "$url"
        else
            print_warning "Could not detect browser command. Please manually open: $url"
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start "$url"
    else
        print_warning "Unknown OS. Please manually open: $url"
    fi
}

# Main deployment function
deploy_app() {
    print_status "Starting deployment of Eburon Realtime Transcription..."
    
    # Check prerequisites
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check if port is already in use
    if port_in_use; then
        print_warning "Port $TARGET_PORT is already in use."
        read -p "Do you want to kill the process using port $TARGET_PORT? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Killing process on port $TARGET_PORT..."
            lsof -ti:$TARGET_PORT | xargs kill -9 2>/dev/null || true
            sleep 2
        else
            print_error "Please free up port $TARGET_PORT and try again."
            exit 1
        fi
    fi
    
    # Ask for installation directory
    echo
    read -p "Enter installation directory (default: $DEFAULT_DIR): " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-$DEFAULT_DIR}
    
    # Create installation directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"
    
    # Navigate to installation directory
    cd "$INSTALL_DIR"
    
    # Remove existing directory if it exists
    if [ -d "$APP_NAME" ]; then
        print_warning "Directory $APP_NAME already exists."
        read -p "Do you want to remove it and clone fresh? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Removing existing directory..."
            rm -rf "$APP_NAME"
        else
            print_status "Using existing directory..."
            cd "$APP_NAME"
            print_status "Pulling latest changes..."
            git pull origin main
        fi
    fi
    
    # Clone or navigate to repository
    if [ ! -d "$APP_NAME" ]; then
        print_status "Cloning repository..."
        git clone "$REPO_URL" "$APP_NAME"
        cd "$APP_NAME"
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Check if installation was successful
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies."
        exit 1
    fi
    
    print_success "Dependencies installed successfully!"
    
    # Start the development server
    print_status "Starting development server..."
    print_status "The app will be available at: http://localhost:$TARGET_PORT"
    print_status "API Documentation: http://localhost:$TARGET_PORT/documentation"
    echo
    
    # Open browser after a short delay
    (sleep 3 && open_browser) &
    
    # Start the dev server
    npm run dev
}

# Function to display help
show_help() {
    echo "Eburon Realtime Transcription - Local Deployment Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -q, --quick    Quick deployment (skip prompts, use defaults)"
    echo "  -s, --stop     Stop any running instance on port $TARGET_PORT"
    echo
    echo "Examples:"
    echo "  $0              # Interactive deployment"
    echo "  $0 --quick      # Quick deployment with default settings"
    echo "  $0 --stop       # Stop running instance"
    echo
}

# Function to stop running instance
stop_instance() {
    print_status "Checking for running instances on port $TARGET_PORT..."
    
    if port_in_use; then
        print_status "Found running instance. Stopping..."
        lsof -ti:$TARGET_PORT | xargs kill -9 2>/dev/null || true
        print_success "Instance stopped successfully!"
    else
        print_status "No running instance found on port $TARGET_PORT."
    fi
}

# Quick deployment function
quick_deploy() {
    print_status "Quick deployment mode..."
    INSTALL_DIR="$DEFAULT_DIR"
    
    # Create installation directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Remove existing directory if it exists
    if [ -d "$APP_NAME" ]; then
        print_status "Removing existing directory for fresh install..."
        rm -rf "$APP_NAME"
    fi
    
    # Clone repository
    print_status "Cloning repository..."
    git clone "$REPO_URL" "$APP_NAME"
    cd "$APP_NAME"
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install
    
    # Start the development server
    print_status "Starting development server..."
    print_status "The app will be available at: http://localhost:$TARGET_PORT"
    print_status "API Documentation: http://localhost:$TARGET_PORT/documentation"
    echo
    
    # Open browser after a short delay
    (sleep 3 && open_browser) &
    
    # Start the dev server
    npm run dev
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -q|--quick)
        quick_deploy
        ;;
    -s|--stop)
        stop_instance
        exit 0
        ;;
    "")
        deploy_app
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
