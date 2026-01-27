#!/bin/bash

# Check actual dashboard UIDs in Grafana
echo "🔍 Checking Grafana Dashboard UIDs..."
echo ""

# Fetch all dashboards
DASHBOARDS=$(curl -s -u admin:admin http://localhost:3001/api/search?type=dash-db)

echo "📊 Found Dashboards:"
echo "$DASHBOARDS" | jq -r '.[] | "  UID: \(.uid) | Title: \(.title)"'

echo ""
echo "✅ Use these UIDs in your report-generator.js"
echo ""
echo "Current UIDs in code:"
echo "  - url-shortener-main"
echo "  - url-shortener-analytics"
echo "  - url-shortener-health"
echo ""
echo "Actual UIDs should match the 'uid' values above"