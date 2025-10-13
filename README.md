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
- [Risk Assessment & Mitigation](#risk-assessment--mitigation)
- [Key Performance Indicators (KPIs)](#key-performance-indicators-kpis)
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

| Team Member | Primary Role | Responsibilities |
|-------------|--------------|------------------|
| **Ahmed Mahmoud** | Backend & API Development | - Express routes implementation<br>- SQLite database integration<br>- Metrics endpoint exposure<br>- API business logic |
| **Mohamed Abd ElKader** | Containerization & Infrastructure | - Dockerfile creation<br>- docker-compose.yml configuration<br>- Docker volumes setup<br>- Container orchestration |
| **Tasnim** | Monitoring & Visualization | - Prometheus configuration<br>- Grafana dashboard design<br>- Alert rule creation<br>- Metrics visualization |
| **Ahmed Hany** | Testing & Integration | - End-to-end testing<br>- Persistence validation<br>- Integration testing<br>- Demo preparation |
| **Mohamed Ashraf** | Documentation & Delivery | - README documentation<br>- API documentation<br>- Dashboard exports<br>- Final presentation preparation |

**Note:** Roles may shift during execution based on project needs and task dependencies.

---

## 🎯 Project Objectives & Scope

### Primary Objectives
1. **Build a Functional URL Shortener Service**
   - RESTful API for URL shortening and redirection
   - Persistent storage using SQLite
   - Clean, maintainable codebase following best practices

2. **Implement Comprehensive Monitoring**
   - Custom Prometheus metrics instrumentation
   - Real-time metrics collection and storage
   - Historical data analysis capabilities

3. **Create Visualization & Alerting**
   - Interactive Grafana dashboards
   - Meaningful alerts for critical metrics
   - Performance insights and trend analysis

4. **Ensure Production Readiness**
   - Containerization with Docker
   - Data persistence across restarts
   - Proper error handling and logging

### Project Scope

**In Scope:**
- URL shortener webservice with POST and GET endpoints
- SQLite database for URL mappings
- Docker containerization for all services
- Prometheus metrics instrumentation
- Grafana dashboards and alerts
- Data persistence using Docker volumes
- API documentation and user guides

**Out of Scope:**
- User authentication/authorization
- Custom domain support
- URL expiration features
- Advanced security features (rate limiting, DDoS protection)
- Cloud deployment (AWS, Azure, GCP)
- Load balancing and horizontal scaling

---

## 📅 Project Timeline

### Overview
**Project Duration:** September 21, 2025 - November 20, 2025 (9 weeks)

### Major Milestones

| Phase | Start Date | End Date | Status |
|-------|-----------|----------|--------|
| Project Planning & Management | 09/21/2025 | 09/21/2025 | ✅ In Progress |
| Literature Review | 09/21/2025 | 09/21/2025 | 📝 Pending |
| Requirements Gathering | 09/21/2025 | 09/21/2025 | 📝 Pending |
| System Analysis & Design | 09/21/2025 | 09/21/2025 | 📝 Pending |
| Implementation (Source Code) | 09/21/2025 | 11/15/2025 | 📝 Pending |
| Final Presentation & Testing | 11/20/2025 | 11/20/2025 | 📝 Pending |

### Implementation Schedule (4-Week Sprint)

#### **Week 1: Build & Containerize** (10/13/2025 - 10/19/2025)
- **Objectives:**
  - Develop Express URL shortener application
  - Implement SQLite database integration
  - Create Dockerfile
  - Setup initial docker-compose.yml

- **Key Tasks:**
  - [ ] Initialize Node.js project with Express
  - [ ] Implement POST `/shorten` endpoint
  - [ ] Implement GET `/:code` redirect endpoint
  - [ ] Configure SQLite database connection
  - [ ] Write Dockerfile for application
  - [ ] Create docker-compose.yml for app service
  - [ ] Test locally running containerized service

- **Deliverables:**
  - Functional URL shortener with source code
  - Working Dockerfile
  - docker-compose.yml (app only)
  - Local testing confirmation

#### **Week 2: Instrumentation with Prometheus** (10/20/2025 - 10/26/2025)
- **Objectives:**
  - Add Prometheus client library
  - Implement custom metrics
  - Configure Prometheus service
  - Integrate monitoring stack

- **Key Tasks:**
  - [ ] Install Prometheus client library (prom-client)
  - [ ] Add `/metrics` endpoint
  - [ ] Implement counter: URLs shortened
  - [ ] Implement counter: Successful redirects
  - [ ] Implement counter: Failed lookups (404s)
  - [ ] Implement histogram: Request latency
  - [ ] Create prometheus.yml configuration
  - [ ] Add Prometheus to docker-compose.yml
  - [ ] Test metrics visibility in Prometheus UI

- **Deliverables:**
  - Instrumented webservice with `/metrics` endpoint
  - prometheus.yml configuration file
  - Updated docker-compose.yml (app + Prometheus)
  - Verified custom metrics in Prometheus

#### **Week 3: Grafana Dashboards** (10/27/2025 - 11/02/2025)
- **Objectives:**
  - Setup Grafana service
  - Configure data sources
  - Build comprehensive dashboards
  - Visualize key metrics

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

- **Deliverables:**
  - Full docker-compose.yml (app + Prometheus + Grafana)
  - Custom Grafana dashboard
  - Real-time metrics visualization
  - Dashboard JSON export

#### **Week 4: Alerts, Persistence & Documentation** (11/03/2025 - 11/09/2025)
- **Objectives:**
  - Configure alerting rules
  - Implement data persistence
  - Complete documentation
  - Final testing and validation

- **Key Tasks:**
  - [ ] Create Grafana alert: High latency threshold
  - [ ] Create Grafana alert: Elevated 404 rate
  - [ ] Add Docker volume: SQLite database
  - [ ] Add Docker volume: Prometheus data
  - [ ] Add Docker volume: Grafana data
  - [ ] Test persistence after container restart
  - [ ] Write comprehensive README.md
  - [ ] Document API endpoints
  - [ ] Create user manual
  - [ ] Prepare presentation materials
  - [ ] Final integration testing

- **Deliverables:**
  - docker-compose.yml with persistent volumes
  - Configured Grafana alerts
  - Tested persistent stack
  - Complete project documentation
  - API documentation
  - Final presentation deck

#### **Final Week: Testing & Presentation** (11/10/2025 - 11/20/2025)
- Final integration testing
- Bug fixes and refinements
- Presentation preparation
- Demo rehearsal
- Project submission

---

## 🏗 Architecture

### System Components

```
┌─────────────────┐
│   Client/User   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  URL Shortener Service          │
│  (Node.js + Express)            │
│  - POST /shorten                │
│  - GET /:code                   │
│  - GET /metrics                 │
└─────┬───────────────────┬───────┘
      │                   │
      ▼                   ▼
┌─────────────┐    ┌──────────────┐
│   SQLite    │    │  Prometheus  │
│  Database   │    │  (Metrics)   │
└─────────────┘    └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   Grafana    │
                   │ (Dashboards) │
                   └──────────────┘
```

### Technology Architecture
- **Application Layer:** Node.js + Express (REST API)
- **Data Layer:** SQLite (file-based database)
- **Monitoring Layer:** Prometheus (metrics collection)
- **Visualization Layer:** Grafana (dashboards & alerts)
- **Orchestration:** Docker Compose

---

## ✨ Features

### Core Functionality
- **URL Shortening:** POST `/shorten` accepts long URLs and returns unique short codes
- **URL Redirection:** GET `/:code` redirects to original long URL with HTTP 301
- **Metrics Exposure:** GET `/metrics` provides Prometheus-formatted metrics

### Monitoring Capabilities
- **Custom Metrics:**
  - Counter: Total URLs shortened
  - Counter: Successful redirects
  - Counter: Failed lookups (404 errors)
  - Histogram: Request latency (P50, P95, P99)

### Visualization
- Real-time Grafana dashboards
- Historical trend analysis
- Performance metrics visualization

### Operational Features
- Data persistence across container restarts
- Automated alerting for critical thresholds
- Containerized deployment
- Easy local development setup

---

## 🛠 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | Application runtime |
| **Framework** | Express.js | 4.x | Web framework & REST API |
| **Database** | SQLite | 3.x | Persistent data storage |
| **Metrics** | Prometheus | Latest | Metrics collection & storage |
| **Client Library** | prom-client | Latest | Node.js Prometheus client |
| **Visualization** | Grafana | Latest | Dashboards & alerting |
| **Containerization** | Docker | Latest | Application packaging |
| **Orchestration** | Docker Compose | Latest | Multi-container management |

---

## 📋 Detailed Week-by-Week Plan

### Week 1: Build & Containerize
**Goal:** Create a working URL shortener service running in a Docker container.

**Tasks:**
1. Project initialization and dependency setup
2. Database schema design and SQLite integration
3. API endpoint implementation (POST /shorten, GET /:code)
4. Error handling and validation
5. Dockerfile creation with multi-stage build
6. docker-compose.yml configuration
7. Local testing and validation

**Success Criteria:**
- API successfully shortens URLs
- Redirects work correctly
- Service runs in Docker container
- Database persists data during runtime

---

### Week 2: Instrumentation with Prometheus
**Goal:** Add comprehensive metrics to track service performance and usage.

**Tasks:**
1. Install and configure prom-client library
2. Create metrics endpoint (/metrics)
3. Implement counters for operations
4. Implement histogram for latency tracking
5. Configure Prometheus scrape settings
6. Update docker-compose.yml with Prometheus service
7. Verify metrics in Prometheus UI

**Success Criteria:**
- /metrics endpoint returns Prometheus format
- All custom metrics appear in Prometheus
- Metrics update in real-time
- Prometheus successfully scrapes application

---

### Week 3: Grafana Dashboards
**Goal:** Build interactive dashboards for monitoring and analysis.

**Tasks:**
1. Add Grafana service to Docker Compose
2. Configure Prometheus as data source
3. Design dashboard layout
4. Create visualization panels for each metric
5. Configure refresh intervals
6. Test real-time updates
7. Export dashboard configuration

**Success Criteria:**
- Grafana connects to Prometheus
- Dashboard displays all key metrics
- Metrics update in near real-time
- Dashboard is intuitive and informative

---

### Week 4: Alerts, Persistence & Documentation
**Goal:** Production-ready system with persistence, alerts, and complete documentation.

**Tasks:**
1. Configure Grafana alert rules
2. Add Docker volumes for all stateful services
3. Test data persistence after restart
4. Write comprehensive README
5. Document API endpoints
6. Create troubleshooting guide
7. Prepare final presentation
8. Conduct final testing

**Success Criteria:**
- Alerts trigger correctly
- Data persists across restarts
- Documentation is complete and clear
- System is stable and production-ready

---

## ⚠️ Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|-------------------|
| **Docker configuration issues** | Medium | High | - Early testing of Docker setup<br>- Team member with Docker expertise<br>- Detailed documentation |
| **Prometheus metrics not collecting** | Medium | High | - Thorough testing of metrics endpoint<br>- Use proven libraries (prom-client)<br>- Regular monitoring checks |
| **Data loss on restart** | High | Critical | - Implement Docker volumes early<br>- Test persistence frequently<br>- Backup configurations |
| **Team member unavailability** | Medium | Medium | - Cross-training on tasks<br>- Documented procedures<br>- Flexible role assignments |
| **Integration challenges** | Medium | High | - Weekly integration testing<br>- Clear interface definitions<br>- Regular team communication |
| **Time constraints** | High | High | - Realistic weekly goals<br>- Buffer time in schedule<br>- Prioritize core features |
| **Technical skill gaps** | Low | Medium | - Early learning resources<br>- Pair programming<br>- Code reviews |

---

## 📊 Key Performance Indicators (KPIs)

### Project Success Metrics

**Technical KPIs:**
- **Response Time:** < 100ms for 95% of requests (P95 latency)
- **System Uptime:** 99.9% availability during testing period
- **Error Rate:** < 1% failed requests
- **Metric Collection:** 100% of operations tracked
- **Dashboard Completeness:** All 5 key metrics visualized

**Development KPIs:**
- **Code Quality:** All code reviewed and follows standards
- **Test Coverage:** Core functionality tested
- **Documentation Completeness:** README, API docs, and user manual complete
- **Commit Frequency:** Regular commits with meaningful messages
- **Sprint Completion:** All weekly deliverables met on time

**User Adoption Metrics:**
- **API Usability:** Clear and intuitive API design
- **Dashboard Clarity:** Non-technical users can understand dashboards
- **Documentation Quality:** Setup possible without team assistance

---

## 🚀 Quick Start Guide

### Prerequisites
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git

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
| **URL Shortener API** | http://localhost:3000 | N/A |
| **Prometheus** | http://localhost:9090 | N/A |
| **Grafana** | http://localhost:3001 | admin / admin |

### Basic Usage

**Shorten a URL:**
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.example.com/very/long/url"}'

# Response: {"shortCode": "abc123", "shortUrl": "http://localhost:3000/abc123"}
```

**Access shortened URL:**
```bash
curl -L http://localhost:3000/abc123
# Redirects to original URL
```

**View metrics:**
```bash
curl http://localhost:3000/metrics
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v
```

---

## 📚 Additional Resources

- **GitHub Repository:** https://github.com/ahmed-145/containerized-url-shortener-monitoring
- **Project Documentation:** `/docs` directory
- **API Documentation:** `/docs/API.md`
- **Troubleshooting Guide:** `/docs/TROUBLESHOOTING.md`

---

## 📞 Contact & Support

For questions or issues related to this project:

- **Project Lead:** Ahmed Mahmoud
- **Infrastructure:** Mohamed Abd ElKader
- **Monitoring:** Tasnim
- **Testing:** Ahmed Hany
- **Documentation:** Mohamed Ashraf

---

## 📄 License

This project is created as part of a graduation project for educational purposes.

---

**Last Updated:** October 13, 2025  
**Project Status:** 🚧 In Progress - Week 1  
**Next Milestone:** Complete URL Shortener Implementation (Week 1)
