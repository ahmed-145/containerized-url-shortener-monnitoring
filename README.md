Monitoring a Containerized URL Shortener Webservice

⸻

📌 Project Name

Monitoring a Containerized URL Shortener Webservice

⸻

💡 Project Idea

A small, production-style demo that builds a Node.js (Express) URL shortener, containerizes it with Docker, instruments it with Prometheus custom metrics, and visualizes everything in Grafana.

The goal is to simulate a real DevOps workflow: building, monitoring, alerting, and persisting data across container restarts.

⸻

🗂 Project Plan & Team Roles (initial draft, subject to change)

We are a team of 5. Tasks are distributed as follows (roles may shift during execution):
	•	Ahmed Mahmoud → Backend & API development (Express routes, SQLite integration, metrics exposure).
	•	Mohamed Abd ElKader → Containerization & Infrastructure (Dockerfile, docker-compose.yml, persistence volumes).
	•	Tasnim → Monitoring & Visualization (Prometheus configuration, Grafana dashboards, alerts).
	•	Ahmed Hany → Testing & Integration (end-to-end validation, persistence checks, demo preparation).
	•	Mohamed Ashraf → Documentation & Delivery (README, API documentation, dashboard exports, presentation).

⸻

🏗 Architecture
	•	App: Node.js + Express URL shortener (REST API + redirects)
	•	DB: SQLite (file-based)
	•	Monitoring: Prometheus (scrape) + Grafana (dashboards & alerts)
	•	Orchestration: Docker Compose

⸻

✨ Features
	•	POST /shorten → returns a short code for a long URL
	•	GET /<code> → HTTP 301 redirect to the long URL
	•	/metrics → Prometheus metrics (counters + latency histogram)
	•	Grafana dashboards for rates, latency (P95), and 404s
	•	Alerts (e.g. high latency, too many 404s)
	•	Data persists via Docker volumes

⸻

🛠 Tech Stack
	•	Node.js (Express)
	•	SQLite
	•	Docker & Docker Compose
	•	Prometheus
	•	Grafana

⸻

📅 Week-by-Week Plan

Week 1 — Build & Containerize
	•	Build Express app with POST /shorten and GET /:code.
	•	Store mappings in SQLite.
	•	Write Dockerfile.
	•	Create initial docker-compose.yml (app only).

Deliverables: Running URL shortener in a container.

⸻

Week 2 — Instrumentation with Prometheus
	•	Add Prometheus client to expose metrics at /metrics.
	•	Counters: shortened URLs, redirects, failed lookups.
	•	Histogram for request latency.
	•	Add Prometheus service in docker-compose.yml.
	•	Write prometheus.yml scrape config.

Deliverables: Prometheus shows application metrics.

⸻

Week 3 — Grafana Dashboards
	•	Add Grafana to docker-compose.yml.
	•	Connect Grafana to Prometheus as datasource.
	•	Create dashboard panels:
	•	Rate of URL creations & redirects
	•	Total count of shortened links
	•	P95 latency
	•	404 error rate

Deliverables: Real-time Grafana dashboard visualizing service metrics.

⸻

Week 4 — Alerts, Persistence & Documentation
	•	Configure Grafana alerts (e.g. high latency, too many 404s).
	•	Add Docker volumes for SQLite, Prometheus, Grafana.
	•	Test persistence after restart.
	•	Write README & API documentation.
	•	Final testing and demo preparation.

Deliverables: Stable system with persistence, alerts, and documentation.

⸻

🚀 Quick Start

git clone https://github.com/ahmed-145/containerized-url-shortener-monitoring.git
cd containerized-url-shortener-monitoring
docker compose up --build -d

Access:
	•	App: http://localhost:3000
	•	Prometheus: http://localhost:9090
	•	Grafana: http://localhost:3001 (default login: admin / admin)
