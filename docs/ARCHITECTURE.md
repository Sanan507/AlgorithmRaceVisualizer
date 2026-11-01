# AlgoRace: System Architecture & Engineering Blueprint

This document details the architectural design, execution models, and data flows of **AlgoRace**, a concurrent, head-to-head algorithm benchmarking and visualization engine.

---

## 🏗️ 1. High-Level System Architecture

AlgoRace is engineered as a **hybrid dual-execution platform**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT RUNTIME (BROWSER)                                │
│                                                                                        │
│  ┌─────────────────────────┐   ┌──────────────────────────┐   ┌─────────────────────┐  │
│  │   React 18 View Layer   │   │  HTML5 Canvas 2D Engine  │   │  Web Audio Synth    │  │
│  │  (Zustand / Hooks / UI) │──▶│   (Hardware 60 FPS RAF)  │──▶│ (Polyphonic Pitches)│  │
│  └────────────┬────────────┘   └─────────────▲────────────┘   └─────────────────────┘  │
│               │                              │                                         │
│               ▼                              │                                         │
│  ┌─────────────────────────┐                 │                                         │
│  │ Simulation Coordinator  │─────────────────┘                                         │
│  │   (API Client + Cache)  │                                                           │
│  └────────────┬────────────┘                                                           │
│               │                                                                        │
│       ┌───────┴───────────────────────────────┐                                        │
│       │ Online / Connected                    │ Offline / Fallback                     │
│       ▼                                       ▼                                        │
│  ┌─────────────────────────┐         ┌─────────────────────────┐                       │
│  │ REST / SSE HTTP Client  │         │ Background Web Workers  │                       │
│  └────────────┬────────────┘         │ (simulationWorker.ts)   │                       │
│               │                      │ (treeSimulator.ts)      │                       │
│               │                      │ (dpUtils.ts)            │                       │
│               │                      └─────────────────────────┘                       │
└───────────────┼────────────────────────────────────────────────────────────────────────┘
                │ HTTP Requests (JSON DTOs)
                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           SERVER ENGINE (SPRING BOOT 3.4)                              │
