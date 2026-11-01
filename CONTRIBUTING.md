# Contributing to AlgoRace

Thank you for your interest in contributing to **AlgoRace**! We welcome contributions from developers of all skill levels. Whether you are fixing a bug, adding a new algorithm, improving performance, optimizing visualizers, or enhancing the documentation, your help is deeply appreciated.

---

## 🚀 Quick Start & Development Setup

### 1. Prerequisites
- **Java**: JDK 21 or later (Temurin or OpenJDK recommended)
- **Apache Maven**: v3.9+
- **Node.js**: v18+ or v20+ (Node 20/22 LTS recommended) and npm v9+
- **Git**: Installed and configured

### 2. Clone the Repository
```bash
git clone https://github.com/Sanan507/AlgorithmRaceVisualizer.git
cd AlgorithmRaceVisualizer
```

### 3. Run the Backend (Spring Boot 3.4 API Engine)
```bash
cd backend
mvn spring-boot:run
```
The Spring Boot server will start on `http://localhost:8080`.  
- OpenAPI / Swagger documentation is available at `http://localhost:8080/swagger-ui.html`.
- Health check is accessible at `http://localhost:8080/api/catalog`.

### 4. Run the Frontend (React 18 + TypeScript + Vite)
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React development server will start on `http://localhost:5173`.

---

## 📁 Repository Structure Overview

```text
AlgorithmRaceVisualizer/
│
├── backend/                                      # Spring Boot 3.4 REST Engine (Java 21)
│   ├── src/main/java/com/algorithmrace/visualizer/
│   │   ├── algorithms/
│   │   │   ├── sorting/                          # Sorting step generators (e.g., QuickSortModel, TimSortModel)
│   │   │   ├── searching/                        # Searching step generators (e.g., BinarySearchModel)
│   │   │   ├── pathfinding/                      # Graph pathfinding models (e.g., DijkstraModel, AStarModel)
│   │   │   └── trees/                            # Self-balancing & BST models (BSTModel, AVLTreeModel, RedBlackTreeModel)
│   │   ├── controller/                           # REST Controllers (/api/simulations/*, /api/catalog)
│   │   ├── dto/                                  # Simulation request & response DTOs
│   │   ├── model/                                # Core simulation frame & state models
│   │   ├── service/                              # SimulationService & CatalogService execution engine
│   │   └── utils/                                # Array & Maze procedural generators, ComplexityCatalog
│   ├── src/test/java/                            # JUnit 5 backend test suite (38+ tests)
│   └── pom.xml                                   # Maven configuration with Spotless code formatter
│
├── frontend/                                     # React 18 + TypeScript + Vite Client
│   ├── src/
│   │   ├── components/                           # Reusable UI & Canvas visualizers
│   │   │   ├── CanvasVisualizer.tsx              # Hardware 60 FPS sorting canvas
│   │   │   ├── DPCanvas.tsx                      # Dynamic Programming matrix table renderer
│   │   │   ├── TreeCanvas.tsx                    # Hierarchical node & rotation renderer
│   │   │   ├── PathfindingCanvas.tsx             # 2D grid path exploration canvas
│   │   │   ├── GymShowdownCanvas.tsx             # Head-to-head showdown simulator
│   │   │   ├── ArenaCodeInspector.tsx            # Multi-language synchronized code tracer
│   │   │   └── Controls.tsx                      # Unified playback & speed scrubber bar
│   │   ├── data/                                 # Static catalogs & metadata
│   │   │   ├── fallbackCatalog.ts                # Client fallback algorithms catalog
│   │   │   ├── algorithmMetadata.ts              # Big-O complexity & pseudocode definitions
│   │   │   └── gymChallenges.ts                  # Interview bug diagnosis & showdown datasets
│   │   ├── hooks/                                # Custom React hooks
│   │   │   ├── usePlayback.ts                    # RAF-synchronized 60 FPS timeline ticker
│   │   │   ├── useAudio.ts                       # Web Audio API polyphonic acoustic synthesizer
│   │   │   └── useTheme.ts                       # Dark/Light & accessibility color-blind palettes
│   │   ├── models/                               # TypeScript API interfaces & simulation types
│   │   ├── pages/                                # Route pages
│   │   │   ├── LandingPage.tsx                   # Interactive hero portal & arena launcher
│   │   │   ├── SortingPage.tsx                   # Head-to-head multi-lane sorting arena
│   │   │   ├── SearchingPage.tsx                 # Search space elimination arena
│   │   │   ├── PathfindingPage.tsx               # 2D maze & terrain pathfinding arena
│   │   │   ├── DPPage.tsx                        # Dynamic Programming subproblem recurrence arena
│   │   │   ├── TreesPage.tsx                     # Self-balancing BST / AVL / Red-Black tree arena
│   │   │   ├── AlgoGymPage.tsx                   # Gamified challenge & bug diagnosis arena
│   │   │   ├── BenchmarksPage.tsx                # Telemetry dashboard & CSV/PNG export
│   │   │   └── MatrixPage.tsx                    # Comprehensive algorithm feature comparison matrix
│   │   ├── services/                             # API client, SSE streaming, & fallback coordinator
│   │   ├── utils/                                # Pure simulation helpers
│   │   │   ├── treeSimulator.ts                  # Client-side AVL/BST/RB rotation engine & traversals
│   │   │   ├── dpUtils.ts                        # Knapsack, LCS, & Edit Distance state solvers
│   │   │   └── arrayParser.ts                    # Custom dataset tokenizer & validator
│   │   └── workers/                              # Background Web Workers
│   │       └── simulationWorker.ts               # Off-thread sorting & searching simulation engine
│   ├── nginx.conf                                # Production Nginx reverse-proxy configuration
│   └── package.json                              # Vite, React, Vitest configuration
│
├── .github/
│   └── workflows/
│       └── ci.yml                                # Automated CI pipeline (Frontend & Backend tests)
├── docs/
│   ├── ARCHITECTURE.md                           # In-depth architectural design & execution flow
│   ├── DEPLOYMENT.md                             # Production deployment & environment guide
│   ├── DESIGN.md                                 # UI/UX design tokens & visual standards
│   ├── PRODUCT.md                                # Strategic product vision & roadmap
│   └── images/                                   # Visual showcase screenshots & demo recordings
├── docker-compose.yml                            # Local container orchestration
├── docker-compose.prod.yml                       # Production multi-service container orchestration
├── LICENSE                                       # Source-Available Non-Commercial License
└── CONTRIBUTING.md                               # Contributor guide & DCO agreement
```

