#!/bin/bash

echo "=== Quick Load Test ==="
echo '{"url":"https://example.com/test"}' > /tmp/post_data.json

echo "Test 1: Light load (10 concurrent)"
ab -n 1000 -c 10 -p /tmp/post_data.json -T application/json \
   http://localhost:3000/api/shorten 2>/dev/null | grep "Requests per second"

echo ""
echo "Test 2: Moderate load (50 concurrent)"
ab -n 5000 -c 50 -p /tmp/post_data.json -T application/json \
   http://localhost:3000/api/shorten 2>/dev/null | grep "Requests per second"

rm /tmp/post_data.json
echo ""
echo "✅ Load test complete"