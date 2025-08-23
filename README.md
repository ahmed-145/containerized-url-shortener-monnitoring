# Monitoring a Containerized URL Shortener Webservice

A small, production-style demo that builds a **Node.js (Express) URL shortener**, exposes **custom Prometheus metrics**, and visualizes them in **Grafana** — all running locally via **Docker Compose** with persistent volumes.

---

## 🏗 Architecture
- **App**: Node.js + Express URL shortener (REST API + redirects)  
- **DB**: SQLite (file-based)  
- **Monitoring**: Prometheus (scrape) + Grafana (dashboards & alerts)  
- **Orchestration**: Docker Compose  


---

## ✨ Features
- `POST /shorten` → returns a short code for a long URL  
- `GET /<code>` → HTTP 301 redirect to the long URL  
- `/metrics` → Prometheus metrics (counters + latency histogram)  
- Grafana dashboards for rates, latency (P95), and 404s  
- Alerts (e.g. high latency, too many 404s)  
- Data **persists** via Docker volumes  

---

## 🛠 Tech Stack
- Node.js (Express)  
- SQLite  
- Docker & Docker Compose  
- Prometheus  
- Grafana  

---

## 🚀 Quick Start
```bash
git clone https://github.com/ahmed-145/containerized-url-shortener-monnitoring.git
cd url-shortener-monitoring
docker compose up --build -d
