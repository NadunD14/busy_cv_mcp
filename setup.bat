@echo off
echo 🚀 Setting up MCP CV Assistant...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd ..\backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)

cd ..

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your email provider credentials
)

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your email provider credentials
echo 2. Run 'npm run dev' in both frontend and backend directories
echo 3. Visit http://localhost:3000 to start using the app
echo.
echo For MCP usage:
echo - Run backend with: cd backend ^&^& npm start -- --mcp
echo - Configure your MCP client to use this server

pause
