#!/bin/bash

# IRIB Digital Workplace - Wizard UI Launcher
# All rights reserved © 2026

echo "=========================================="
echo "IRIB Digital Workplace - Wizard UI"
echo "=========================================="
echo ""

# Check if frontend is running
if ! curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "Frontend is not running. Starting frontend..."
    npx next dev &
    echo "Waiting for frontend to start..."
    sleep 15
fi

echo ""
echo "Opening Wizard UI in browser..."
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3002/wizard
elif command -v open > /dev/null; then
    open http://localhost:3002/wizard
else
    echo "Please open your browser and visit:"
    echo "http://localhost:3002/wizard"
fi

echo ""
echo "=========================================="
echo "Wizard UI is now opening in your browser"
echo "=========================================="
echo ""
