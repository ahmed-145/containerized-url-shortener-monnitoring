# URL Shortener - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Using the Web Interface](#using-the-web-interface)
4. [Using the API](#using-the-api)
5. [Monitoring and Analytics](#monitoring-and-analytics)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## 1. Introduction

### What is the URL Shortener?
The URL Shortener is a web service that converts long URLs into short, easy-to-share links. It includes comprehensive monitoring and analytics capabilities to track link performance.

### Key Features
- ✅ Shorten long URLs to compact links
- ✅ Track click statistics
- ✅ Generate QR codes
- ✅ Custom short codes
- ✅ Bulk URL shortening (CSV upload)
- ✅ Real-time monitoring dashboards
- ✅ Detailed analytics

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- For developers: Docker and Docker Compose

---

## 2. Getting Started

### Accessing the Service

After installation, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Web Interface** | http://localhost | Main user interface |
| **API** | http://localhost:3000 | Programmatic access |
| **Prometheus** | http://localhost:9090 | Metrics viewer |
| **Grafana** | http://localhost:3001 | Dashboards (Login: admin/admin) |

### First Time Setup

1. **Start the Services**
   ```bash
   docker compose up -d
   ```

2. **Verify Services are Running**
   ```bash
   docker compose ps
   ```
   All services should show "Up (healthy)"

3. **Access the Web Interface**
   Open your browser and go to: http://localhost

---

## 3. Using the Web Interface

### 3.1 Shortening a URL

**Step 1:** Enter Your URL
- Type or paste your long URL in the input field
- Example: `https://www.example.com/very/long/url/path`

**Step 2:** (Optional) Add Custom Code
- Click "Use Custom Code" checkbox
- Enter your preferred short code (3-20 characters)
- Only letters and numbers allowed

**Step 3:** Click "Shorten URL"
- The system creates your short link
- You'll see the shortened URL displayed

**Step 4:** Copy and Share
- Click the "Copy" button next to your short URL
- Share it via email, social media, or anywhere else

### 3.2 Viewing Your Shortened URLs

**Access the URL List:**
- Scroll down on the main page
- See all your shortened URLs in a table

**Table Columns:**
- **Short Code:** The unique identifier
- **Original URL:** The long URL (truncated for display)
- **Clicks:** Number of times the link was accessed
- **Created:** Date and time of creation
- **Actions:** Buttons for stats, QR code, and delete

### 3.3 Checking URL Statistics

**View Stats:**
1. Find your URL in the list
2. Click the "Stats" button
3. View detailed information:
   - Total clicks
   - Creation date
   - Last accessed time
   - Domain information

### 3.4 Generating QR Codes

**Create a QR Code:**
1. Find your URL in the list
2. Click the "QR Code" button
3. A QR code image appears
4. Right-click and save the image
5. Use it in printed materials, presentations, etc.

### 3.5 Bulk URL Shortening

**Upload Multiple URLs:**
1. Prepare a CSV file with a "url" column:
   ```csv
   url
   https://example.com/page1
   https://example.com/page2
   https://example.com/page3
   ```

2. Click "Bulk Upload" on the web interface
3. Select your CSV file
4. Click "Upload"
5. View results with all shortened URLs

### 3.6 Deleting URLs

**Remove a Shortened URL:**
1. Find the URL in your list
2. Click the "Delete" button
3. Confirm deletion
4. The URL is permanently removed

⚠️ **Warning:** Deleted URLs cannot be recovered. Existing links will stop working.

---

## 4. Using the API

### 4.1 Basic API Usage

**Shorten a URL with cURL:**
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com"}'
```

**Response:**
```json
{
  "success": true,
  "shortCode": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://www.example.com"
}
```

### 4.2 Using Custom Short Codes

```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com", "customCode": "mylink"}'
```

### 4.3 Accessing Shortened URLs

Simply navigate to:
```
http://localhost:3000/abc123
```

Or use cURL with redirect following:
```bash
curl -L http://localhost:3000/abc123
```

### 4.4 Getting URL Statistics

```bash
curl http://localhost:3000/api/stats/abc123
```

**Response:**
```json
{
  "success": true,
  "code": "abc123",
  "originalUrl": "https://www.example.com",
  "clicks": 15,
  "createdAt": "2025-11-08T10:00:00.000Z"
}
```

### 4.5 Complete API Reference

For full API documentation, see: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 5. Monitoring and Analytics

### 5.1 Real-Time Metrics Dashboard

**Access the Dashboard:**
- Available on the main web interface
- Scroll down to the "Metrics Dashboard" section

**Metrics Displayed:**
- **Total URLs Shortened:** Lifetime count
- **Total Redirects:** All-time clicks
- **404 Errors:** Failed lookups
- **Total URLs in Database:** Current count
- **Click-Through Rate:** Average clicks per URL
- **Database Size:** Storage used

**Features:**
- Auto-refreshes every 10 seconds
- Manual refresh button available
- Shows last update time

### 5.2 Grafana Dashboards

**Access Grafana:**
1. Open http://localhost:3001
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. Navigate to Dashboards → Browse

**Available Dashboards:**

**Main Monitoring Dashboard**
- Total shortened links
- URL creation rate over time
- Redirect rate trends
- P95 request latency
- 404 error rate

**Advanced Analytics Dashboard**
- Top 10 domains shortened
- Database growth over time
- Click-through rate gauge
- Most popular URL statistics
- Request patterns by hour

**System Health Dashboard**
- Active connections
- Database size monitoring
- P99 latency tracking
- Service status indicator
- Request throughput metrics

### 5.3 Prometheus Metrics

**Access Prometheus:**
1. Open http://localhost:9090
2. Go to "Graph" tab
3. Enter PromQL queries

**Example Queries:**

URL creation rate:
```promql
rate(urls_shortened_total[5m])
```

Success rate percentage:
```promql
sum(successful_redirects_total) / (sum(successful_redirects_total) + sum(failed_lookups_total)) * 100
```

Top domains:
```promql
topk(5, urls_shortened_by_domain_total)
```

### 5.4 Alerts

**Configured Alerts:**

1. **High Latency Alert**
   - Triggers when P95 latency > 100ms for 2 minutes
   - Severity: Warning
   - Check in Grafana → Alerting

2. **Elevated 404 Rate Alert**
   - Triggers when 404 rate > 5% for 2 minutes
   - Severity: Warning
   - Check in Grafana → Alerting

**Viewing Active Alerts:**
1. Go to Grafana (http://localhost:3001)
2. Click "Alerting" in the left sidebar
3. View "Alert rules" to see all configured alerts
4. Check "Alert instances" to see currently firing alerts

---

## 6. Troubleshooting

### Common Issues and Solutions

#### Issue 1: Cannot Access Web Interface

**Symptoms:**
- Browser shows "Connection refused"
- Page not loading at http://localhost

**Solutions:**
1. Check if services are running:
   ```bash
   docker compose ps
   ```

2. Restart services:
   ```bash
   docker compose restart
   ```

3. Check logs for errors:
   ```bash
   docker compose logs frontend
   ```

#### Issue 2: Shortened URLs Not Working

**Symptoms:**
- 404 error when accessing short link
- URL created but doesn't redirect

**Solutions:**
1. Verify backend is healthy:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check if URL exists:
   ```bash
   curl http://localhost:3000/api/stats/YOUR_CODE
   ```

3. Review backend logs:
   ```bash
   docker compose logs backend
   ```

#### Issue 3: Grafana Shows "No Data"

**Symptoms:**
- Dashboards are empty
- Panels show "No data"

**Solutions:**
1. Verify Prometheus is scraping:
   - Go to http://localhost:9090/targets
   - Backend should show "UP"

2. Test metrics endpoint:
   ```bash
   curl http://localhost:3000/metrics
   ```

3. Restart Grafana:
   ```bash
   docker compose restart grafana
   ```

#### Issue 4: Database Not Persisting

**Symptoms:**
- URLs disappear after restart
- Metrics reset to zero

**Solutions:**
1. Check volume mounts:
   ```bash
   docker volume ls
   ```

2. Verify docker-compose.yml has volumes configured

3. Don't use `docker compose down -v` (this deletes volumes)

#### Issue 5: High Latency Warnings

**Symptoms:**
- Grafana alert firing
- Slow response times

**Solutions:**
1. Check system resources:
   ```bash
   docker stats
   ```

2. Review database size:
   ```bash
   curl http://localhost:3000/api/metrics/json | grep database
   ```

3. Consider restarting services during low-traffic periods

### Getting Help

**Check Logs:**
```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs grafana
docker compose logs prometheus

# Follow logs in real-time
docker compose logs -f
```

**Verify Service Health:**
```bash
# Check all containers
docker compose ps

# Health check
curl http://localhost:3000/health
```

---

## 7. FAQ

### General Questions

**Q: How long do shortened URLs last?**
A: Indefinitely, until manually deleted. Data persists across restarts.

**Q: Can I use custom short codes?**
A: Yes! Check the "Use Custom Code" box when shortening. Codes must be 3-20 alphanumeric characters.

**Q: Is there a limit to how many URLs I can shorten?**
A: No hard limit currently. The system is designed to handle thousands of URLs.

**Q: Can I edit a shortened URL after creation?**
A: No, but you can delete and recreate it with the same custom code.

### Technical Questions

**Q: Where is my data stored?**
A: In a SQLite database file stored in a Docker volume for persistence.

**Q: Can I backup my data?**
A: Yes, the database file is in the Docker volume. Use docker volume commands to backup.

**Q: How do I update the service?**
A: Pull the latest code and rebuild:
```bash
git pull
docker compose up --build -d
```

**Q: Can I run this on a different port?**
A: Yes, modify the `docker-compose.yml` file and change the port mappings.

### Monitoring Questions

**Q: How often are metrics updated?**
A: Real-time metrics update every 10 seconds. Prometheus scrapes every 15 seconds.

**Q: Can I export dashboard data?**
A: Yes, Grafana allows exporting to PNG, PDF, or CSV.

**Q: What does P95 latency mean?**
A: 95% of requests complete within this time. It's a standard performance metric.

**Q: Why do I see 404 errors in metrics?**
A: These occur when users try to access non-existent short codes. Some level is normal.

### Security Questions

**Q: Is my data secure?**
A: Data is stored locally in your Docker containers. For production use, add authentication.

**Q: Can others see my shortened URLs?**
A: Anyone with the short link can access it. There's no password protection currently.

**Q: Should I expose this to the internet?**
A: This setup is for local/development use. For production, add security measures (HTTPS, auth, rate limiting).

---

## Appendix A: Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Focus URL input | Alt + U |
| Submit form | Enter (in input field) |
| Refresh metrics | Ctrl + R (on metrics page) |

## Appendix B: System Limits

| Resource | Limit |
|----------|-------|
| Max URL length | 2048 characters |
| Short code length | 3-20 characters |
| QR code size | 300x300 pixels |
| CSV upload rows | 1000 URLs per file |

## Appendix C: Support Resources

- **Documentation:** See `docs/` directory
- **API Reference:** API_DOCUMENTATION.md
- **Project Repository:** GitHub link
- **Grafana Docs:** https://grafana.com/docs/
- **Prometheus Docs:** https://prometheus.io/docs/

---

**Last Updated:** November 8, 2025  
**Version:** 1.0  
**Prepared by:** DEPI DevOps Team

---

## Quick Reference Card

### Essential Commands
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Restart service
docker compose restart backend
```

### Essential URLs
- Web Interface: http://localhost
- API: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Quick API Test
```bash
# Shorten URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Check health
curl http://localhost:3000/health
```