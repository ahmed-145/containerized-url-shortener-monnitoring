#!/bin/bash

# Professional Bonus Dashboards Creation Script
# This creates enterprise-grade Grafana dashboards via API

set -e

GRAFANA_URL="http://localhost:3001"
GRAFANA_USER="admin"
GRAFANA_PASS="admin"

echo "=========================================="
echo "Creating Week 3 Bonus Dashboards"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Verifying Grafana is accessible...${NC}"
if curl -sf "${GRAFANA_URL}/api/health" > /dev/null; then
    echo -e "${GREEN}✓ Grafana is running${NC}"
else
    echo "✗ Error: Grafana is not accessible"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Getting Prometheus datasource UID...${NC}"
DATASOURCE_UID=$(curl -sf -u "${GRAFANA_USER}:${GRAFANA_PASS}" \
    "${GRAFANA_URL}/api/datasources" | \
    jq -r '.[] | select(.type=="prometheus") | .uid')

if [ -z "$DATASOURCE_UID" ]; then
    echo "✗ Error: Could not find Prometheus datasource"
    exit 1
fi

echo -e "${GREEN}✓ Found Prometheus datasource: ${DATASOURCE_UID}${NC}"

echo ""
echo -e "${YELLOW}Step 3: Creating Advanced Analytics Dashboard...${NC}"

# Create Advanced Analytics Dashboard
curl -sf -u "${GRAFANA_USER}:${GRAFANA_PASS}" \
    -X POST "${GRAFANA_URL}/api/dashboards/db" \
    -H "Content-Type: application/json" \
    -d '{
  "dashboard": {
    "title": "URL Shortener - Advanced Analytics",
    "tags": ["url-shortener", "analytics", "bonus"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "gridPos": {"h": 10, "w": 12, "x": 0, "y": 0},
        "type": "timeseries",
        "title": "Top 10 Domains Shortened",
        "targets": [{
          "expr": "topk(10, urls_shortened_by_domain_total)",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
          "legendFormat": "{{domain}}"
        }],
        "fieldConfig": {
          "defaults": {
            "custom": {"drawStyle": "bars", "fillOpacity": 80}
          }
        }
      },
      {
        "id": 2,
        "gridPos": {"h": 10, "w": 12, "x": 12, "y": 0},
        "type": "timeseries",
        "title": "Database Size Growth",
        "targets": [{
          "expr": "database_size_bytes / 1024 / 1024",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
          "legendFormat": "Size (MB)"
        }],
        "fieldConfig": {
          "defaults": {
            "unit": "decmbytes",
            "custom": {"fillOpacity": 20, "lineInterpolation": "smooth"}
          }
        }
      },
      {
        "id": 3,
        "gridPos": {"h": 8, "w": 8, "x": 0, "y": 10},
        "type": "gauge",
        "title": "Click-Through Rate",
        "targets": [{
          "expr": "click_through_rate * 100",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"}
        }],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100,
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 20},
                {"color": "green", "value": 50}
              ]
            }
          }
        }
      },
      {
        "id": 4,
        "gridPos": {"h": 8, "w": 8, "x": 8, "y": 10},
        "type": "stat",
        "title": "Most Popular URL (Clicks)",
        "targets": [{
          "expr": "most_clicked_url_clicks",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"}
        }],
        "options": {
          "graphMode": "area",
          "colorMode": "value"
        }
      },
      {
        "id": 5,
        "gridPos": {"h": 8, "w": 8, "x": 16, "y": 10},
        "type": "stat",
        "title": "Oldest URL Age",
        "targets": [{
          "expr": "oldest_url_age_seconds",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"}
        }],
        "fieldConfig": {
          "defaults": {
            "unit": "s"
          }
        },
        "options": {
          "graphMode": "area",
          "colorMode": "value"
        }
      },
      {
        "id": 6,
        "gridPos": {"h": 10, "w": 24, "x": 0, "y": 18},
        "type": "timeseries",
        "title": "Request Rate: Success vs Failure",
        "targets": [
          {
            "expr": "rate(successful_redirects_total[1m])",
            "refId": "A",
            "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
            "legendFormat": "Successful"
          },
          {
            "expr": "rate(failed_lookups_total[1m])",
            "refId": "B",
            "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
            "legendFormat": "Failed"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "custom": {
              "fillOpacity": 30,
              "stacking": {"mode": "normal"}
            }
          },
          "overrides": [
            {
              "matcher": {"id": "byName", "options": "Successful"},
              "properties": [{"id": "color", "value": {"fixedColor": "green", "mode": "fixed"}}]
            },
            {
              "matcher": {"id": "byName", "options": "Failed"},
              "properties": [{"id": "color", "value": {"fixedColor": "red", "mode": "fixed"}}]
            }
          ]
        }
      },
      {
        "id": 7,
        "gridPos": {"h": 10, "w": 24, "x": 0, "y": 28},
        "type": "timeseries",
        "title": "Requests by Hour of Day",
        "targets": [{
          "expr": "requests_by_hour_total",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
          "legendFormat": "Hour {{hour}}"
        }],
        "fieldConfig": {
          "defaults": {
            "custom": {
              "drawStyle": "bars",
              "fillOpacity": 70
            }
          }
        }
      }
    ],
    "refresh": "10s",
    "time": {"from": "now-1h", "to": "now"}
  },
  "overwrite": true
}' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Advanced Analytics Dashboard created${NC}"
else
    echo "✗ Failed to create Advanced Analytics Dashboard"