│                                                                                        │
│  ┌─────────────────────────┐   ┌──────────────────────────┐   ┌─────────────────────┐  │
│  │ RateLimiter & Security  │──▶│  Simulation Controller   │──▶│  SimulationService  │  │
│  │ (Bucket4j / Headers)    │   │  (/api/simulations/*)    │   │  (Deterministic Run)│  │
│  └─────────────────────────┘   └──────────────────────────┘   └──────────┬──────────┘  │
│                                                                          │             │
│                                ┌─────────────────────────────────────────┴──────────┐  │
│                                │             Algorithm Step Generators              │  │
│                                │  • sorting/ (Quick, Merge, Heap, Tim, etc.)        │  │
│                                │  • searching/ (Binary, Jump, Exponential, etc.)    │  │
│                                │  • pathfinding/ (A*, Dijkstra, BFS, Bidirectional) │  │
│                                │  • trees/ (BST, AVL, Red-Black)                    │  │
│                                └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Core Modules Deep-Dive

### 2.1 Dynamic Programming (DP) Arena Architecture
The DP engine visualizes step-by-step subproblem memoization, recurrence equations, and optimal solution reconstruction.

- **Supported Recurrences**:
  1. **0/1 Knapsack Problem**:
     - State relation: $\text{dp}[i][w] = \max(\text{dp}[i-1][w], \text{val}[i-1] + \text{dp}[i-1][w - \text{wt}[i-1]])$
     - Dependency Tracking: Every cell records its predecessor dependencies, rendered as SVG curved bezier arrows.
     - Backtracking: Reconstructs the exact item subset selected in optimal capacity.
  2. **Longest Common Subsequence (LCS)**:
     - 2D character alignment matrix highlighting matches, diagonal progressions, and maximal sequence traces.
  3. **Edit Distance (Levenshtein)**:
     - Minimum insert, delete, and replace operation recurrence grid.
- **Rendering**:
  - Implemented in `frontend/src/components/DPCanvas.tsx` with responsive matrix cells, active row/column highlighting, and tabular coordinate scaling.

### 2.2 Tree Data Structures Arena Architecture
The Tree engine decomposes hierarchical data structures, node balance invariants, and self-balancing tree rotations:

- **Data Models**:
  - `AVLTreeModel.java` (Backend) & `treeSimulator.ts` (Client Web Worker).
  - Each node maintains:
    - `val`: Numeric key
    - `height`: Subtree height ($1 + \max(h_L, h_R)$)
    - `balance`: $\text{height}(\text{left}) - \text{height}(\text{right})$
- **Self-Balancing Rotations**:
  - **Left-Left (LL)**: Single Right Rotation on unbalanced parent.
  - **Right-Right (RR)**: Single Left Rotation on unbalanced parent.
  - **Left-Right (LR)**: Double Rotation (Left on child, Right on parent).
  - **Right-Left (RL)**: Double Rotation (Right on child, Left on parent).
- **Traversals**:
  - **In-order ($L-N-R$)**: Yields monotonic sorted order.
  - **Pre-order ($N-L-R$)**: Prefix serialization.
  - **Post-order ($L-R-N$)**: Bottom-up deletion order.
  - **Level-order (BFS)**: Horizontal breadth frontier.
- **Layout Engine**:
  - Tree coordinate positioning computes recursive horizontal spacing ($X = \text{offset} \pm \Delta X / 2^{\text{depth}}$) to eliminate overlapping nodes across arbitrary depths.

### 2.3 Head-to-Head Multi-Lane Sorting Engine
- **Deterministic Parity**: Up to 4 algorithms race simultaneously on an identical seed.
- **Hardware Canvas**: Renders array state via `CanvasVisualizer.tsx` using `CanvasRenderingContext2D`.
  - Operations color-mapped:
    - Amber (`#f59e0b`): Comparisons
    - Emerald (`#10b981`): In-place Swaps / Array Writes
    - Cyan (`#38bdf8`): Pivot / Boundary Pointers
    - Purple (`#a855f7`): Sorted Final Positions
- **Playback Clock**: `usePlayback.ts` uses `requestAnimationFrame` with variable speed multiplier ($1\times - 10\times$) and microsecond frame interpolation.

### 2.4 2D Grid Pathfinding Engine
- **Topography**: 2D grid matrix with Start, Target, Wall Obstacles, and Weighted Terrain (Mud $3\times$, Water $5\times$).
- **Procedural Mazes**: 9 generator algorithms (Recursive Backtracker, Prim's, Cellular Automata, Rooms).
- **Frontiers**: Priority queues (Min-Heap) for Dijkstra & A*, FIFO queue for BFS, and Dual Frontiers for Bidirectional BFS.

### 2.5 AlgoGym Diagnostic Arena
- **Adversarial Benchmarks**: Tests algorithmic stability against Dutch National Flag distributions (90% duplicate elements), reverse permutations, and sorted runs.
- **Interactive Challenges**:
  - *Predict the Winner*: Users hypothesize which algorithm finishes fastest before triggering the synchronized race.
  - *Spot the Bug*: Real-world edge case bug diagnosis (e.g., $(low + high) / 2$ integer overflow in binary search).

---

## 🧵 3. Threading & Dual-Execution Model

1. **Networked Mode**:
   - The client posts a simulation request (`POST /api/simulations/sorting`) with algorithm names, dataset type, and array size.
   - Spring Boot generates the full frame stream and returns an immutable `RaceResponse` payload.
2. **Worker Fallback Mode**:
   - If the backend is unreachable or latency exceeds 8 seconds (`DEFAULT_TIMEOUT_MS`), `frontend/src/services/api.ts` seamlessly delegates to `frontend/src/workers/simulationWorker.ts`.
   - The Web Worker computes the simulation frames off the main UI thread, ensuring zero browser frame drops even on heavy datasets.

---

## 🔊 4. Acoustic Synthesis Engine

- Powered by the browser's native **Web Audio API** (`AudioContext`).
- Generates polyphonic auditory signals mapped to array values:
  $$f(\text{val}) = f_{\min} \cdot \left(\frac{f_{\max}}{f_{\min}}\right)^{\frac{\text{val} - \text{min}}{\text{max} - \text{min}}}$$
- Logarithmic frequency mapping ($120\text{ Hz} - 1200\text{ Hz}$) prevents high-pitch ear fatigue while providing acoustic feedback for element comparisons and swaps.

---

## 🛡️ 5. Security & Reliability Architecture

- **Rate Limiting**: Spring Boot implements token-bucket rate limiting (`RateLimitFilter.java`) per IP address to safeguard server compute.
- **Input Validation**: Strict request constraints (Max array size 160, max grid dimensions $30 \times 30$) prevent Denial-of-Service (DoS) memory exhaustion.
- **Security Headers**: Built-in HTTP filters enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict CSP policies.

