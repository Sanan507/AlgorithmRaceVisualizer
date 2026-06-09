# Algorithm Race Visualizer

A professional algorithm visualization project with two implementations:

- Original JavaFX desktop application in `src/`
- Modern portfolio-ready web application in `frontend/` and `backend/`

The web version migrates the project to React + TypeScript + Vite on the frontend and Spring Boot 3 + Java 21 on the backend.

## Web Architecture

```text
frontend/
  src/components/       Sidebar, controls, charts, canvas visualizers
  src/pages/            Sorting, Searching, Pathfinding, Comparison, Settings
  src/hooks/            Playback and animation state
  src/services/         REST API client
  src/models/           TypeScript DTOs

backend/
  controller/           REST endpoints
  service/              Simulation orchestration
  algorithms/           JavaFX-free algorithm implementations
  model/                Backend data models
  dto/                  API contracts
  utils/                Array, maze, and complexity utilities
```

The backend generates deterministic simulation frames from real Java algorithm models. React animates those frames with Canvas, preserving pause, resume, reset, speed control, winner detection, metrics, and complexity explanations.

## Web Local Setup

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Web Build

```bash
cd backend
mvn clean package

cd ../frontend
npm run build
```

## Docker

```bash
docker compose up --build
```

Frontend runs at `http://localhost:3000`; backend runs at `http://localhost:8080`.

## Deployment

Backend on Render:

- Root directory: `backend`
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/algorithm-race-backend-1.0.0.jar`
- Environment:
  - `PORT`
  - `CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment:
  - `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

## Portfolio Highlights

- Data Structures & Algorithms: sorting, searching, pathfinding, maze generation
- Java and OOP: reusable algorithm classes and Spring Boot services
- React and TypeScript: responsive dashboard with Canvas animation
- System design: API contracts, frontend/backend separation, Docker, CI/CD

## Project Structure

```text
src/
  main/                 JavaFX application entry point
  ui/                   Main layout, sidebar, dashboard panels, CSS
  controller/           Race orchestration and multithreaded execution
  model/                Observable base algorithm model
  algorithms/
    sorting/            Bubble, Selection, Insertion, Merge, Quick, Heap
    searching/          Linear, Binary, Jump
    pathfinding/        BFS, DFS, Dijkstra, A*
  utils/                Settings, data generation, complexity explanations
```

## Core Features

- JavaFX dashboard interface with dark and light themes
- Sidebar navigation for Sorting, Searching, Pathfinding, and Settings
- Sorting race mode with side-by-side canvas lanes
- Worker-thread execution through `ExecutorService`
- Pause, resume, reset, speed control, and random data generation
- Live metrics for time, comparisons, swaps, and completion status
- Bar chart for performance comparison
- Searching and pathfinding visualizers with animated highlights
- Obstacle drawing for pathfinding grids
- Algorithm explanation and pseudocode panels
- Sound toggle, fullscreen mode, and save/load configuration support

## Running

This Eclipse project is configured with the JavaFX container/user library in `.classpath`.

Open the project in Eclipse, make sure the JavaFX user library points to your local JavaFX SDK, then run:

```text
main.Main
```

For command-line runs, install the JavaFX SDK and provide its `lib` folder as the module path:

```text
javac --module-path /path/to/javafx/lib --add-modules javafx.controls,javafx.fxml,javafx.graphics -d bin src/module-info.java
java --enable-native-access=javafx.graphics --module-path /path/to/javafx/lib --add-modules javafx.controls,javafx.fxml,javafx.graphics -m algorithmvisualizer/main.Main
```

On Java 25+, the `--enable-native-access=javafx.graphics` VM argument suppresses the JavaFX native access warning.

More migration detail is available in `README_WEB_MIGRATION.md`.
