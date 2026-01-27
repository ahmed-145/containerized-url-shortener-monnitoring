#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   AI-Powered Report Generator Test Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if AI reporter service is running
echo -e "${YELLOW}1. Checking AI Reporter service...${NC}"
if docker ps | grep -q "url-shortener-ai-reporter"; then
    echo -e "${GREEN}✅ AI Reporter service is running${NC}"
else
    echo -e "${RED}❌ AI Reporter service is not running${NC}"
    echo -e "${YELLOW}Starting services...${NC}"
    docker compose up -d ai-reporter
    sleep 10
fi

# Check health
echo ""
echo -e "${YELLOW}2. Checking service health...${NC}"
HEALTH=$(curl -s http://localhost:4000/health | jq -r '.status' 2>/dev/null || echo "unhealthy")
if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✅ Service is healthy${NC}"
else
    echo -e "${RED}❌ Service is not healthy${NC}"
    exit 1
fi

# Check Cerebras API configuration
CEREBRAS_CONFIGURED=$(curl -s http://localhost:4000/health | jq -r '.cerebras_api_configured' 2>/dev/null || echo "false")
if [ "$CEREBRAS_CONFIGURED" = "true" ]; then
    echo -e "${GREEN}✅ Cerebras API key is configured${NC}"
    AI_MODEL=$(curl -s http://localhost:4000/health | jq -r '.model' 2>/dev/null || echo "unknown")
    echo -e "${GREEN}   Model: $AI_MODEL${NC}"
else
    echo -e "${RED}❌ Cerebras API key is NOT configured${NC}"
    echo -e "${YELLOW}Please set CEREBRAS_API_KEY environment variable:${NC}"
    echo -e "   export CEREBRAS_API_KEY='csk-2cvh4kc9f58wwr4he68mtdhp23vmkmwhjnfcmcyvprvttyve'"
    echo -e "   docker compose up -d ai-reporter"
    exit 1
fi

# Generate some test traffic first
echo ""
echo -e "${YELLOW}3. Generating test traffic for meaningful metrics...${NC}"
for i in {1..20}; do
    curl -s -X POST http://localhost:3000/api/shorten \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"https://example.com/test-$i\"}" > /dev/null
    
    if [ $((i % 5)) -eq 0 ]; then
        echo -e "${GREEN}   Created $i test URLs...${NC}"
    fi
done

# Generate some redirects
echo -e "${GREEN}   Generating redirect traffic...${NC}"
for i in {1..10}; do
    RANDOM_CODE=$(curl -s http://localhost:3000/api/urls | jq -r '.urls[0].short_code' 2>/dev/null || echo "test")
    curl -s -L http://localhost:3000/$RANDOM_CODE > /dev/null 2>&1 || true
done

echo -e "${GREEN}✅ Test traffic generated${NC}"

# Wait for metrics to stabilize
echo ""
echo -e "${YELLOW}4. Waiting for metrics to stabilize (10 seconds)...${NC}"
sleep 10

# Trigger report generation
echo ""
echo -e "${YELLOW}5. Generating AI-powered report...${NC}"
echo -e "${BLUE}   This may take 30-60 seconds...${NC}"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:4000/api/reports/generate)

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Report generated successfully!${NC}"
    echo ""
    
    FILENAME=$(echo "$RESPONSE" | jq -r '.report.filename')
    GENERATED_AT=$(echo "$RESPONSE" | jq -r '.report.generated_at')
    
    echo -e "${BLUE}Report Details:${NC}"
    echo -e "  Filename: ${GREEN}$FILENAME${NC}"
    echo -e "  Generated: ${GREEN}$GENERATED_AT${NC}"
    echo ""
    
    # Show metrics summary
    echo -e "${BLUE}Metrics Summary:${NC}"
    echo "$RESPONSE" | jq -r '.metrics | to_entries[] | "  \(.key): \(.value)"'
    echo ""
    
    # Show analysis preview
    echo -e "${BLUE}AI Analysis Preview:${NC}"
    echo "$RESPONSE" | jq -r '.analysis_preview'
    echo ""
    
    # Download report
    echo -e "${YELLOW}6. Downloading report...${NC}"
    curl -s -O "http://localhost:4000/api/reports/download/$FILENAME"
    
    if [ -f "$FILENAME" ]; then
        SIZE=$(ls -lh "$FILENAME" | awk '{print $5}')
        echo -e "${GREEN}✅ Report downloaded: $FILENAME ($SIZE)${NC}"
        echo ""
        echo -e "${BLUE}Open report with: xdg-open $FILENAME${NC}"
        echo -e "${BLUE}Or macOS: open $FILENAME${NC}"
    fi
    
    # List all reports
    echo ""
    echo -e "${YELLOW}7. All available reports:${NC}"
    curl -s http://localhost:4000/api/reports | jq -r '.reports[] | "  - \(.filename)"'
    
else
    echo -e "${RED}❌ Report generation failed${NC}"
    echo "$RESPONSE" | jq '.'
    exit 1
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Test completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"