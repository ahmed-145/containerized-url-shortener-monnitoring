#!/bin/bash

echo "🧪 Testing Grafana Renderer..."
echo ""

# Test renderer directly
echo "1. Testing renderer endpoint..."
curl -s -I http://localhost:8081/render/version
echo ""

# Test Grafana render API
echo "2. Testing Grafana render API..."
curl -s -u admin:admin -I "http://localhost:3001/render/d-solo/url-shortener-main?width=1200&height=600&theme=dark"
echo ""

# Try to download a test image
echo "3. Downloading test snapshot..."
curl -s -u admin:admin "http://localhost:3001/render/d-solo/url-shortener-main?width=1200&height=600&theme=dark" -o test_snapshot.png

if [ -f test_snapshot.png ]; then
    SIZE=$(stat -f%z test_snapshot.png 2>/dev/null || stat -c%s test_snapshot.png 2>/dev/null)
    echo "✅ Downloaded test_snapshot.png ($SIZE bytes)"
    
    # Check if it's actually a PNG
    if file test_snapshot.png | grep -q PNG; then
        echo "✅ File is a valid PNG image"
        echo ""
        echo "Try opening it: xdg-open test_snapshot.png"
    else
        echo "❌ File is NOT a valid PNG"
        echo "File type:"
        file test_snapshot.png
        echo ""
        echo "First 100 bytes:"
        head -c 100 test_snapshot.png
    fi
else
    echo "❌ Failed to download snapshot"
fi