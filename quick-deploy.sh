#!/bin/bash

# Quick one-line deployment for Eburon Realtime Transcription
# Usage: curl -sSL https://raw.githubusercontent.com/lovegold120221-dot/stt-realtime/main/quick-deploy.sh | bash

set -e

echo "Deploying Eburon Realtime Transcription..."

# Check prerequisites
if ! command -v git &> /dev/null || ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "ERROR: Git, Node.js, and npm are required. Please install them first."
    exit 1
fi

# Kill any existing process on port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Clone and setup
cd ~ && rm -rf stt-realtime && \
git clone https://github.com/lovegold120221-dot/stt-realtime.git && \
cd stt-realtime && \
npm install && \
echo "Starting server at http://localhost:5173..." && \
(npm run dev &) && \
sleep 3 && \
open http://localhost:5173 && \
echo "Deployment complete! The app is running at http://localhost:5173"

echo "Press Ctrl+C to stop the server"
