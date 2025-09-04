@echo off
:: MCP CV Assistant Startup Script for Windows

echo 🚀 Starting MCP CV Assistant...

:: Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Copying from .env.example...
    copy .env.example .env
    echo 📝 Please edit .env file with your API keys before running again.
    pause
    exit /b 1
)

:: Check if node_modules exist
echo 📦 Checking dependencies...

if not exist backend\node_modules (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist frontend\node_modules (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

:: Start backend
echo 🔧 Starting backend server (port 3001)...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

:: Wait for backend
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

:: Start frontend
echo 🎨 Starting frontend server (port 3000)...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

:: Wait for frontend
echo ⏳ Waiting for frontend to start...
timeout /t 5 /nobreak > nul

echo 🎉 MCP CV Assistant is ready!
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:3001
echo 📍 Health:   http://localhost:3001/health
echo.
echo 💡 Tips:
echo    • Upload a resume to start chatting
echo    • Toggle AI mode for smarter responses (requires GROQ_API_KEY)
echo    • Configure email service in .env for sending emails
echo.
echo 🛑 To stop: Close the terminal windows or press Ctrl+C in each

pause
