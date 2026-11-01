# AlgoRace: Production Deployment & Operations Guide

This guide provides comprehensive instructions for deploying, configuring, and maintaining **AlgoRace** across containerized, cloud, and self-hosted server environments.

---

## 📋 Table of Contents
1. [Architecture & Deployment Models](#1-architecture--deployment-models)
2. [Environment Variables Reference](#2-environment-variables-reference)
3. [Containerized Deployment (Docker & Compose)](#3-containerized-deployment-docker--compose)
4. [Cloud Deployment (Vercel + Render / Railway)](#4-cloud-deployment-vercel--render--railway)
5. [Self-Hosted VPS Deployment (Ubuntu / Debian + Nginx + SSL)](#5-self-hosted-vps-deployment-ubuntu--debian--nginx--ssl)
6. [Production Health Checks & Verification](#6-production-health-checks--verification)
7. [Security & Hardening Checklist](#7-security--hardening-checklist)

---

## 1. Architecture & Deployment Models

AlgoRace consists of two independent services:
- **Backend Service**: Spring Boot 3.4 REST & SSE API engine running on Java 21 (Default internal port: `8080`).
- **Frontend Service**: React 18 + TypeScript SPA served via Nginx or Edge CDN (Default port: `80` or `3000`).

### Recommended Deployment Topologies:
- **Topology A (All-in-One Docker Compose with Reverse Proxy)**:
  - Both frontend and backend run as containers on the same host or Kubernetes pod.
  - The frontend Nginx container reverse-proxies `/api/*` to `http://backend:8080/api/` over an isolated internal Docker bridge network.
  - **Advantage**: The client's web browser only connects to port `80` (or `443`). No CORS configuration is required, and zero external backend ports are exposed to the public internet.
- **Topology B (Decoupled Cloud / Microservices)**:
  - Frontend is deployed to an Edge CDN (e.g., **Vercel** or **Cloudflare Pages**).
  - Backend is deployed to a container runner (e.g., **Render**, **Railway**, **AWS ECS**, or **GCP Cloud Run**).
  - The frontend accesses the backend via its full HTTPS URL (`VITE_API_BASE_URL=https://api.yourdomain.com`).

---

## 2. Environment Variables Reference

### Backend Service (Spring Boot 3.4)

| Variable | Type | Default | Description |
|:---|:---:|:---:|:---|
| `PORT` | Integer | `8080` | HTTP port the Spring Boot server listens on. |
| `CORS_ALLOWED_ORIGINS` | String | `http://localhost:5173,http://localhost:3000` | Comma-separated list of origins permitted to make cross-origin requests. Set to your production frontend domain (e.g., `https://algo-race.com`). |
| `SPRING_PROFILES_ACTIVE` | String | `default` | Active Spring profile (`prod` or `dev`). |
| `JAVA_TOOL_OPTIONS` | String | `-Xms256m -Xmx512m` | JVM memory parameters. In high-traffic environments, scale to `-Xms512m -Xmx1024m -XX:+UseG1GC`. |

### Frontend Service (React 18 / Vite)

| Variable / Arg | Type | Default | Description |
|:---|:---:|:---:|:---|
| `VITE_API_BASE_URL` | String | `""` (Empty string in Docker) | Base URL for API requests. Leave **empty** (`""`) when using Nginx reverse-proxy on the same domain (requests route to `/api/...`). Specify full URL (e.g., `https://api.yourdomain.com`) for cross-domain cloud hosting. |
| `FRONTEND_PORT` | Integer | `3000` | Host port mapped to Nginx container port `80`. |
| `BACKEND_PORT` | Integer | `8080` | Host port mapped to Spring Boot container port `8080`. |

---

## 3. Containerized Deployment (Docker & Compose)

### 3.1 Quick Start with Docker Compose (Local & Staging)
To run the full stack locally or on a staging server:

```bash
# 1. Clone repository
git clone https://github.com/Sanan507/AlgorithmRaceVisualizer.git
cd AlgorithmRaceVisualizer

# 2. Copy environment template
cp .env.example .env

# 3. Build and launch services
docker compose up --build -d
```
The application will be live at:
- Frontend: `http://localhost:3000`
- Backend API & Swagger: `http://localhost:8080/swagger-ui.html`

### 3.2 Production Docker Compose Deployment
For production servers, use `docker-compose.prod.yml` which includes resource limits, restart policies, and production memory tunings:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

> [!IMPORTANT]
> **Why Nginx Reverse Proxy Eliminates the 'Localhost' Trap**:
> In naive Docker setups, baking `http://localhost:8080` into frontend static assets fails when accessed from any external client computer, because the user's browser looks for port 8080 on their *local machine*.
> AlgoRace's production Nginx configuration proxies `/api/` directly to `http://backend:8080/api/` inside Docker's internal network. When `VITE_API_BASE_URL` is empty, API requests automatically route through the frontend's origin without CORS or networking friction.

---

## 4. Cloud Deployment (Vercel + Render / Railway)

### 4.1 Frontend on Vercel
1. Import the repository into your Vercel Dashboard.
2. Set the **Root Directory** to `frontend`.
3. Set the **Build Command** to: `npm run build`
4. Set the **Output Directory** to: `dist`
5. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com` (or Railway URL)
6. Deploy! Vercel handles HTTPS, HTTP/2, and Edge caching automatically.

### 4.2 Backend on Render / Railway
1. Create a new **Web Service** pointing to your repository.
2. Set the **Root Directory** to `backend`.
3. Select **Docker** as the Runtime (Render/Railway automatically detects `backend/Dockerfile`).
4. Configure Environment Variables:
   - `PORT`: `8080`
   - `CORS_ALLOWED_ORIGINS`: `https://your-app.vercel.app,https://yourdomain.com`
   - `JAVA_TOOL_OPTIONS`: `-Xms256m -Xmx512m`
5. Deploy! Once healthy, copy your service URL and set it as `VITE_API_BASE_URL` in your frontend service.

---

## 5. Self-Hosted VPS Deployment (Ubuntu / Debian + Nginx + SSL)

For hosting on an Ubuntu VPS (DigitalOcean, Linode, AWS EC2, Hetzner):

### 5.1 System Prerequisites
```bash
sudo apt update && sudo apt install -y openjdk-21-jre-headless nginx certbot python3-certbot-nginx
```

### 5.2 Deploy Backend as a Systemd Service
1. Package the backend JAR:
   ```bash
   cd backend && mvn clean package -DskipTests
   sudo cp target/*.jar /opt/algorace-backend.jar
   ```
2. Create `/etc/systemd/system/algorace-backend.service`:
   ```ini
   [Unit]
   Description=AlgoRace Spring Boot Engine
   After=network.target

   [Service]
   User=www-data
   ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/algorace-backend.jar
   Environment="PORT=8080"
   Environment="CORS_ALLOWED_ORIGINS=https://yourdomain.com"
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now algorace-backend
   ```

### 5.3 Deploy Frontend Static Files
1. Build frontend:
   ```bash
   cd frontend
   VITE_API_BASE_URL="" npm run build
   sudo cp -r dist/* /var/www/algorace/
   ```

### 5.4 Configure Nginx with SSL
Create `/etc/nginx/sites-available/algorace`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/algorace;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
Enable site and obtain SSL:
```bash
sudo ln -s /etc/nginx/sites-available/algorace /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 6. Production Health Checks & Verification

After deployment, verify that all systems are operational:

1. **Backend Catalog Health**:
   ```bash
   curl -i https://yourdomain.com/api/catalog
   ```
   *Expected Response: HTTP 200 with JSON payload containing supported algorithms.*

2. **Simulation REST Endpoint**:
   ```bash
   curl -i -X POST https://yourdomain.com/api/simulations/sorting \
     -H "Content-Type: application/json" \
     -d '{"algorithms":["Quick Sort","Merge Sort"],"datasetType":"Random","size":30}'
   ```
   *Expected Response: HTTP 200 with simulation frames.*

3. **Frontend Asset Delivery**:
   Navigate to `https://yourdomain.com` in your browser and check the developer console for clean network calls to `/api/catalog`.

---

## 7. Security & Hardening Checklist

- [x] **Rate Limiting**: Built-in Bucket4j token bucket rate limiting on `/api/simulations/*`.
- [x] **Input Bounds**: Strict maximum size limits ($N \le 160$ for arrays, $30 \times 30$ for mazes).
- [x] **CORS Origins**: Explicit origins configured via `CORS_ALLOWED_ORIGINS` (never wildcard `*` in production).
- [x] **Security Headers**: HSTS, nosniff, frame-ancestors, and strict Content-Security-Policy enabled.
- [x] **Unprivileged Containers**: Docker containers run without root escalation permissions.

