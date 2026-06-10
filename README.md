# AlgoRace

**Visualize. Compare. Benchmark.**

A full-stack platform for visualizing, comparing, and benchmarking classic algorithms in real time.

## Live Demo

Frontend: https://algorithm-race-visualizer.vercel.app

Backend: Railway (Spring Boot API)

---

## Overview

AlgoRace allows users to:

* Compare multiple algorithms side-by-side in dedicated arenas
* Visualize algorithm execution step-by-step with live animation
* Benchmark performance metrics with real-time charts
* Explore algorithm complexity (best / average / worst case)
* Learn algorithm theory and pseudocode
* Hear audio feedback during races via the built-in sound engine

---

## Features

### Sorting Arena

Compare multiple sorting algorithms simultaneously:

* Bubble Sort
* Selection Sort
* Insertion Sort
* Merge Sort
* Quick Sort
* Heap Sort
* Comb Sort

Features:

* Live animation
* Execution timing
* Comparison count
* Swap count
* Complexity information
* Audio cues on compare and swap events

---

### Search Arena

Visualize searching algorithms on the same dataset:

* Linear Search
* Binary Search
* Jump Search

Features:

* Target search simulation
* Real-time comparisons
* Search hit / miss audio cues
* Complexity analysis
* Execution benchmarking

---

### Pathfinding Arena

Visualize graph traversal and shortest-path algorithms:

* Breadth First Search (BFS)
* Depth First Search (DFS)
* Dijkstra's Algorithm
* A* Search

Features:

* Interactive maze generation
* Path exploration animation
* Shortest-path visualization
* Path found audio cue
* Performance comparison

---

### Benchmarks

Centralized complexity reference displaying:

* Time complexity (best / average / worst)
* Space complexity
* Algorithm family comparison

---

### Audio System

Professional Web Audio engine ported from the original JavaFX MIDI SoundManager:

* Vibraphone-style oscillator tones (sine / triangle waves + exponential decay)
* Per-event throttling (compare: 95 ms, swap: 120 ms, UI: 45 ms)
* No arcade sounds — short, clean, modern
* Graceful degradation if AudioContext is unavailable

Sound events:

| Event | Sound |
|-------|-------|
| Race Start | Rising two-chord sequence |
| Compare | Soft high ping |
| Swap | Low bass chord |
| Search Hit | Bright ding |
| Search Miss | Soft descending tone |
| Path Found | Gentle resolution |
| Race Complete | Warm chord pair |
| Winner | Three-chord fanfare |
| Button Click | Subtle vibraphone tap |

---

### Settings

* Dark / Light mode toggle
* Enable / Disable Sound Effects
* Master Volume slider
* Effects Volume slider
* All audio settings persisted via localStorage

---

## Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* CSS3 (Vanilla)
* Web Audio API

### Backend

* Java 21
* Spring Boot
* Maven

### Deployment

Frontend:

* Vercel

Backend:

* Railway

---

## Project Structure

```text
AlgoRace/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/        ← AudioContext
│   │   ├── hooks/          ← useSound, useAudioSettings, usePlayback
│   │   ├── pages/
│   │   ├── services/
│   │   └── models/
│   │
│   └── package.json
│
├── backend/
│   └── src/main/java/
│
└── README.md
```

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/Sanan507/AlgorithmRaceVisualizer.git
cd AlgorithmRaceVisualizer
```

---

### 2. Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Environment Variables

### Frontend

Create:

```text
frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Production

```env
VITE_API_BASE_URL=https://your-backend-url.up.railway.app
```

---

## API Endpoints

### Catalog

```http
GET /api/catalog
```

Returns available algorithms and metadata.

### Sorting Simulation

```http
POST /api/simulations/sorting
```

### Searching Simulation

```http
POST /api/simulations/searching
```

### Pathfinding Simulation

```http
POST /api/simulations/pathfinding
```

---

## Author

Muhammad Sanan Sarwar

GitHub: https://github.com/Sanan507

---

## License

This project is intended for educational and portfolio purposes.
