# Algorithm Race Visualizer Web

This repository now contains a portfolio-ready web migration of the original JavaFX **Algorithm Race Visualizer**.

The original JavaFX source remains in `src/`. The new web application is split into:

- `backend/` - Spring Boot 3, Java 21 REST API
- `frontend/` - React, TypeScript, Vite dashboard

## Architecture

The migration separates algorithm logic from presentation:

- Spring Boot generates deterministic simulation frames from the reused Java DSA models.
- React receives those frames and controls playback locally with Canvas rendering.
- Pause, resume, reset, and speed changes are instant because the browser owns animation timing.
- Complexity information is exposed through the backend catalog and rendered in reusable explanation panels.

## Reused Logic

The backend ports the original algorithm behavior into JavaFX-free classes:

- Sorting: Bubble, Selection, Insertion, Merge, Quick, Heap, Comb
- Searching: Linear, Binary, Jump
- Pathfinding: BFS, DFS, Dijkstra, A*
- Utilities: array generation, maze generation, complexity catalog

## Replaced JavaFX Code

These JavaFX responsibilities were replaced by React:

- `ui.MainLayout`, `ui.Sidebar`
- `ui.panels.SortingPanel`
- `ui.panels.SearchingPanel`
- `ui.panels.PathfindingPanel`
- `ui.panels.SettingsPanel`
- JavaFX `Canvas`, `AnimationTimer`, controls, charts, and CSS

## Backend API

Run locally:

```bash
cd backend
mvn spring-boot:run
```

Endpoints:

- `GET /api/catalog`
- `POST /api/simulations/sorting`
- `POST /api/simulations/searching`
- `POST /api/simulations/pathfinding`

Environment variables:

- `PORT` - backend port, default `8080`
- `CORS_ALLOWED_ORIGINS` - comma-separated frontend origins

## Frontend

Run locally:

```bash
cd frontend
npm install
npm run dev
```

Build:

```bash
cd frontend
npm run build
```

Environment variables:

- `VITE_API_BASE_URL` - backend URL, for example `https://algorithm-race-api.onrender.com`

## Docker

Run both services:

```bash
docker compose up --build
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:8080`

## Deployment

### Backend on Render

1. Create a new Web Service.
2. Point it to this repository.
3. Root directory: `backend`
4. Build command: `mvn clean package -DskipTests`
5. Start command: `java -jar target/algorithm-race-backend-1.0.0.jar`
6. Set environment variables:
   - `PORT`
   - `CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`

### Frontend on Vercel

1. Create a new Vercel project.
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set:
   - `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

## Portfolio Talking Points

- Demonstrates DSA with real step-by-step state transitions.
- Shows OOP migration from desktop JavaFX models to backend Java services.
- Uses system design boundaries: frontend animation, backend simulation.
- Includes modern React, TypeScript, Spring Boot, Docker, and CI.
- Preserves core JavaFX functionality while making the result deployable.
