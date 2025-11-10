want a docs of everything we did in this chat i already have one for week 2 here it is want one the same



# URL Shortener - Week 2 Documentation
# Prometheus Metrics Instrumentation

**DEPI Graduation Project | Week 2 Deliverable**  
**Date:** October 24, 2025  
**Team:** Ahmed Mahmoud, Mohamed Abd ElKader, Tasnim, Ahmed Hany, Mohamed Ashraf

---

## 📋 Table of Contents

1. [Week 2 Overview](#week-2-overview)
2. [Objectives & Achievements](#objectives--achievements)
3. [Technical Implementation](#technical-implementation)
4. [Metrics Documentation](#metrics-documentation)
5. [Frontend Dashboard](#frontend-dashboard)
6. [Prometheus Configuration](#prometheus-configuration)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting & Solutions](#troubleshooting--solutions)
9. [Performance Analysis](#performance-analysis)
10. [Commit History](#commit-history)

---

## 🎯 Week 2 Overview

### Mission Statement
Instrument the URL shortener service with comprehensive Prometheus metrics to enable real-time monitoring, performance analysis, and business intelligence tracking.

### Timeline
**Start Date:** October 20, 2025  
**End Date:** October 24, 2025  
**Duration:** 5 days  
**Status:** ✅ **COMPLETE** (100% + All Bonuses)

### Team Effort Distribution

| Team Member | Role | Contribution | Hours |
|-------------|------|--------------|-------|
| **Ahmed Mahmoud** | Backend & Metrics Lead | Prometheus integration, custom metrics, bug fixes | 15h |
| **Mohamed Abd ElKader** | Infrastructure | Docker configuration, volume management | 8h |
| **Tasnim** | Frontend Dashboard | Real-time metrics UI, visualizations | 10h |
| **Ahmed Hany** | Quality Assurance | Testing, validation, debugging | 8h |
| **Mohamed Ashraf** | Documentation | README updates, guides, documentation | 6h |

**Total Team Effort:** 47 hours

---

## ✅ Objectives & Achievements

### Core Requirements (Week 2)

| Requirement | Status | Completion |
|-------------|--------|------------|
| Install Prometheus client library (prom-client) | ✅ | 100% |
| Add `/metrics` endpoint | ✅ | 100% |
| Implement counter: URLs shortened | ✅ | 100% |
| Implement counter: Successful redirects | ✅ | 100% |
| Implement counter: Failed lookups (404s) | ✅ | 100% |
| Implement histogram: Request latency | ✅ | 100% |
| Create prometheus.yml configuration | ✅ | 100% |
| Add Prometheus to docker-compose.yml | ✅ | 100% |
| Test metrics visibility in Prometheus UI | ✅ | 100% |

**Core Requirements:** ✅ **9/9 Complete (100%)**

### Bonus Features Implemented

| Bonus Feature | Impact | Status | Completion |
|---------------|--------|--------|------------|
| Custom Business Metrics (domains, hourly) | ⭐⭐⭐ High | ✅ | 100% |
| Real-time Metrics Dashboard on Frontend | ⭐⭐⭐ High | ✅ | 100% |
| Metrics Export to JSON | ⭐⭐ Medium | ✅ | 100% |
| Custom Prometheus Exporter (DB metrics) | ⭐⭐⭐ High | ✅ | 100% |
| Multi-stage Docker Builds (optimization) | ⭐⭐ Medium | ✅ | 100% |

**Bonus Features:** ✅ **5/5 Complete (100%)**

### Additional Achievements

✅ **Bug Fixes & Improvements:**
- Fixed database initialization timing issues
- Resolved timezone display bugs in frontend
- Added CORS headers for browser metrics access
- Implemented proper error handling for metrics failures
- Optimized gauge update intervals

✅ **Beyond Requirements:**
- 8 additional custom metrics (beyond the 4 required)
- Beautiful animated frontend dashboard
- Auto-refresh functionality (10-second interval)
- Top domains visualization with bar charts
- Connection status monitoring
- Manual refresh capability

---

## 🔧 Technical Implementation

### Architecture Changes (Week 1 → Week 2)

**Before (Week 1):**
```
Frontend ←→ Backend ←→ Database
```

**After (Week 2):**
```
┌─────────────┐
│  Frontend   │
│  + Dashboard│ ← New real-time metrics UI
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │
│ + /metrics  │ ← New Prometheus endpoint
│ + counters  │ ← 4 core + 8 bonus metrics
│ + histogram │
└──────┬──────┘
       │
       ├─────→ Database (SQLite)
       │
       └─────→ Prometheus ← New monitoring service
                (scrapes /metrics every 10s)
```

### Technology Stack Additions

| Component | Version | Purpose |
|-----------|---------|---------|
| **prom-client** | 15.1.0 | Node.js Prometheus client library |
| **Prometheus** | latest | Metrics collection and storage |
| **Docker Volume** | - | Prometheus data persistence |

---

## 📊 Metrics Documentation

### Metrics Hierarchy

```
Application Metrics
├── Core Metrics (Required)
│   ├── urls_shortened_total
│   ├── successful_redirects_total
│   ├── failed_lookups_total
│   └── http_request_duration_seconds
│
├── Business Metrics (Bonus)
│   ├── urls_shortened_by_domain_total
│   ├── requests_by_hour_total
│   ├── total_urls_in_database
│   └── click_through_rate
│
├── Database Metrics (Bonus)
│   ├── database_size_bytes
│   ├── oldest_url_age_seconds
│   └── most_clicked_url_clicks
│
└── System Metrics (Default)
    ├── process_cpu_user_seconds_total
    ├── process_resident_memory_bytes
    └── nodejs_heap_size_total_bytes
```

### Core Metrics (Required)

#### 1. urls_shortened_total
**Type:** Counter  
**Description:** Total number of URLs shortened since service start  
**Labels:** None  
**Incremented:** On successful POST `/api/shorten` and bulk operations

**Example:**
```promql
# Current total
urls_shortened_total

# Rate per minute
rate(urls_shortened_total[1m]) * 60

# Total in last hour
increase(urls_shortened_total[1h])
```

**Use Cases:**
- Measure user engagement
- Track link effectiveness
- Compare campaign performance
- Business KPI tracking

---

### Database Metrics (Bonus)

#### 9. database_size_bytes
**Type:** Gauge  
**Description:** Size of SQLite database file in bytes  
**Labels:** None  
**Updated:** Every 30 seconds via filesystem check

**Example:**
```promql
# Size in MB
database_size_bytes / 1024 / 1024

# Growth rate (bytes per second)
rate(database_size_bytes[5m])

# Growth per hour (MB)
rate(database_size_bytes[5m]) * 3600 / 1024 / 1024
```

**Use Cases:**
- Disk space monitoring
- Capacity planning
- Detect unexpected growth

---

#### 10. oldest_url_age_seconds
**Type:** Gauge  
**Description:** Age of the oldest URL in database (in seconds)  
**Labels:** None  
**Updated:** Every 30 seconds via database query

**Example:**
```promql
# Age in hours
oldest_url_age_seconds / 3600

# Age in days
oldest_url_age_seconds / 86400

# Data retention insight
oldest_url_age_seconds
```

**Use Cases:**
- Data retention tracking
- Historical data analysis
- Service uptime indicator

---

#### 11. most_clicked_url_clicks
**Type:** Gauge  
**Description:** Click count of the most popular URL  
**Labels:** None  
**Updated:** Every 30 seconds via database query

**Example:**
```promql
# Most popular link clicks
most_clicked_url_clicks

# Popularity growth
rate(most_clicked_url_clicks[5m]) * 60
```

**Use Cases:**
- Identify viral content
- Track popular links
- Marketing insights

---

#### 12. active_connections
**Type:** Gauge  
**Description:** Number of currently active HTTP connections  
**Labels:** None  
**Updated:** Real-time (incremented on request start, decremented on end)

**Example:**
```promql
# Current active connections
active_connections

# Peak connections
max_over_time(active_connections[1h])

# Average connections
avg_over_time(active_connections[5m])
```

**Use Cases:**
- Load monitoring
- Capacity planning
- Detect traffic spikes

---

## 🎨 Frontend Dashboard

### Dashboard Architecture

```
Frontend (app.js)
├── Metrics Fetching
│   ├── fetch('http://localhost:3000/metrics')
│   ├── Parse Prometheus text format
│   └── Extract metric values
│
├── DOM Updates
│   ├── Update metric cards (6 cards)
│   ├── Update top domains chart
│   └── Update status indicators
│
└── Auto-refresh
    ├── Initial fetch on page load
    ├── setInterval(10 seconds)
    └── Manual refresh button
```

### Dashboard Components

#### 1. Metric Cards (6 Total)

**Card 1: Total URLs**
- **Metric:** `total_urls_in_database`
- **Format:** Number with commas (e.g., "46")
- **Icon:** 🔗
- **Color:** Blue gradient

**Card 2: Successful Redirects**
- **Metric:** `successful_redirects_total`
- **Format:** Number with commas
- **Icon:** ✅
- **Color:** Green

**Card 3: Failed Lookups**
- **Metric:** `failed_lookups_total`
- **Format:** Number with commas
- **Icon:** ❌
- **Color:** Red

**Card 4: Average Latency**
- **Metric:** Calculated from histogram (sum/count)
- **Format:** Decimal (e.g., "5.23 ms")
- **Icon:** ⚡
- **Color:** Yellow

**Card 5: Click-Through Rate**
- **Metric:** `click_through_rate`
- **Format:** Percentage (e.g., "19.57%")
- **Icon:** 📈
- **Color:** Purple

**Card 6: Active Connections**
- **Metric:** `active_connections`
- **Format:** Number
- **Icon:** 🔄
- **Color:** Teal

#### 2. Top Domains Chart

**Features:**
- Displays top 5 domains by URL count
- Animated horizontal bar chart
- Percentage-based bar widths
- Real-time updates
- Hover effects

**Data Source:**
```javascript
// Extract from metrics
urls_shortened_by_domain_total{domain="github.com"} 3
urls_shortened_by_domain_total{domain="google.com"} 2
urls_shortened_by_domain_total{domain="stackoverflow.com"} 1
```

**Visualization:**
```
github.com         [████████████] 3
google.com         [████████    ] 2
stackoverflow.com  [████        ] 1
```

#### 3. Status Indicators

**Connection Status:**
- 🟢 **Connected** - Metrics fetched successfully
- 🔴 **Disconnected** - Fetch failed
- Animated pulse effect

**Last Updated:**
- Timestamp of last successful fetch
- Format: "9:20:13 PM"
- Updates every 10 seconds

**Refresh Button:**
- Manual refresh trigger
- Loading animation on click
- Disabled state during fetch

---

### Dashboard Implementation

#### Metrics Parsing Function

```javascript
function parsePrometheusMetrics(metricsText) {
  const lines = metricsText.split('\n');
  
  function getMetricValue(metricName) {
    const line = lines.find(l => l.startsWith(metricName + ' '));
    if (!line) return 0;
    const match = line.match(/\s+([\d.]+)$/);
    return match ? parseFloat(match[1]) : 0;
  }
  
  return {
    totalUrls: getMetricValue('total_urls_in_database'),
    redirects: getMetricValue('successful_redirects_total'),
    failures: getMetricValue('failed_lookups_total'),
    // ... more metrics
  };
}
```

#### Auto-refresh Implementation

```javascript
function initializeMetricsDashboard() {
  // Initial fetch
  updateMetrics();
  
  // Auto-refresh every 10 seconds
  setInterval(updateMetrics, 10000);
  
  // Manual refresh button
  refreshBtn.addEventListener('click', updateMetrics);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMetricsDashboard);
} else {
  initializeMetricsDashboard();
}
```

#### Error Handling

```javascript
async function updateMetrics() {
  try {
    const response = await fetch('http://localhost:3000/metrics');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Parse and update DOM
    // ...
    
    // Update status to connected
    statusElement.innerHTML = '<span class="status-indicator"></span> Connected';
    
  } catch (error) {
    console.error('Metrics error:', error);
    
    // Update status to error
    statusElement.innerHTML = '<span class="status-indicator error"></span> Error: ' + error.message;
  }
}
```

---

## ⚙️ Prometheus Configuration

### prometheus.yml

**Location:** `prometheus/prometheus.yml`

**Configuration:**
```yaml
global:
  scrape_interval: 15s      # Default scrape interval
  evaluation_interval: 15s  # Rule evaluation interval
  external_labels:
    monitor: 'url-shortener-monitor'
    environment: 'production'

scrape_configs:
  - job_name: 'url-shortener-backend'
    scrape_interval: 10s    # Override: scrape every 10s
    scrape_timeout: 5s      # Timeout after 5s
    
    static_configs:
      - targets: ['backend:3000']
        labels:
          service: 'url-shortener'
          component: 'backend-api'
    
    metric_relabel_configs:
      # Drop noisy go_ metrics (not applicable but good practice)
      - source_labels: [__name__]
        regex: 'go_.*'
        action: drop

  # Prometheus self-monitoring
  - job_name: 'prometheus'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:9090']
        labels:
          service: 'monitoring'
          component: 'prometheus'
```

**Key Settings:**
- **scrape_interval: 10s** - Backend scraped every 10 seconds for real-time data
- **targets: backend:3000** - Uses Docker service name for networking
- **labels** - Additional metadata for filtering
- **retention: 30d** - Data kept for 30 days (configured in docker-compose)

---

### Docker Compose Configuration

**prometheus service:**
```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: url-shortener-prometheus
  restart: unless-stopped
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--storage.tsdb.retention.time=30d'  # 30 days retention
    - '--web.enable-lifecycle'             # Enable API reload
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    - prometheus-data:/prometheus          # Persistent storage
  networks:
    - url-shortener-network
  depends_on:
    backend:
      condition: service_healthy           # Wait for backend
  healthcheck:
    test: ["CMD", "wget", "--spider", "http://localhost:9090/-/healthy"]
    interval: 30s
    timeout: 10s
    retries: 3
```

---

## 🧪 Testing & Verification

### Testing Checklist

#### Backend Metrics Tests

- [x] **Health Check**
  ```bash
  curl http://localhost:3000/health
  # Expected: {"status":"healthy",...}
  ```

- [x] **Metrics Endpoint Accessible**
  ```bash
  curl http://localhost:3000/metrics
  # Expected: Prometheus text format output
  ```

- [x] **CORS Headers Present**
  ```bash
  curl -I http://localhost:3000/metrics
  # Expected: Access-Control-Allow-Origin: *
  ```

- [x] **URLs Shortened Counter**
  ```bash
  # Create URL
  curl -X POST http://localhost:3000/api/shorten \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com"}'
  
  # Check metric
  curl http://localhost:3000/metrics | grep urls_shortened_total
  # Expected: urls_shortened_total incremented
  ```

- [x] **Redirect Counter**
  ```bash
  # Visit short URL
  curl -L http://localhost:3000/abc123
  
  # Check metric
  curl http://localhost:3000/metrics | grep successful_redirects_total
  # Expected: Counter incremented
  ```

- [x] **404 Counter**
  ```bash
  # Try non-existent code
  curl http://localhost:3000/nonexistent
  
  # Check metric
  curl http://localhost:3000/metrics | grep failed_lookups_total
  # Expected: Counter incremented
  ```

- [x] **Latency Histogram**
  ```bash
  curl http://localhost:3000/metrics | grep http_request_duration_seconds
  # Expected: bucket, sum, and count metrics
  ```

- [x] **Domain Tracking**
  ```bash
  # Create URLs from different domains
  curl -X POST http://localhost:3000/api/shorten \
    -H "Content-Type: application/json" \
    -d '{"url":"https://github.com"}'
  
  # Check metric
  curl http://localhost:3000/metrics | grep urls_shortened_by_domain_total
  # Expected: urls_shortened_by_domain_total{domain="github.com"} 1
  ```

- [x] **Gauge Updates**
  ```bash
  # Wait 30 seconds for gauge update
  sleep 30
  
  # Check gauges
  curl http://localhost:3000/metrics | grep -E "(total_urls_in_database|click_through_rate)"
  # Expected: Gauges show current values
  ```

- [x] **JSON Export**
  ```bash
  curl http://localhost:3000/api/metrics/json | jq '.timestamp'
  # Expected: JSON with timestamp and metrics
  ```

#### Prometheus Tests

- [x] **Prometheus Running**
  ```bash
  docker ps | grep prometheus
  # Expected: Container status "Up (healthy)"
  ```

- [x] **Prometheus UI Accessible**
  ```bash
  curl http://localhost:9090
  # Expected: HTML response
  ```

- [x] **Target Status**
  ```
  Open: http://localhost:9090/targets
  Expected: url-shortener-backend state = UP
  ```

- [x] **Metrics Visible in Prometheus**
  ```
  Open: http://localhost:9090/graph
  Query: urls_shortened_total
  Expected: Data points visible
  ```

- [x] **PromQL Queries Work**
  ```promql
  # Test various queries
  rate(urls_shortened_total[5m])
  histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
  topk(5, urls_shortened_by_domain_total)
  
  Expected: All queries return data
  ```

#### Frontend Dashboard Tests

- [x] **Dashboard Loads**
  ```
  Open: http://localhost:8080
  Expected: Metrics section visible with 6 cards
  ```

- [x] **Metrics Display Data**
  ```
  Expected: All 6 cards show numbers (not "-" or "Error")
  ```

- [x] **Auto-refresh Works**
  ```
  1. Note current values
  2. Create a new URL
  3. Wait 10 seconds
  4. Expected: Values update automatically
  ```

- [x] **Manual Refresh Works**
  ```
  1. Click "Refresh" button
  2. Expected: Button shows loading state
  3. Expected: Metrics update immediately
  ```

- [x] **Top Domains Chart**
  ```
  Expected: Shows list of domains with bar charts
  OR: "No domain data yet" message
  ```

- [x] **Status Indicator**
  ```
  Expected: Green dot + "Connected"
  ```

- [x] **Last Updated Timestamp**
  ```
  Expected: Shows current time, updates every 10s
  ```

- [x] **Responsive Design**
  ```
  Test on mobile viewport
  Expected: Cards stack vertically, readable on small screens
  ```

---

### Test Results Summary

**Backend Tests:** ✅ 10/10 passed  
**Prometheus Tests:** ✅ 5/5 passed  
**Frontend Tests:** ✅ 8/8 passed  
**Total:** ✅ **23/23 passed (100%)**

---

## 🐛 Troubleshooting & Solutions

### Issue 1: Backend Container Unhealthy

**Symptom:**
```
Container url-shortener-backend is unhealthy
```

**Root Cause:**
Database `db` was accessed before initialization completed.

**Error Message:**
```javascript
ReferenceError: Cannot access 'db' before initialization
    at updateGaugeMetrics (/app/server.js:118:3)
```

**Solution:**
Move gauge update functions inside database initialization callback:

```javascript
// BEFORE (Wrong)
updateGaugeMetrics();  // Called before db ready
setInterval(updateGaugeMetrics, 30000);

const db = new sqlite3.Database(DB_PATH, ...);

// AFTER (Correct)
const db = new sqlite3.Database(DB_PATH, ...);

db.run('CREATE TABLE...', (err) => {
  if (!err) {
    // NOW call after DB is ready
    updateGaugeMetrics();
    setInterval(updateGaugeMetrics, 30000);
  }
});
```

**Prevention:**
Always initialize databases before using them. Use callbacks or async/await for proper sequencing.

---

### Issue 2: Dashboard Frozen (Showing "-" values)

**Symptom:**
Metrics dashboard shows "-" for all values, never updates.

**Root Cause:**
JavaScript executed before DOM elements loaded, `getElementById()` returned `null`.

**Error Message:**
```
Metrics dashboard elements not found - skipping auto-refresh
```

**Solution:**
Wrap initialization in DOM ready check:

```javascript
// BEFORE (Wrong)
if (document.getElementById('totalUrlsMetric')) {
  startMetricsAutoRefresh();  // Might run too early
}

// AFTER (Correct)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMetricsDashboard);
} else {
  initializeMetricsDashboard();  // DOM already ready
}
```

**Prevention:**
Always check `document.readyState` before DOM manipulation.

---

### Issue 3: Incorrect Time Display ("3h ago" for recent URLs)

**Symptom:**
URLs created 1 minute ago show "3h ago" in the dashboard.

**Root Cause:**
SQLite stores UTC timestamps, JavaScript parsed them as local time (EEST UTC+3).

**Calculation:**
```
Database: 2025-10-24 18:22:09 (UTC)
Parsed as: 2025-10-24 18:22:09 (EEST = UTC+3)
Actual time difference: 3 hours off!
```

**Solution:**
Append ' UTC' when parsing timestamps:

```javascript
// BEFORE (Wrong)
const date = new Date(dateString);  // Parsed as local time

// AFTER (Correct)
const date = new Date(dateString + ' UTC');  // Parsed as UTC
```

**Prevention:**
Always be explicit about timezones. Store timestamps with timezone info or document the timezone used.

---

### Issue 4: Port 80 Already in Use

**Symptom:**
```
Error: bind host port for 0.0.0.0:80: address already in use
```

**Root Cause:**
Apache or Nginx running on host machine using port 80.

**Solution:**
Change frontend port in docker-compose.yml:

```yaml
frontend:
  ports:
    - "8080:80"  # Changed from "80:80"
```

**Access:** http://localhost:8080

**Prevention:**
Check for port conflicts before deployment:
```bash
sudo lsof -i :80
```

---

### Issue 5: CORS Error on Metrics Fetch

**Symptom:**
```
Access to fetch at 'http://localhost:3000/metrics' has been blocked by CORS policy
```

**Root Cause:**
Prometheus `/metrics` endpoint didn't include CORS headers for browser access.

**Solution:**
Add CORS headers to metrics endpoint:

```javascript
app.get('/metrics', async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');  // Add this
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});
```

**Prevention:**
Add CORS middleware globally for development, or whitelist specific origins for production.

---

## 📈 Performance Analysis

### Metrics Collection Overhead

**Baseline (Week 1 - No Metrics):**
- Average response time: 45ms
- Memory usage: 40MB
- CPU usage: 2%

**With Metrics (Week 2):**
- Average response time: 48ms (+3ms, +6.7%)
- Memory usage: 45MB (+5MB, +12.5%)
- CPU usage: 3% (+1%, +50%)

**Overhead Analysis:**
- ✅ **Acceptable overhead** - <10% impact
- ✅ **Negligible latency increase** - +3ms unnoticeable to users
- ✅ **Memory increase reasonable** - prom-client library + metrics storage
- ✅ **CPU increase minimal** - Gauge updates every 30s

**Conclusion:** Metrics collection has minimal performance impact. Benefits far outweigh costs.

---

### Prometheus Storage

**Data Points per Metric:**
- Scrape interval: 10 seconds
- Data points per hour: 360
- Data points per day: 8,640
- Data points per 30 days: 259,200

**Total Metrics:**
- Core metrics: 4
- Bonus metrics: 8
- System metrics: ~20 (default)
- **Total: ~32 metrics**

**Storage Estimate:**
- Per metric per day: ~2KB
- Total per day: 32 × 2KB = 64KB
- Total per 30 days: ~2MB

**Actual Storage (after 1 week):**
- Prometheus volume size: ~15MB
- Includes indexes and metadata
- Well within acceptable limits

---

### Query Performance

**Tested Queries:**

| Query | Response Time | Data Points | Complexity |
|-------|--------------|-------------|------------|
| `urls_shortened_total` | 5ms | 1 | Simple |
| `rate(urls_shortened_total[5m])` | 12ms | 30 | Medium |
| `histogram_quantile(0.95, ...)` | 25ms | 180 | High |
| `topk(5, urls_shortened_by_domain_total)` | 8ms | 5 | Medium |

**Performance Rating:** ✅ **Excellent**
- All queries under 30ms
- Real-time dashboard feasible
- No optimization needed yet

---

## 📝 Commit History

### Repository Statistics

**Total Commits (Week 2):** 12 commits  
**Lines Added:** +450  
**Lines Removed:** -20  
**Files Changed:** 7

### Week 2 Commits

```
feat: Add prom-client library to backend
  - Install prom-client@15.1.0
  - Update package.json dependencies
  
feat: Implement core Prometheus metrics
  - Add URLs shortened counter
  - Add successful redirects counter
  - Add failed lookups counter
  - Add request latency histogram
  
feat: Create /metrics endpoint
  - Expose Prometheus format metrics
  - Add CORS headers for browser access
  
feat: Add Prometheus service to docker-compose
  - Configure prometheus.yml
  - Add prometheus-data volume
  - Setup health checks
  
feat: Implement bonus business metrics
  - Add domain tracking counter
  - Add hourly request counter
  - Add total URLs gauge
  - Add click-through rate gauge
  
feat: Implement custom database exporter
  - Add database size gauge
  - Add oldest URL age gauge
  - Add most clicked URL gauge
  
feat: Create real-time metrics dashboard
  - Build responsive UI with 6 metric cards
  - Implement auto-refresh (10s interval)
  - Add top domains bar chart visualization
  - Add connection status indicator
  
feat: Add JSON metrics export endpoint
  - Create /api/metrics/json endpoint
  - Parse Prometheus format to JSON
  - Include timestamp
  
fix: Resolve database initialization timing issue
  - Move gauge updates inside db.run callback
  - Fix "Cannot access db before initialization" error
  - Update setInterval calls
  
fix: Fix dashboard DOM loading issues
  - Add document.readyState check
  - Wrap initialization in DOMContentLoaded
  - Add null checks for all DOM elements
  
fix: Correct timezone handling in date display
  - Append ' UTC' to SQLite timestamps
  - Fix "3h ago" bug for recent URLs
  
docs: Update README with Week 2 progress
  - Mark all Week 2 tasks complete
  - Add bonus features section
  - Update architecture diagram
```

### Code Quality Metrics

**JavaScript:**
- ESLint errors: 0
- Code duplication: <5%
- Function complexity: Low (avg cyclomatic complexity: 3)
- Comment coverage: 25%

**Configuration:**
- YAML valid: ✅
- Docker builds: ✅
- No secrets in code: ✅

---

## 🎓 Learning Outcomes

### Technical Skills Acquired

**Monitoring & Observability:**
- ✅ Prometheus metrics instrumentation
- ✅ Counter, Gauge, and Histogram usage
- ✅ PromQL query language
- ✅ Time-series data concepts
- ✅ Metrics cardinality management

**Frontend Development:**
- ✅ Real-time data fetching
- ✅ Prometheus text format parsing
- ✅ DOM manipulation and updates
- ✅ Auto-refresh patterns
- ✅ Error handling in async code

**DevOps Practices:**
- ✅ Service health monitoring
- ✅ Data persistence strategies
- ✅ Container orchestration
- ✅ Network configuration
- ✅ Debugging containerized apps

**Problem Solving:**
- ✅ Async initialization sequencing
- ✅ Timezone handling
- ✅ CORS configuration
- ✅ Performance optimization
- ✅ Error troubleshooting

---

## 🏆 Key Achievements

### Quantitative Results

**Metrics Coverage:**
- ✅ 4/4 required core metrics (100%)
- ✅ 8 additional bonus metrics (200%)
- ✅ 100% of operations tracked
- ✅ Real-time observability achieved

**Feature Completeness:**
- ✅ 9/9 core requirements (100%)
- ✅ 5/5 bonus features (100%)
- ✅ **Total: 14/14 (100%)**

**Quality Metrics:**
- ✅ 0 critical bugs
- ✅ 0 security vulnerabilities
- ✅ 23/23 tests passed
- ✅ <10% performance overhead

### Qualitative Achievements

**Beyond Requirements:**
- ✅ Beautiful animated dashboard (not required)
- ✅ Top domains visualization (not required)
- ✅ JSON export for integrations (bonus)
- ✅ Comprehensive error handling
- ✅ Production-ready code quality

**Team Excellence:**
- ✅ Clear role distribution
- ✅ Effective collaboration
- ✅ Thorough documentation
- ✅ Knowledge sharing

---

## 🎯 Week 2 Summary

### What We Built

1. **Comprehensive Metrics System**
   - 12 total metrics (4 core + 8 bonus)
   - Real-time collection
   - Historical storage (30 days)

2. **Beautiful Dashboard**
   - 6 metric cards
   - Top domains chart
   - Auto-refresh capability
   - Connection monitoring

3. **Production Infrastructure**
   - Prometheus service
   - Data persistence
   - Health checks
   - Optimized builds

### Impact

**For Users:**
- Real-time service visibility
- Performance insights
- Business intelligence

**For Operations:**
- Proactive monitoring
- Performance tracking
- Capacity planning data

**For Development:**
- Debugging assistance
- Performance profiling
- Feature usage tracking

### Next Steps (Week 3)

**Grafana Integration:**
- [ ] Add Grafana service
- [ ] Configure data sources
- [ ] Create operations dashboard
- [ ] Create business dashboard
- [ ] Setup dashboard variables
- [ ] Export dashboard JSON

**Preparation:**
- All metrics already implemented ✅
- Prometheus collecting data ✅
- 30 days retention configured ✅
- Team ready for visualization ✅

---

## 📚 References & Resources

### Documentation Used

**Prometheus:**
- Official Docs: https://prometheus.io/docs/
- Best Practices: https://prometheus.io/docs/practices/naming/
- PromQL Guide: https://prometheus.io/docs/prometheus/latest/querying/basics/

**prom-client:**
- NPM Package: https://www.npmjs.com/package/prom-client
- GitHub: https://github.com/siimon/prom-client
- Examples: https://github.com/siimon/prom-client/tree/master/example

**Docker:**
- Compose Reference: https://docs.docker.com/compose/
- Volume Management: https://docs.docker.com/storage/volumes/
- Health Checks: https://docs.docker.com/engine/reference/builder/#healthcheck

### External Tools Used

- **curl** - API testing
- **jq** - JSON parsing
- **docker** - Container management
- **Visual Studio Code** - Code editor
- **Chrome DevTools** - Frontend debugging

---

## ✅ Grading Criteria Coverage

### Documentation ✅
- [x] Week 2 comprehensive documentation
- [x] Metrics detailed explanations
- [x] Architecture diagrams
- [x] Troubleshooting guide
- [x] Testing procedures
- [x] Commit history

### Implementation ✅
- [x] All 9 core requirements met
- [x] All 5 bonus features implemented
- [x] Production-ready code
- [x] Error handling
- [x] Performance optimization
- [x] Security considerations

### Testing ✅
- [x] 23/23 tests passed
- [x] Backend thoroughly tested
- [x] Prometheus integration verified
- [x] Frontend dashboard validated
- [x] Performance analyzed
- [x] Load testing completed

### Commit History ✅
- [x] 12 meaningful commits
- [x] Follows convention
- [x] Detailed commit messages
- [x] Feature branches (optional)
- [x] Regular commits throughout week

---

## 🎊 Conclusion

Week 2 successfully implemented comprehensive Prometheus monitoring for the URL shortener service. All core requirements and bonus features were completed, delivering a production-ready observability solution.

### Highlights

✨ **200% of requirements delivered**  
✨ **23/23 tests passed**  
✨ **<10% performance overhead**  
✨ **Beautiful real-time dashboard**  
✨ **12 comprehensive metrics**  
✨ **Production-ready code quality**

### Team Performance

The team demonstrated exceptional collaboration, technical excellence, and problem-solving abilities. All challenges were overcome efficiently, and the project exceeded expectations.

---

**Document Version:** 1.0  
**Last Updated:** October 24, 2025  
**Week Status:** ✅ Week 2 Complete  
**Review Status:** Ready for Submission 🚀  
**Next Milestone:** Week 3 - Grafana Dashboards
- Track service usage over time
- Identify traffic patterns
- Calculate growth rate

---

#### 2. successful_redirects_total
**Type:** Counter  
**Description:** Total number of successful URL redirects (301 responses)  
**Labels:** None  
**Incremented:** On successful GET `/:shortCode` with redirect

**Example:**
```promql
# Current total
successful_redirects_total

# Success rate
successful_redirects_total / (successful_redirects_total + failed_lookups_total) * 100

# Redirects per second
rate(successful_redirects_total[5m])
```

**Use Cases:**
- Monitor engagement levels
- Calculate click-through rates
- Identify popular links

---

#### 3. failed_lookups_total
**Type:** Counter  
**Description:** Total number of failed URL lookups (404 errors)  
**Labels:** None  
**Incremented:** On GET `/:shortCode` when short code doesn't exist

**Example:**
```promql
# Current total
failed_lookups_total

# Error rate percentage
(rate(failed_lookups_total[5m]) / rate(http_request_duration_seconds_count[5m])) * 100

# Failed lookups per minute
rate(failed_lookups_total[1m]) * 60
```

**Use Cases:**
- Detect broken links
- Identify typos in shared URLs
- Monitor service reliability

---

#### 4. http_request_duration_seconds
**Type:** Histogram  
**Description:** HTTP request latency distribution in seconds  
**Labels:** method, route, status_code  
**Buckets:** [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]

**Metrics Generated:**
- `http_request_duration_seconds_bucket` - Cumulative counters
- `http_request_duration_seconds_sum` - Total duration
- `http_request_duration_seconds_count` - Total requests

**Example:**
```promql
# P50 latency (median)
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# P99 latency
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Average latency
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Requests per second by route
rate(http_request_duration_seconds_count{route="/api/shorten"}[1m])
```

**Use Cases:**
- Monitor API performance
- Identify slow endpoints
- Set SLA targets
- Detect performance degradation

---

### Business Metrics (Bonus)

#### 5. urls_shortened_by_domain_total
**Type:** Counter  
**Description:** Total URLs shortened, grouped by domain  
**Labels:** domain (e.g., "github.com", "google.com")  
**Incremented:** On each URL shortened, extracted from URL hostname

**Example:**
```promql
# Top 5 domains
topk(5, urls_shortened_by_domain_total)

# Specific domain count
urls_shortened_by_domain_total{domain="github.com"}

# Domain diversity (number of unique domains)
count(urls_shortened_by_domain_total)

# URLs per domain (sorted)
sort_desc(urls_shortened_by_domain_total)
```

**Use Cases:**
- Identify most popular domains
- Understand user patterns
- Detect domain trends
- Business intelligence

**Implementation:**
```javascript
// Extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return 'invalid';
  }
}

// Track domain
const domain = extractDomain(url);
urlsByDomainCounter.labels(domain).inc();
```

---

#### 6. requests_by_hour_total
**Type:** Counter  
**Description:** Total requests grouped by hour of day (0-23)  
**Labels:** hour (0-23)  
**Incremented:** On every HTTP request

**Example:**
```promql
# Requests by hour (current day)
sum by (hour) (requests_by_hour_total)

# Busiest hour
topk(1, requests_by_hour_total)

# Hourly traffic pattern
requests_by_hour_total

# Rate of requests per hour
rate(requests_by_hour_total[1h])
```

**Use Cases:**
- Identify peak traffic hours
- Plan maintenance windows
- Optimize resource allocation
- Understand user behavior

---

#### 7. total_urls_in_database
**Type:** Gauge  
**Description:** Current total number of URLs in the database  
**Labels:** None  
**Updated:** Every 30 seconds via database query

**Example:**
```promql
# Current total
total_urls_in_database

# Database growth rate
rate(total_urls_in_database[5m]) * 60

# Growth over last hour
delta(total_urls_in_database[1h])
```

**Use Cases:**
- Monitor database growth
- Capacity planning
- Track overall system usage

---

#### 8. click_through_rate
**Type:** Gauge  
**Description:** Ratio of total clicks to total URLs (engagement metric)  
**Labels:** None  
**Updated:** Every 30 seconds  
**Calculation:** `SUM(clicks) / COUNT(urls)`

**Example:**
```promql
# Current CTR
click_through_rate

# CTR as percentage
click_through_rate * 100

# CTR trend
delta(click_through_rate[1h])
```

**Use Cases:**
-
