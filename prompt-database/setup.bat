@echo off
REM Prompt Database Setup Script for Windows
REM This script automates the setup process for new developers

echo ======================================
echo   Prompt Database Setup Script
echo ======================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js v18 or higher.
    echo   Visit: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=2 delims=v." %%a in ('node --version') do set NODE_MAJOR=%%a
if %NODE_MAJOR% lss 18 (
    echo X Node.js version is too old. Please upgrade to v18 or higher.
    node --version
    pause
    exit /b 1
)

node --version
echo OK Node.js detected
echo.

REM Check npm
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X npm is not installed. It should come with Node.js.
    pause
    exit /b 1
)

npm --version
echo OK npm detected
echo.

REM Install dependencies
echo Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install dependencies
    pause
    exit /b 1
)
echo OK Dependencies installed successfully
echo.

REM Run type checking
echo Running type checking...
call npm run typecheck
if %errorlevel% neq 0 (
    echo WARNING: TypeScript found some issues. This is normal for development.
    echo          You can still run the application.
)
echo.

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating .env.local file...
    type nul > .env.local
    echo OK Created .env.local
    echo.
)

echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo The application will be available at:
echo   http://localhost:5173
echo.
echo For more information, see README.md
echo.
pause