---

## 🧩 Architectural Guide: Adding New Modules & Algorithms

AlgoRace utilizes a **hybrid dual-execution model**:
1. **Server-Side Engine (Java 21 Spring Boot)**: Generates deterministic simulation frames containing operation counts, active element highlights, pivot points, boundary indices, and time metrics.
2. **Client-Side Engine (Web Workers & TypeScript)**: Mirrors backend logic directly inside background Web Workers (`simulationWorker.ts`) and utility engines (`treeSimulator.ts`, `dpUtils.ts`) to provide instant offline previews and fallback execution when the backend is unavailable or sleeping.

### Adding a New Sorting or Searching Algorithm
1. **Backend**:
   - Create a model in `backend/src/main/java/com/algorithmrace/visualizer/algorithms/sorting/` (or `searching/`).
   - Implement the step recording loop, capturing each `SimulationFrame` (comparison, swap, boundary, and memory write).
   - Register the algorithm name and metadata in `ComplexityCatalog.java` and `SimulationService.java`.
   - Add unit tests in `SortingAlgorithmsTest.java` (or `SearchingAlgorithmsTest.java`).
2. **Frontend**:
   - Add the client simulation logic into `frontend/src/workers/simulationWorker.ts`.
   - Register the algorithm's metadata (Time/Space Complexity, Best/Worst cases, Pseudocode for all 4 languages: TS, Java, Python, C++) in `frontend/src/data/algorithmMetadata.ts` and `fallbackCatalog.ts`.

