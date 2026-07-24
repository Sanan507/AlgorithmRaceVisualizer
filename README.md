# AlgoRace — Algorithm Benchmark & Visualization Engine

**Visualize. Compare. Benchmark.**

AlgoRace is a high-performance full-stack web application designed for real-time visualization, multi-lane comparison, step-by-step debugging, and scientific benchmarking of classic computer science algorithms.

---

## 🌐 Live Demo & Deployment

- **Frontend Application**: [https://algorithm-race-visualizer.vercel.app](https://algorithm-race-visualizer.vercel.app)
- **Backend API**: Spring Boot 3.4 REST Engine (Render / Local)

---

## 📸 Visual Overview & Live Demo

### Live Race Animation Demo
![AlgoRace Live Race Simulation](C:/Users/HP/.gemini/antigravity-ide/brain/215e8701-d1d0-4c50-ae84-bf01aa1d873e/algorace_demo_1784910354847.webp)

### Multi-Lane Array Sorting Arena
![AlgoRace Multi-Lane Sorting Arena](C:/Users/HP/.gemini/antigravity-ide/brain/215e8701-d1d0-4c50-ae84-bf01aa1d873e/active_sorting_arena_1784910441452.png)

### 2D Grid Pathfinding Arena
![AlgoRace 2D Grid Pathfinding Arena](C:/Users/HP/.gemini/antigravity-ide/brain/215e8701-d1d0-4c50-ae84-bf01aa1d873e/active_pathfinding_arena_1784910503275.png)

---

## 💡 Why I Built AlgoRace

> *"I built AlgoRace because Big-O notation and static pseudocode never fully captured how algorithms actually behave for me. $O(n \log n)$ tells you the growth rate, but it doesn't show you why Quick Sort pulls ahead of Bubble Sort on the same dataset, or how Dijkstra's algorithm actually explores a graph step by step.*
>
> *AlgoRace turns that into something you can watch and interact with. Sorting algorithms race side by side on identical dataset seeds, search algorithms visualize their space elimination as it happens, and pathfinding runs on 2D grids you can edit and re-run in real time.*
>
> *It's a full-stack project: a Spring Boot Java backend generates deterministic simulation steps, a React 18 + TypeScript frontend renders them on HTML5 Canvas, and a custom Web Audio synthesizer adds sound feedback for comparisons and swaps."*
>
> — **Muhammad Sanan Sarwar** (Creator & Lead Engineer)

---

## 🚀 Key Features & Architectural Highlights

- **18+ Algorithms Supported**: Multi-lane comparison across Sorting, Searching, and Pathfinding.
- **Deterministic Dataset Preservation**: All algorithms race on identical, un-biased dataset seeds for scientifically accurate benchmarking.
- **Step-by-Step Debugger & Frame Scrubbing**: Scrub backward and forward through algorithm execution timelines with interactive seek bars.
- **Interactive 2D Grid Wall Editor**: Click and drag directly on the pathfinding canvas to construct custom wall barriers with live path recalculation.
- **Synthesized Web Audio Engine**: Multi-lane vibraphone-style acoustic feedback that continues until the final algorithm completes.
- **Core Web Vitals Optimized**: CSS `aspect-ratio` layout reservation eliminating CLS, `IntersectionObserver` canvas offscreen pausing, mobile hardware detection, and code splitting via `React.lazy` + `Suspense`.
- **Hardened Production Security**: Strict CORS origin mapping, input sanitization, and DoS array/grid bounds checking (`MAX_ARRAY_SIZE = 100`, `MAX_GRID_COLS = 60`).

---

## 🎯 Arenas & Supported Algorithms

### 1. Sorting Arena
Compare comparison and non-comparison sorting algorithms side-by-side on identical array seeds:

- **Supported Algorithms (9)**:
  - **Quick Sort** — $O(n \log n)$ best/avg, $O(n^2)$ worst, $O(\log n)$ space.
  - **Merge Sort** — $O(n \log n)$ best/avg/worst, $O(n)$ space.
  - **Heap Sort** — $O(n \log n)$ best/avg/worst, $O(1)$ space.
  - **Insertion Sort** — $O(n)$ best, $O(n^2)$ avg/worst, $O(1)$ space.
  - **Selection Sort** — $O(n^2)$ best/avg/worst, $O(1)$ space.
  - **Bubble Sort** — $O(n)$ best, $O(n^2)$ avg/worst, $O(1)$ space.
  - **Comb Sort** — $O(n \log n)$ best, $O(n^2 / 2^p)$ avg, $O(n^2)$ worst, $O(1)$ space.
  - **Radix Sort** — $O(nk)$ best/avg/worst, $O(n+k)$ space (Digit bucket distribution).
  - **Counting Sort** — $O(n+k)$ best/avg/worst, $O(k)$ space (Frequency count array).

- **Dataset Modes**: Random, Nearly Sorted, Reversed, Few Unique, Custom Array Input.

---

### 2. Search Arena
Benchmark searching algorithms on ordered array spaces with active target probe visualization:

- **Supported Algorithms (5)**:
  - **Linear Search** — $O(1)$ best, $O(n)$ avg/worst.
  - **Binary Search** — $O(1)$ best, $O(\log n)$ avg/worst (Search space halving).
  - **Jump Search** — $O(1)$ best, $O(\sqrt{n})$ avg/worst (Block step jumping).
  - **Exponential Search** — $O(1)$ best, $O(\log n)$ avg/worst (Doubling range finding + Binary Search).
  - **Interpolation Search** — $O(1)$ best, $O(\log \log n)$ avg, $O(n)$ worst (Key distribution position estimation).

---

### 3. Pathfinding Arena
Visualize graph traversal and shortest-path calculation on custom 2D grid maps:

- **Supported Algorithms (5)**:
  - **A\* Search** — Heuristic-guided optimal pathfinding combining distance & Manhattan heuristic.
  - **Dijkstra's Algorithm** — Guaranteed shortest-path tree exploration for weighted graphs.
  - **Breadth-First Search (BFS)** — Unweighted graph shortest-path queue traversal.
  - **Depth-First Search (DFS)** — Deep-first stack maze exploration and cycle detection.
  - **Bellman-Ford Algorithm** — Relaxation-based shortest path algorithm iteratively relaxing grid edges.

- **Maze Generators**: Random Noise, Recursive Division, Simple Spiral, Clear Grid.

---

## 🎵 Web Audio Sound Engine

Synthesized acoustic chimes provide subtle auditory feedback for array swaps, comparisons, search hits, and victory fanfares:

| Event | Tone Def | Description |
|:---|:---|:---|
| **Race Start** | `[60,64]` $\to$ `[67,72]` | Ascending two-chord tone |
| **Compare** | `[72, 79]` | Soft high sine ping |
| **Swap** | `[50, 57, 62]` | Deep triangle bass chord |
| **Search Hit** | `[72, 76]` | Bright cyan chime |
| **Search Miss** | `[60, 63]` | Soft descending triangle tone |
| **Path Found** | `[64,67,72]` $\to$ `[67,72,76]` | Gentle resolution chord |
| **Race Complete** | `[60,64,67]` $\to$ `[67,72,76]` | Warm dual chord |
| **Winner** | `[60,64]` $\to$ `[64,67]` $\to$ `[67,72,76,79]` | Three-tone victory fanfare |

*Audio feedback evaluates active status across all lanes, continuing seamlessly until the last running algorithm completes.*

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Vanilla CSS3 with Obsidian Dark & Light theme design system
- **Visuals**: HTML5 Canvas (Hardware-accelerated 2D context)
- **Audio**: Native Web Audio API Synthesizer

### Backend
- **Language**: Java 21 / 25
- **Framework**: Spring Boot 3.4.2 REST Engine
- **Build Tool**: Maven

---

## 📂 Project Structure

```text
AlgoRace/
│
├── frontend/                     # React 18 + TypeScript + Vite Client
│   ├── src/
│   │   ├── components/           # Canvas renderers, Controls, LaneCards, Comparison Center
│   │   ├── context/              # AudioContext state provider
│   │   ├── data/                 # Fallback algorithm catalogs & metadata
│   │   ├── hooks/                # usePlayback, useSound, useAudioSettings
│   │   ├── models/               # TypeScript interfaces & API types
│   │   ├── pages/                # Sorting, Searching, Pathfinding, History, Settings
│   │   ├── services/             # API HTTP client
│   │   └── styles.css            # Dark & Light theme design system
│   └── package.json
│
├── backend/                      # Spring Boot 3.4 API Engine
│   └── src/main/java/com/algorithmrace/visualizer/
│       ├── algorithms/           # Sorting, Searching, Pathfinding step generators
│       ├── controller/           # REST Controllers
│       ├── dto/                  # Data Transfer Objects
│       ├── model/                # Base Algorithm models
│       ├── service/              # Simulation engine & Catalog services
│       └── utils/                # Array & Maze generators
│
└── README.md
```

---

## 🔧 Local Development & Setup

### 1. Clone Repository
```bash
git clone https://github.com/Sanan507/AlgorithmRaceVisualizer.git
cd AlgorithmRaceVisualizer
```

### 2. Run Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
*Backend server runs on `http://localhost:8080`.*

### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend application runs on `http://localhost:5173`.*

---

## 🛡️ Security & Performance Standards

- **Input Sanitization**: Array size bounded ($2 \le N \le 100$), grid dimensions capped ($5 \le R \le 40, 5 \le C \le 60$), and algorithm lanes limited to max 6 concurrent lanes per race.
- **CORS Protection**: Restricted allowed origins mapped via `application.yml` (`CORS_ALLOWED_ORIGINS`).
- **Layout Preservation**: Bounding aspect ratio (`580/260`) reserved in CSS, eliminating Cumulative Layout Shift (CLS).

---

## 👤 Author & Contact

- **Author**: **Muhammad Sanan Sarwar**
- **Email**: [sanansarwar567@gmail.com](mailto:sanansarwar567@gmail.com)
- **LinkedIn**: [sanan-sarwar](https://www.linkedin.com/in/sanan-sarwar)
- **GitHub**: [Sanan507](https://github.com/Sanan507)
- **License**: MIT License (Permissive Open Source)
