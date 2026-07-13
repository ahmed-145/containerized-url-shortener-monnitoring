# 🚀 URL Shortener DevOps Interview Cheat Sheet

## 🏛️ Architecture (Plain English)
The project is a containerized microservices application designed for high observability. At its core, it features a Node.js/Express backend that handles URL shortening logic via an SQLite database, and a Vanilla JS frontend for the user interface. The entire stack is orchestrated locally using Docker Compose and Kubernetes, with a dedicated observability layer featuring Prometheus for metric scraping, Grafana for real-time visualization, and a custom Cerebras AI microservice that automatically analyzes those metrics to generate DevOps health reports.

## 📊 The "Numbers" (Use these if asked about scale)
*   **Performance (Load Testing):** "We achieved 2,715 req/sec redirect throughput and a P95 latency of 62ms under load testing with 100 concurrent users."
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

---

## 🧠 Concept Refresher (If you forgot everything!)
*Read this before the interview to remember what the buzzwords in your CV actually mean.*

**1. "Automated CI/CD pipelines with Git, Jenkins, GitLab CI, and Docker across a 5-stage GitHub Actions workflow"**
*   **What this means:** You know how to make code automatically test and deploy itself using various platforms. You learned **Jenkins** and **GitLab CI** during the DEPI training to understand classic and enterprise CI/CD concepts. However, for *this specific capstone project*, you chose to write a native `.github/workflows/ci-cd.yml` file.
*   **The 5 Stages:** 1) Code Linting (making sure code looks nice), 2) Security Auditing (`npm audit`), 3) Docker Build (packaging the app), 4) Testing (k6 load testing), 5) Scanning (Trivy checks the Docker image for viruses/vulnerabilities).
*   **HOW you did it technically:** You used GitHub Actions (`.github/workflows/ci-cd.yml`). You used the `actions/checkout` step to pull the code, `aquasecurity/trivy-action` to scan for CVE vulnerabilities, and `docker/build-push-action` to package the app into a container.

**2. "Built reusable IaC modules with Terraform and Ansible to provision 5+ environments"**
*   **What this means:** Instead of manually clicking buttons in AWS to create servers, you wrote code to do it.
*   **Terraform:** You wrote `.tf` files to tell AWS: "Give me an EC2 server, a Network (VPC), and a Firewall (Security Group)."
*   **Ansible:** Once Terraform created the blank Ubuntu server, you wrote a `playbook.yml` file. Ansible SSH'd into the server and automatically installed Docker and Kubernetes (K3s) so it was ready to host your app.
*   **HOW you did it technically:** You wrote `terraform/main.tf` using the `hashicorp/aws` provider to deploy an `aws_instance` (EC2) and `aws_security_group`. For Ansible, you wrote `ansible/playbook.yml` using the `apt` module to install prerequisites and a `shell` module to execute the K3s installation script.

**3. "Kubernetes deployment with HPA and PodDisruptionBudgets"**
*   **Kubernetes (K8s):** The system that manages your Docker containers. If a container crashes, K8s restarts it.
*   **HPA (Horizontal Pod Autoscaler):** You set a rule saying "If CPU usage goes over 70%, create more copies (pods) of the URL shortener to handle the traffic."
*   **PDB (Pod Disruption Budget):** A rule you made that says "If we are doing server maintenance, you are NOT allowed to take down all backend pods. At least 2 must stay alive at all times" (Ensures 99.93% uptime).
*   **HOW you did it technically:** 
    *   **HPA:** You wrote `k8s/08-hpa.yaml` targeting the `backend` Deployment. You set `averageUtilization: 70` (for CPU) and `maxReplicas: 3`. If CPU > 70%, K8s automatically spins up more pods.
    *   **PDB:** You wrote `k8s/09-pdb.yaml` with `minAvailable: 1` matching the `backend` app label. If a sysadmin tries to drain the server, Kubernetes actively blocks them from killing the last surviving backend pod.

**4. "Prometheus and Grafana for observability"**
*   **Prometheus:** A tool that constantly asks your app "How many URLs have you shortened?" and "How long did it take?" (Metric scraping).
*   **Grafana:** The beautiful dark-mode dashboard with graphs. You made 19 panels (graphs) spread across 3 dashboards so you can visually see the health of your app.
*   **HOW you did it technically:** You installed the `prom-client` NPM library in the Node.js backend (`server.js`) to expose a `/metrics` HTTP route. You then wrote a `prometheus.yml` configuration file with a `scrape_config` that hits `backend.url-shortener.svc.cluster.local:3000/metrics` every 10 seconds to collect the data.

**5. "Multi-channel alerting (Slack, Email, Discord)"**
*   **What this means:** You configured **Alertmanager** (a tool that works with Prometheus). If your app starts returning 404 errors, Alertmanager automatically sends a message to a Discord/Slack channel and an Email saying "🚨 THE SERVER IS FAILING!"
*   **HOW you did it technically:** You wrote `prometheus/alertmanager.yml` where you defined a `route` block to group alerts together, and a `receivers` block containing `slack_configs` and `webhook_configs` (for Discord) that point to actual webhook URLs. You deployed this into Kubernetes using a Deployment manifest (`k8s/11-alertmanager.yaml`).

**6. "Automated disaster recovery with 15-minute RTO, Docker volumes for persistence"**
*   **Docker Volumes:** If a container is deleted, everything inside it is erased. You used a "Volume" to save the `urls.db` SQLite database to the actual host computer's hard drive so data isn't lost.
*   **15-minute RTO (Recovery Time Objective):** You wrote bash scripts (`backup_all.sh` and `restore_all.sh`). If the whole server explodes, you can run the restore script and have the entire app back online in under 15 minutes.
*   **HOW you did it technically:** For disaster recovery, you wrote `scripts/backup_all.sh` which copies the SQLite database and compresses it into a `.tar.gz` archive. For persistence, you mapped a Docker volume (`db-data:/app/data`) in `docker-compose.yml`, and mapped a `PersistentVolumeClaim` (PVC) in Kubernetes (`k8s/02-volumes.yaml`).

**7. "load testing ... 2,715 req/sec ... P95 latency 62ms"**
*   **What this means:** You load tested the application by simulating 100 users making 10,000 requests.
*   **2,715 req/sec:** The optimized app handled 2,715 redirect requests every single second without database lockups by using in-memory cache-aside lookups and transactional click-count write buffering.
*   **P95 latency of 62ms:** 95% of those requests finished in 62 milliseconds or less under concurrent load.
*   **HOW you did it technically:** You enabled SQLite Write-Ahead Logging (WAL) and synchronous NORMAL modes, implemented an in-memory caching layer for code-to-URL mappings, and batch-updated redirect clicks every 5 seconds to eliminate synchronous database write locks. You verified this using ApacheBench (`ab`) and k6.

**8. Nginx (From your Skills Section)**
*   **What this means:** Nginx is a lightning-fast web server. In your project, you didn't use a heavy Node.js server to host the Frontend HTML/CSS/JS files. Instead, you wrote a `frontend/Dockerfile` that uses the `nginx:alpine` image.
*   **Why it's good:** Nginx is specifically optimized to serve static files (like your index.html and styles.css) using barely any CPU or RAM, making the frontend incredibly fast to load.
*   **HOW you did it technically:** You wrote `frontend/Dockerfile` beginning with `FROM nginx:alpine`. You used the `COPY` command to move `index.html` and `styles.css` into `/usr/share/nginx/html/`, which is the exact folder Nginx uses to serve static assets to users.
