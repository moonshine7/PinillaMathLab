#!/bin/bash
# Quick start script for Math Dashboard

echo "=================================="
echo "7th Grade Math Dashboard Setup"
echo "=================================="
echo ""

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 Installing Flask..."
    pip3 install -r requirements.txt
else
    echo "✓ Flask already installed"
fi

echo ""
echo "🚀 Starting server..."
echo ""

python3 app.py
