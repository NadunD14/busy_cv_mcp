#!/bin/bash

# MCP CV Assistant Startup Script
echo "🚀 Starting MCP CV Assistant..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before running again."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please stop the process or change the port."
        return 1
    fi
    return 0
}

# Check required ports
echo "🔍 Checking ports..."
check_port 3000 || exit 1
check_port 3001 || exit 1

# Install dependencies if needed
echo "📦 Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start backend first
echo "🔧 Starting backend server (port 3001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend health
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server (port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to start..."
sleep 5

echo "🎉 MCP CV Assistant is ready!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:3001"
echo "📍 Health:   http://localhost:3001/health"
echo ""
echo "💡 Tips:"
echo "   • Upload a resume to start chatting"
echo "   • Toggle AI mode for smarter responses (requires GROQ_API_KEY)"
echo "   • Configure email service in .env for sending emails"
echo ""
echo "🛑 To stop: Press Ctrl+C"

# Wait for interrupt
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