fi

echo ""
echo -e "${YELLOW}Step 4: Creating System Health Dashboard...${NC}"

# Create System Health Dashboard
curl -sf -u "${GRAFANA_USER}:${GRAFANA_PASS}" \
    -X POST "${GRAFANA_URL}/api/dashboards/db" \
    -H "Content-Type: application/json" \
    -d '{
  "dashboard": {
    "title": "URL Shortener - System Health",
    "tags": ["url-shortener", "system", "health", "bonus"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "gridPos": {"h": 8, "w": 6, "x": 0, "y": 0},
        "type": "stat",
        "title": "Active Connections",
        "targets": [{
          "expr": "active_connections",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"}
        }],
        "options": {
          "graphMode": "area",
          "colorMode": "value"
        },
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 5},
                {"color": "red", "value": 10}
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "gridPos": {"h": 8, "w": 6, "x": 6, "y": 0},
        "type": "stat",
        "title": "Database Size",
        "targets": [{
          "expr": "database_size_bytes / 1024 / 1024",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"}
        }],
        "fieldConfig": {
          "defaults": {
            "unit": "decmbytes"
          }
        },
        "options": {
          "graphMode": "area",
          "colorMode": "value"
        }
      },
      {
        "id": 3,
        "gridPos": {"h": 8, "w": 6, "x": 12, "y": 0},
        "type": "stat",
        "title": "P99 Latency",
        "targets": [{
          "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) * 1000",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"}
        }],
        "fieldConfig": {
          "defaults": {
            "unit": "ms",
            "thresholds": {
              "steps": [
                {"color": "green", "value": 0},
                {"color": "yellow", "value": 200},
                {"color": "red", "value": 500}
              ]
            }
          }
        },
        "options": {
          "graphMode": "area",
          "colorMode": "value"
        }
      },
      {
        "id": 4,
        "gridPos": {"h": 8, "w": 6, "x": 18, "y": 0},
        "type": "stat",
        "title": "Service Status",
        "targets": [{
          "expr": "up{job=\"url-shortener-backend\"}",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"}
        }],
        "options": {
          "graphMode": "none",
          "colorMode": "background"
        },
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {
                "type": "value",
                "options": {
                  "0": {"text": "DOWN", "color": "red"},
                  "1": {"text": "UP", "color": "green"}
                }
              }
            ]
          }
        }
      },
      {
        "id": 5,
        "gridPos": {"h": 10, "w": 12, "x": 0, "y": 8},
        "type": "timeseries",
        "title": "Request Latency Percentiles",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) * 1000",
            "refId": "A",
            "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
            "legendFormat": "P50 (Median)"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) * 1000",
            "refId": "B",
            "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) * 1000",
            "refId": "C",
            "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
            "legendFormat": "P99"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "ms",
            "custom": {
              "fillOpacity": 20,
              "lineInterpolation": "smooth"
            }
          }
        }
      },
      {
        "id": 6,
        "gridPos": {"h": 10, "w": 12, "x": 12, "y": 8},
        "type": "timeseries",
        "title": "Active Connections Over Time",
        "targets": [{
          "expr": "active_connections",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
          "legendFormat": "Connections"
        }],
        "fieldConfig": {
          "defaults": {
            "custom": {
              "fillOpacity": 10,
              "lineInterpolation": "smooth"
            }
          }
        }
      },
      {
        "id": 7,
        "gridPos": {"h": 10, "w": 24, "x": 0, "y": 18},
        "type": "timeseries",
        "title": "Request Throughput",
        "targets": [{
          "expr": "rate(http_request_duration_seconds_count[1m])",
          "refId": "A",
          "datasource": {"type": "prometheus", "uid": "'"${DATASOURCE_UID}"'"},
          "legendFormat": "Requests/sec"
        }],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "custom": {
              "fillOpacity": 10,
              "lineInterpolation": "smooth"
            }
          }
        }
      }
    ],
    "refresh": "10s",
    "time": {"from": "now-30m", "to": "now"}
  },
  "overwrite": true
}' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ System Health Dashboard created${NC}"
else
    echo "✗ Failed to create System Health Dashboard"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Bonus Dashboards Created Successfully!${NC}"
echo "=========================================="
echo ""
echo "Access your dashboards at:"
echo "  • Main Dashboard:       ${GRAFANA_URL}/dashboards"
echo "  • Advanced Analytics:   Search for 'Advanced Analytics'"
echo "  • System Health:        Search for 'System Health'"
echo ""
echo "Total Dashboards: 3 (1 core + 2 bonus)"
echo ""