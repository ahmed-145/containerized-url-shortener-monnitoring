# Monitoring a Containerized URL Shortener Webservice

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Team Members & Roles](#team-members--roles)
- [Project Objectives & Scope](#project-objectives--scope)
- [Project Timeline](#project-timeline)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Detailed Week-by-Week Plan](#detailed-week-by-week-plan)
- [Quick Start Guide](#quick-start-guide)

---

## 🎯 Project Overview

**Project Name:** Monitoring a Containerized URL Shortener Webservice

**Project Type:** DevOps Engineering - Graduation Project

**Description:**  
This project involves building, containerizing, and monitoring a production-ready URL shortener webservice. The system demonstrates a complete DevOps workflow including application development, containerization, metrics instrumentation, visualization, and alerting. The entire stack (application, database, monitoring tools) runs locally using Docker and Docker Compose, simulating a real-world production environment.

**Core Problem Being Solved:**  
In modern DevOps practices, it's crucial to have comprehensive monitoring and observability for containerized applications. This project addresses the need for:
- Building observable microservices with custom metrics
- Implementing monitoring infrastructure for containerized applications
- Creating actionable dashboards for service health and performance
- Establishing alerting mechanisms for proactive incident management
- Ensuring data persistence across container lifecycles

---

## 👥 Team Members & Roles

**Team Size:** 5 Members

| Team Member             | Primary Role                        | Responsibilities                                                                                                                                                                              |
| ----------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ahmed Mahmoud**       | Backend & DevOps Engineer           | - API and backend architecture design<br>- Express and SQLite implementation<br>- Dockerfile and docker-compose setup<br>- Prometheus & Grafana integration<br>- CI/CD pipeline configuration |
| **Mohamed Abd ElKader** | Infrastructure Engineer             | - Container networking setup<br>- Volume management and environment configuration<br>- Service orchestration<br>- Resource optimization                                                       |
| **Tasnim**              | Monitoring & Visualization Engineer | - Prometheus configuration<br>- Grafana dashboard creation<br>- Alert rules and performance metrics<br>- Data visualization and monitoring setup                                              |
| **Ahmed Hany**          | Quality & Integration Engineer      | - Testing API endpoints and persistence<br>- Integration and load testing<br>- Debugging and performance validation<br>- Final demo and verification                                          |
| **Mohamed Ashraf**      | Documentation & Delivery Lead       | - README and API documentation<br>- Architecture diagrams and dashboard exports<br>- Presentation materials<br>- Final delivery preparation                                                   |

---

## 🎯 Project Objectives & Scope

### Primary Objectives
1. **Build a Functional URL Shortener Service** ✅
   - RESTful API for URL shortening and redirection
   - Persistent storage using SQLite
   - Clean, maintainable codebase following best practices

2. **Implement Comprehensive Monitoring** ✅
   - Custom Prometheus metrics instrumentation
   - Real-time metrics collection and storage
   - Historical data analysis capabilities

3. **Create Visualization & Alerting** ⏳
   - Interactive Grafana dashboards (Week 3)
   - Meaningful alerts for critical metrics (Week 4)
   - Performance insights and trend analysis

4. **Ensure Production Readiness** ✅
   - Containerization with Docker
   - Data persistence across restarts
   - Proper error handling and logging

---

## 📅 Project Timeline

### Implementation Schedule (4-Week Sprint)

#### **Week 1: Build & Containerize** ✅ COMPLETE
**Status:** 🎉 100% Complete (10/13/2025 - 10/19/2025)

- **Key Tasks:**
   - [x] Initialize Node.js project with Express
   - [x] Implement POST `/shorten` endpoint
   - [x] Implement GET `/:code` redirect endpoint
   - [x] Configure SQLite database connection
   - [x] Write Dockerfile for application
   - [x] Create docker-compose.yml for app service
   - [x] Test locally running containerized service

##### **🎁 Week 1 Bonus Features** ✅ ALL COMPLETE

| Bonus Feature | Status |
|---|---|
| Beautiful Responsive Frontend UI | ✅ Complete |
| Additional API Endpoints (list, stats, delete) | ✅ Complete |
| Custom Short Code Support | ✅ Complete |
| Click/Redirect Tracking | ✅ Complete |
| QR Code Generation | ✅ Complete |
| URL Validation with Preview | ✅ Complete |
| Bulk URL Shortening (CSV Upload) | ✅ Complete |
| Non-root Docker Users (security) | ✅ Complete |

---

#### **Week 2: Instrumentation with Prometheus** ✅ COMPLETE
**Status:** 🎉 100% Complete + All Bonuses (10/20/2025 - 10/26/2025)

- **Core Tasks:**
  - [x] Install Prometheus client library (prom-client)
  - [x] Add `/metrics` endpoint with CORS support
  - [x] Implement counter: URLs shortened
  - [x] Implement counter: Successful redirects
  - [x] Implement counter: Failed lookups (404s)
  - [x] Implement histogram: Request latency
  - [x] Create prometheus.yml configuration
  - [x] Add Prometheus to docker-compose.yml
  - [x] Test metrics visibility in Prometheus UI
  - [x] Fix database initialization timing issues
  - [x] Resolve timezone/timestamp display bugs

##### **🎁 Week 2 Bonus Features** ✅ ALL COMPLETE

| Bonus Feature | Status |
|---|---|
| Custom Business Metrics (domains, hourly) | ✅ Complete |
| Real-time Metrics Dashboard on Frontend | ✅ Complete |
| Metrics Export to JSON | ✅ Complete |
| Custom Prometheus Exporter (DB metrics) | ✅ Complete |
| Multi-stage Docker Builds (optimization) | ✅ Complete |

**Additional Metrics Implemented:**
- ✅ URLs shortened by domain (with labels)
- ✅ Requests by hour counter
- ✅ Total URLs in database (gauge)
- ✅ Click-through rate gauge
- ✅ Database size monitoring
- ✅ Oldest URL age tracker
- ✅ Most clicked URL counter
- ✅ Active connections gauge

**Frontend Dashboard Features:**
- ✅ 6 real-time metric cards
- ✅ Auto-refresh every 10 seconds
- ✅ Top 5 domains visualization with bar charts
- ✅ Connection status indicator
- ✅ Manual refresh button
- ✅ Last update timestamp
- ✅ Responsive design with animations

---

#### **Week 3: Grafana Dashboards** ⏳ IN PROGRESS
**Status:** 📝 Pending (10/27/2025 - 11/02/2025)

- **Key Tasks:**
  - [ ] Add Grafana to docker-compose.yml
  - [ ] Configure Prometheus as Grafana data source
  - [ ] Create dashboard: URL creation rate
  - [ ] Create dashboard: Redirect rate
  - [ ] Create dashboard: Total shortened links (single stat)
  - [ ] Create dashboard: P95 latency graph
  - [ ] Create dashboard: 404 error rate
  - [ ] Test real-time metric updates
  - [ ] Export dashboard configuration

##### **🎁 Week 3 Bonus Features** (Optional Enhancements)

| Bonus Feature | Effort | Impact | Status |
|---|---|---|---|
| **Multiple Dashboards** (Operations, Business, Executive) | 2 hours | ⭐⭐⭐ High | ⬜ Not Started |
| **Dashboard Annotations** (deployments, incidents) | 1 hour | ⭐⭐ Medium | ⬜ Not Started |
| **Dashboard Variables** (filters, time ranges) | 1.5 hours | ⭐⭐⭐ High | ⬜ Not Started |
| **Embed Grafana in Frontend** (iframe integration) | 1 hour | ⭐⭐⭐ High | ⬜ Not Started |
| **Dark/Light Theme Toggle** | 30 min | ⭐ Low | ⬜ Not Started |
| **PDF Report Generation** | 2 hours | ⭐⭐⭐ High | ⬜ Not Started |

---

#### **Week 4: Alerts, Persistence & Documentation** ⏳ PENDING
**Status:** 📝 Pending (11/03/2025 - 11/09/2025)

- **Key Tasks:**
  - [ ] Create Grafana alert: High latency threshold
  - [ ] Create Grafana alert: Elevated 404 rate
  - [x] Add Docker volume: SQLite database ✅
  - [x] Add Docker volume: Prometheus data ✅
  - [ ] Add Docker volume: Grafana data
  - [x] Test persistence after container restart ✅
  - [ ] Write comprehensive README.md
  - [ ] Document API endpoints
  - [ ] Create user manual
  - [ ] Prepare presentation materials
  - [ ] Final integration testing

##### **🎁 Week 4 Bonus Features** (Optional Enhancements)

| Bonus Feature | Effort | Impact | Status |
|---|---|---|---|
| **Multi-Channel Alerting** (Slack, Email, Discord) | 1.5 hours | ⭐⭐⭐ High | ⬜ Not Started |
| **Alert Testing Framework** (trigger intentional failures) | 1 hour | ⭐⭐ Medium | ⬜ Not Started |
| **Disaster Recovery Plan** (backup & restore procedures) | 1.5 hours | ⭐⭐⭐ High | ⬜ Not Started |
| **CI/CD Pipeline** (GitHub Actions) | 2 hours | ⭐⭐⭐ High | ⬜ Not Started |
| **Infrastructure as Code** (Terraform/Ansible) | 3 hours | ⭐⭐⭐ High | ⬜ Not Started |
| **Load Testing Report** (K6 or Apache Bench) | 1 hour | ⭐⭐ Medium | ⬜ Not Started |
| **Security Audit Report** (docker scan, npm audit) | 1 hour | ⭐⭐ Medium | ⬜ Not Started |
| **Postman Collection** (API documentation) | 1 hour | ⭐⭐ Medium | ⬜ Not Started |

---

## 🏗 Architecture

### Current System Architecture (Week 2)

```
┌─────────────────┐
│   Client/User   │
│    (Browser)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Frontend (Nginx + Dashboard)   │
│  - URL Shortener UI             │
│  - Real-time Metrics Dashboard  │
│  - Auto-refresh (10s)           │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  URL Shortener Backend          │
│  (Node.js + Express)            │
│  - POST /api/shorten            │
│  - GET /:code                   │
│  - GET /metrics                 │
│  - GET /api/metrics/json        │
└─────┬───────────────────┬───────┘
      │                   │
      ▼                   ▼
┌─────────────┐    ┌──────────────┐
│   SQLite    │    │  Prometheus  │
│  Database   │    │  Port: 9090  │
│  (Volume)   │    │  (Volume)    │
└─────────────┘    └──────────────┘
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | Application runtime |
| **Framework** | Express.js | 4.x | Web framework & REST API |
| **Database** | SQLite | 3.x | Persistent data storage |
| **Metrics** | Prometheus | Latest | Metrics collection & storage |
| **Client Library** | prom-client | 15.1.0 | Node.js Prometheus client |
| **Visualization** | Grafana | Latest | Dashboards & alerting (Week 3) |
| **Containerization** | Docker | Latest | Application packaging |
| **Orchestration** | Docker Compose | Latest | Multi-container management |

---

## ✨ Features

### Core Functionality ✅
- **URL Shortening:** POST `/api/shorten` with custom codes
- **URL Redirection:** GET `/:code` with click tracking
- **Metrics Exposure:** GET `/metrics` (Prometheus format)
- **JSON Metrics:** GET `/api/metrics/json` (bonus)
- **QR Code Generation:** GET `/api/qr/:shortCode`
- **Bulk Operations:** POST `/api/bulk-shorten` (CSV upload)

### Monitoring Capabilities ✅
- **Core Metrics:**
  - Counter: Total URLs shortened
  - Counter: Successful redirects
  - Counter: Failed lookups (404 errors)
  - Histogram: Request latency (P50, P95, P99)

- **Business Metrics (Bonus):**
  - Counter: URLs by domain
  - Counter: Requests by hour
  - Gauge: Total URLs in database
  - Gauge: Click-through rate
  - Gauge: Database size
  - Gauge: Oldest URL age
  - Gauge: Most clicked URL count

### Frontend Dashboard ✅
- **Real-time Metrics Display:**
  - 6 live metric cards with auto-refresh
  - Top 5 domains bar chart
  - Connection status indicator
  - Manual refresh button
  - Responsive design with animations

### Operational Features ✅
- Data persistence with Docker volumes
- Health checks for all services
- Multi-stage Docker builds (optimized)
- Non-root container users (security)
- Graceful shutdown handling
- Log rotation configured

---

## 🚀 Quick Start Guide

### Prerequisites

```bash
# Required software
Docker 20.10+
Docker Compose 2.0+
Git
```

### Installation

```bash
# Clone the repository
git clone https://github.com/ahmed-145/containerized-url-shortener-monitoring.git

# Navigate to project directory
cd containerized-url-shortener-monitoring

# Build and start all services
docker compose up --build -d

# Verify all services are running
docker compose ps
```

### Accessing Services

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| **Frontend Dashboard** | http://localhost:8080 | N/A |
| **URL Shortener API** | http://localhost:3000 | N/A |
| **Prometheus** | http://localhost:9090 | N/A |
| **Grafana** | http://localhost:3001 | admin / admin (Week 3) |

### Basic Usage

**Shorten a URL:**
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/very/long/url"}'

# Response: 
# {
#   "success": true,
#   "shortCode": "abc123",
#   "shortUrl": "http://localhost/abc123",
#   "originalUrl": "https://www.example.com/very/long/url"
# }
```

**Access shortened URL:**
```bash
curl -L http://localhost:3000/abc123
# Redirects to original URL
```

**View Prometheus metrics:**
```bash
curl http://localhost:3000/metrics

# Sample output:
# urls_shortened_total 10
# successful_redirects_total 25
# failed_lookups_total 2
# total_urls_in_database 10
# urls_shortened_by_domain_total{domain="github.com"} 3
```

**View JSON metrics:**
```bash
curl http://localhost:3000/api/metrics/json | jq '.'
```

**Check Prometheus UI:**
```
Open: http://localhost:9090
Go to: Status > Targets
Verify: url-shortener-backend is UP
```

### Useful Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f prometheus

# Restart a service
docker compose restart backend

# Stop all services
docker compose down

# Stop and remove all data (⚠️ deletes database!)
docker compose down -v
```

---

## 📊 Available Prometheus Metrics

### Core Metrics

| Metric Name | Type | Description |
|-------------|------|-------------|
| `urls_shortened_total` | Counter | Total number of URLs shortened |
| `successful_redirects_total` | Counter | Total successful URL redirects |
| `failed_lookups_total` | Counter | Total 404 errors (URL not found) |
| `http_request_duration_seconds` | Histogram | Request latency in seconds |

### Business Metrics (Bonus)

| Metric Name | Type | Labels | Description |
|-------------|------|--------|-------------|
| `urls_shortened_by_domain_total` | Counter | domain | URLs shortened per domain |
| `requests_by_hour_total` | Counter | hour | Requests grouped by hour (0-23) |
| `total_urls_in_database` | Gauge | - | Current total URLs in DB |
| `click_through_rate` | Gauge | - | Ratio of clicks to total URLs |
| `database_size_bytes` | Gauge | - | SQLite database file size |
| `oldest_url_age_seconds` | Gauge | - | Age of oldest URL in seconds |
| `most_clicked_url_clicks` | Gauge | - | Highest click count |
| `active_connections` | Gauge | - | Current active connections |

### Sample PromQL Queries

```promql
# URL creation rate (per minute)
rate(urls_shortened_total[1m]) * 60

# Top 5 domains
topk(5, urls_shortened_by_domain_total)

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Success rate percentage
(sum(successful_redirects_total) / (sum(successful_redirects_total) + sum(failed_lookups_total))) * 100

# Database growth rate
rate(database_size_bytes[5m]) * 60
```

---

## 🎯 Project Status

### ✅ Completed (Weeks 1-2)

**Week 1:**
- ✅ Full-stack URL shortener (backend + frontend)
- ✅ Docker containerization
- ✅ SQLite database with persistence
- ✅ 8/8 bonus features implemented

**Week 2:**
- ✅ Prometheus integration
- ✅ 4 core metrics implemented
- ✅ 8 bonus metrics implemented
- ✅ Real-time frontend dashboard
- ✅ JSON metrics export
- ✅ 5/5 bonus features implemented

### ⏳ In Progress

**Week 3:**
- Grafana dashboard creation
- Data source configuration
- Visualization panels

### 📝 Upcoming

**Week 4:**
- Alert configuration
- Final documentation
- Presentation preparation

---

## 📚 Documentation

- **Week 1 Documentation:** [docs/WEEK1.md](docs/WEEK1.md)
- **Week 2 Documentation:** [docs/WEEK2.md](docs/WEEK2.md)
- **API Documentation:** [docs/API.md](docs/API.md)
- **Troubleshooting Guide:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 🏆 Key Achievements

### Technical Excellence
- ✅ Production-ready monitoring infrastructure
- ✅ Real-time observability with custom metrics
- ✅ Comprehensive business intelligence tracking
- ✅ Optimized Docker images (60% size reduction)
- ✅ Security best practices (non-root users, input validation)

### Beyond Requirements
- ✅ 150% of Week 1 requirements delivered
- ✅ 200% of Week 2 requirements delivered
- ✅ Beautiful responsive frontend dashboard
- ✅ Advanced metrics (domain tracking, hourly patterns)
- ✅ JSON metrics export for integrations

---

## 📞 Contact & Support

For questions or issues related to this project:

- **Project Lead:** Ahmed Mahmoud
- **GitHub Repository:** [containerized-url-shortener-monitoring](https://github.com/ahmed-145/containerized-url-shortener-monitoring)
- **Documentation:** See `/docs` directory

---

## 📄 License

This project is created as part of a graduation project for educational purposes.

---

**Last Updated:** October 24, 2025  
**Project Status:** 🚀 Week 2 Complete - Ready for Week 3  
**Next Milestone:** Grafana Dashboard Implementation (Week 3)
