#!/bin/bash

# Prompt Database Setup Script
# This script automates the setup process for new developers

echo "======================================"
echo "  Prompt Database Setup Script"
echo "======================================"
echo ""

# Check Node.js version
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old. Please upgrade to v18 or higher."
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Check npm version
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. It should come with Node.js."
    exit 1
fi
echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed successfully"

# Run type checking
echo ""
echo "Running type checking..."
npm run typecheck

if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript found some issues. This is normal for development."
    echo "   You can still run the application."
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "Creating .env.local file..."
    touch .env.local
    echo "✅ Created .env.local"
fi

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  http://localhost:5173"
echo ""
echo "For more information, see README.md"