### Adding a Dynamic Programming (DP) Problem
- DP visualizers live in `frontend/src/pages/DPPage.tsx`, `frontend/src/components/DPCanvas.tsx`, and `frontend/src/utils/dpUtils.ts`.
- Each DP state transition must compute:
  1. The 2D recurrence matrix (`dp[i][j]`).
  2. The cell dependency pointers (which previous subproblem cells contributed to the current value).
  3. The backtrack reconstruction path to display the final optimal set or aligned sequence.

### Adding a Tree Structure or Graph Algorithm
- **Tree Models**: Located in `backend/.../algorithms/trees/` and `frontend/src/utils/treeSimulator.ts`.
- Support animated self-balancing operations: Balance Factor evaluation, Rotation triggers (Left-Left, Right-Right, Left-Right, Right-Left), and traversal frontiers (In-order, Pre-order, Post-order, Level-order BFS).
- Render nodes through `frontend/src/components/TreeCanvas.tsx` utilizing logarithmic tree layout coordinate positioning.

---

## 🏷️ How to Pick Up an Issue

1. **Browse Issues**: Look for issues labeled [`good first issue`](https://github.com/Sanan507/AlgorithmRaceVisualizer/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [`enhancement`](https://github.com/Sanan507/AlgorithmRaceVisualizer/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement).
2. **Assign Yourself / Comment**: Comment on the issue to declare your intent to work on it so duplicate efforts are avoided.
3. **Follow Coding Standards**:
   - Backend: Run `mvn spotless:apply` before committing. Ensure code adheres to clean Java 21 idioms.
   - Frontend: Ensure TypeScript compiles with zero errors (`tsc -b`), ESLint passes (`npm run lint`), and responsive styles function across mobile, tablet, and desktop viewports.
4. **Run Automated Tests**:
   - Backend: `mvn test` in the `backend/` directory.
   - Frontend: `npm test` in the `frontend/` directory.

---

## 🔀 Submitting a Pull Request (PR)

1. Create a feature branch off **`master`** (the default branch):
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feature/my-new-algorithm
   ```
2. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(trees): add Red-Black Tree deletion balancing simulation"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/my-new-algorithm
   ```
4. **Open a Pull Request on GitHub targeting the `master` branch**.
   - Fill out the PR template summarizing your changes.
   - Include screenshots or GIFs for visual changes.
   - Verify that automated CI checks pass.

---

## 📜 Contributor Terms & Developer Certificate of Origin (DCO)

To protect the project, its users, and future maintainers, buyers, and assignees, all contributions to **AlgoRace** are made under the **Developer Certificate of Origin (DCO 1.1)** and the terms below.

By submitting a pull request or patch to this repository, you certify that:

1. **Original Work & Clear Title**: The contribution was created in whole or in part by you, and you have the right to submit it under the open-source license indicated in the repository; or you are providing the contribution based upon previous work that, to the best of your knowledge, is covered under an appropriate open-source license and you have the right under that license to submit that work with modifications, whether created in whole or in part by you, under the same open-source license.
2. **License Grant**: Your contribution is licensed under the terms of the project's **Source-Available Non-Commercial License** (see [LICENSE](LICENSE)).
3. **Relicensing & Commercial Rights**: You grant the project maintainer (**Muhammad Sanan Sarwar / Sanan507**) and any designated successors, buyers, transferees, or assignees a perpetual, irrevocable, worldwide, non-exclusive, royalty-free, transferable, and sublicensable right to use, modify, adapt, relicense, dual-license, bundle, distribute, and commercialize your contribution as part of this software or derivative works, without restriction and without requiring individual contributor re-approval.
4. **Attribution**: You retain moral attribution for your original contributions as recognized in Git commit histories and public release changelogs.
5. **Open Contribution**: You understand and agree that this project and your contribution are public and that a record of the contribution (including all personal information you submit with it, including your sign-off and commit metadata) is maintained indefinitely and may be redistributed consistent with this project and the open-source license(s) involved.
