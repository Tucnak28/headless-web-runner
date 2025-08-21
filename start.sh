#!/bin/bash

echo "========================================"
echo "   Headless Web Runner - Easy Start"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Or on Ubuntu/Debian: sudo apt install nodejs npm"
    echo "Or on Arch Linux: sudo pacman -S nodejs npm"
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies... This may take a few minutes."
    npm run install:all
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies!"
        exit 1
    fi
    echo "Dependencies installed successfully!"
    echo ""
fi

# Start the application
echo "Starting Headless Web Runner..."
echo ""
echo "The application will start two services:"
echo "- Backend Server: http://localhost:3001"
echo "- Frontend Dashboard: http://localhost:3000"
echo ""
echo "The dashboard will automatically open in your default browser."
echo "Press Ctrl+C to stop both services when you're done."
echo ""

# Try to open browser (works on most Linux desktop environments)
if command -v xdg-open &> /dev/null; then
    sleep 3 && xdg-open http://localhost:3000 &
elif command -v gnome-open &> /dev/null; then
    sleep 3 && gnome-open http://localhost:3000 &
fi

npm run dev