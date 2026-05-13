# 🚀 URL Shortener DevOps Interview Cheat Sheet

## 🏛️ Architecture (Plain English)
The project is a containerized microservices application designed for high observability. At its core, it features a Node.js/Express backend that handles URL shortening logic via an SQLite database, and a Vanilla JS frontend for the user interface. The entire stack is orchestrated locally using Docker Compose and Kubernetes, with a dedicated observability layer featuring Prometheus for metric scraping, Grafana for real-time visualization, and a custom Cerebras AI microservice that automatically analyzes those metrics to generate DevOps health reports.

## 📊 The "Numbers" (Use these if asked about scale)
*   **Performance (k6 Load Testing):** "We achieved 225 req/sec throughput and a P95 latency of 62ms under k6 load testing with 75 concurrent users."
*   **Uptime Target:** "Designed for 99.93% uptime, utilizing Kubernetes Pod Disruption Budgets (PDBs) and HPA (Horizontal Pod Autoscaling) to ensure high availability."
*   **Monitoring Panels:** "We built 19 Grafana panels distributed across 3 specialized dashboards (Main Monitoring, Analytics, and System Health)."
*   **Disaster Recovery:** "Implemented automated disaster recovery scripts achieving a 15-minute Recovery Time Objective (RTO), backed by Docker volumes for data persistence."
*   **Security Audit:** "Conducted rigorous scanning via Trivy and npm audit, resulting in a B+ security grade with zero critical vulnerabilities."

## ❓ 5 Common Interview Questions & Ideal Answers

**Q1: Why did you choose Docker Compose vs Kubernetes?**
> "I actually used both! Docker Compose is used for local development and testing because it’s lightweight and easy for developers to spin up the entire stack with one command (`docker compose up`). I wrote Kubernetes manifests (Deployments, Services, HPA) as the target architecture for production, because it provides enterprise-grade self-healing, automatic scaling, and zero-downtime rolling updates."

**Q2: Walk me through your CI/CD pipeline.**
> "During my DEPI training, I worked extensively with Jenkins, but for this capstone, I implemented a modern, 5-stage GitHub Actions workflow. It uses a fail-fast approach: 1) Linting, 2) npm audit for security, 3) Building Docker images, 4) Integration & k6 load testing against an ephemeral database, and 5) Aqua Trivy and GitHub CodeQL for vulnerability scanning. The pipeline acts as a strict quality gate."

**Q3: I see you mentioned Terraform and Ansible on your CV. How does Infrastructure as Code (IaC) fit into your workflow?**
> "I built reusable IaC modules to automate the provisioning of the underlying infrastructure across 5+ environments. Terraform provisions the core cloud resources (like instances, VPCs, and security groups). Once provisioned, Ansible acts as the configuration management tool to bootstrap the servers, install dependencies like Docker/Kubernetes, and enforce desired state before the CI/CD pipeline deploys the containers."

**Q4: How are you monitoring the application?**
> "I instrumented the Node.js backend using `prom-client` to expose a `/metrics` endpoint. I created custom Counters (for total shortened URLs) and Histograms (to track request latency). Prometheus scrapes this endpoint every 10 seconds. Grafana then connects to Prometheus to visualize these RED metrics in real-time across our 19 panels and multi-channel alerting (Slack, Email, Discord)."

**Q5: What is the purpose of the AI Reporter microservice?**
> "It's an AIOps feature I built to automate root-cause analysis. It periodically fetches raw metric data from Prometheus, formats it, and sends it to the Cerebras Cloud API (Llama 3.3 70B). The LLM analyzes the data and outputs a human-readable PDF report summarizing system health and potential bottlenecks. I chose Cerebras because of its extremely low latency and cost-efficiency for processing large metric contexts."

**Q6: How do you handle database persistence in a containerized environment?**
> "Containers are ephemeral, so if the backend container dies, the SQLite database would be lost. To solve this, I mapped a Docker named volume (`db-data`) to the `/app/data` directory inside the container. In Kubernetes, this translates to using a PersistentVolume (PV) and PersistentVolumeClaim (PVC)."

## 🚨 What Could Go Wrong & How to Debug

**1. Scenario: Backend pods are crashing constantly (CrashLoopBackOff).**
*   **Debug:** I would run `kubectl logs <pod-name>` to check the application logs. If the logs show a database lock or missing directory error, I'd check the volume mounts in the Deployment manifest. I would also run `kubectl describe pod <pod-name>` to see if it's failing its Liveness/Readiness probes.

**2. Scenario: High Latency Spikes in Grafana.**
*   **Debug:** I would immediately check the Grafana dashboard to see if the CPU/Memory utilization correlates with the latency spike. If CPU is maxed out, I'd check if the Horizontal Pod Autoscaler (HPA) triggered correctly (`kubectl get hpa`). If the HPA didn't trigger, I'd verify the metrics-server is running in the K8s cluster.

**3. Scenario: CI/CD Pipeline fails on the Trivy Security Scan.**
*   **Debug:** I would download the SARIF artifact generated by the pipeline to see exactly which package or OS library has the CVE. If it's a Node package, I'd update `package.json`. If it's a base image vulnerability, I would bump the `node:18-alpine` base image in the multi-stage Dockerfile to a newer patch version and rebuild.

**4. Scenario: A bad deployment causes a spike in 404 errors.**
*   **Debug:** Prometheus scrapes the elevated 404 counter, triggering a Grafana alert once the error rate exceeds 5% for 2 minutes. Knowing it was caused by a recent deployment, I would immediately execute a Kubernetes rollback (`kubectl rollout undo deployment/url-shortener-backend`) to restore the previous stable ReplicaSet with zero downtime.

## 🌟 Advanced "Bonus" Topics to Name-Drop
If the interviewer asks what you're proud of, bring these up:
1.  **Synthetic Testing:** "I didn't just build alerts; I built Kubernetes `CronJobs` that intentionally generate synthetic 404s and latency spikes to continuously verify that my Grafana alerts actually fire when they're supposed to."
2.  **CodeQL & Trivy CI/CD:** "My pipeline doesn't just build images; it runs Static Application Security Testing (SAST) via GitHub CodeQL, and container vulnerability scanning via Aqua Trivy."
3.  **Future Roadmap (The "God Mode" Plan):** "While the database is currently SQLite on a Persistent Volume for simplicity, I've mapped out a zero-downtime migration plan to a highly available PostgreSQL StatefulSet for Phase 9."
