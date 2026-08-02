import subprocess
import time

def create_issue(title, labels, body, max_retries=5):
    cmd = [
        "gh", "issue", "create",
        "--repo", "Sanan507/AlgorithmRaceVisualizer",
        "--title", title
    ]
    if labels:
        for label in labels.split(","):
            label = label.strip()
            if label:
                cmd.extend(["--label", label])
    cmd.extend(["--body", body])

    print(f"  Creating: {title}")
    for attempt in range(1, max_retries + 1):
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  Success : {result.stdout.strip()}")
            return
        else:
            err_msg = result.stderr.strip().replace("\n", " ")
            print(f"  [Attempt {attempt}/{max_retries}] Waiting to retry: {err_msg[:90]}...")
            if attempt < max_retries:
                time.sleep(4 * attempt)
    print(f"  Error: Failed after {max_retries} attempts.")


# =============================================================================
# ARCHIVE RECORD: ALL 12 CREATED HIGH-IMPACT ARCHITECTURAL & FEATURE ISSUES
# =============================================================================


# --- ISSUE 1 ------------------------------------------------------------------
def issue_1():
    create_issue(
        title="feat(sorting): Add Tim Sort Hybrid Algorithm",
        labels="enhancement",
        body="""### Overview
Implement Tim Sort in the backend sorting engine. Tim Sort is Python's and Java's default standard sorting algorithm — a hybrid of Merge Sort and Insertion Sort — and its inclusion provides learners with insight into production-grade sorting mechanics.

### Implementation Details & File Reference
- **Algorithm Model**: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/sorting/TimSortModel.java` extending `AlgorithmModel`.
  - Divide array into small runs (e.g. run size = 32), sort each run using Insertion Sort, then merge runs using Merge Sort while emitting `SimulationFrame` objects for every comparison and swap.
- **Factory Registration**: Add `"Tim Sort"` → `TimSortModel` mapping in `SortingAlgorithmFactory.java`.
- **Complexity Catalog**: Register complexity metrics (`O(N log N)` average/worst, `O(N)` best-case, `O(N)` space) in `ComplexityCatalog.java`.
- **Frontend Metadata**: Add entry in `frontend/src/data/algorithmMetadata.ts` with `stable: true` and `inPlace: false`.

### Definition of Done
- Tim Sort appears in the Sorting Arena dropdown selector.
- Runs end-to-end with accurate frame-by-frame step recording.
- Complexity details render correctly in the Performance Comparison panel and Benchmarks page.

### Skill Level
Hard — requires implementing hybrid run-building and run-merging logic with exact frame state tracking."""
    )


# --- ISSUE 2 ------------------------------------------------------------------
def issue_2():
    create_issue(
        title="feat(pathfinding): Add Jump Point Search (JPS) Algorithm",
        labels="enhancement",
        body="""### Overview
Implement Jump Point Search (JPS) for grid pathfinding. JPS is an optimization of A* on uniform-cost grids that skips symmetric paths by jumping across straight lines until a forced neighbor or obstacle is encountered, speeding up pathfinding by up to 10x-100x.

### Implementation Details & File Reference
- **Algorithm Model**: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/pathfinding/JPSModel.java` extending `PathfindingModel`.
  - Implement direction-aware jump functions along horizontal, vertical, and diagonal lines.
  - Record jump points and intermediate visited nodes as `SimulationFrame` frames with distinct `CellState` markers.
- **Factory Registration**: Register `"Jump Point Search"` in `PathfindingFactory.java`.
- **Complexity Catalog**: Add entry in `ComplexityCatalog.java` highlighting `O(b^d)` reduced search space.
- **Frontend Metadata**: Add entry in `frontend/src/data/algorithmMetadata.ts` (`complete: true`, `optimal: true`, `weighted: false`).

### Definition of Done
- Jump Point Search is selectable in the Pathfinding Arena.
- Shows dramatic node expansion reductions compared to standard A*.
- Path reconstruction from jump points is optimal and accurate.

### Skill Level
Hard — requires implementing diagonal and cardinal jump pruning rules on 2D grid coordinates."""
    )


# --- ISSUE 3 ------------------------------------------------------------------
def issue_3():
    create_issue(
        title="feat(pathfinding): Add Bidirectional BFS Algorithm",
        labels="enhancement",
        body="""### Overview
Implement Bidirectional BFS in the pathfinding engine. It simultaneously expands two frontiers — one from the source node and one from the target node — meeting in the middle to halve search depth and explore significantly fewer nodes.

### Implementation Details & File Reference
- **Algorithm Model**: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/pathfinding/BidirectionalBFSModel.java` extending `PathfindingModel`.
  - Maintain forward queue (`start`) and backward queue (`end`), alternating step expansions.
  - Record visited cells with distinct `CellState` values (`VISITED_FORWARD`, `VISITED_BACKWARD`) for visual distinction.
  - Join parent chains when frontiers intersect to reconstruct the complete path.
- **Factory Registration**: Register `"Bidirectional BFS"` in `PathfindingFactory.java`.
- **Complexity Catalog**: Add entry with `O(b^(d/2))` time note in `ComplexityCatalog.java`.
- **Frontend Metadata**: Add entry in `frontend/src/data/algorithmMetadata.ts`.

### Definition of Done
- Bidirectional BFS appears in the Pathfinding Arena.
- Grid visualization displays two expanding frontiers converging in the middle.
- Metrics accurately display total cells visited and optimal path length.

### Skill Level
Medium — requires dual-frontier state management and path stitching at intersection."""
    )


# --- ISSUE 4 ------------------------------------------------------------------
def issue_4():
    create_issue(
        title="feat(pathfinding): Add Greedy Best-First Search Algorithm",
        labels="enhancement,good first issue",
        body="""### Overview
Add Greedy Best-First Search to the Pathfinding Arena. Unlike A* which balances path cost g(n) + heuristic h(n), Greedy BFS relies solely on the Manhattan distance heuristic h(n), providing a fast but non-optimal search for educational contrast.

### Implementation Details & File Reference
- **Algorithm Model**: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/pathfinding/GreedyBFSModel.java` extending `PathfindingModel`.
  - Use priority queue ordered strictly by heuristic distance `h(cell, end)`.
- **Factory Registration**: Add `"Greedy Best-First"` in `PathfindingFactory.java`.
- **Complexity Catalog**: Add entry in `ComplexityCatalog.java` highlighting non-optimality.
- **Frontend Metadata**: Add entry in `frontend/src/data/algorithmMetadata.ts` (`complete: false`, `optimal: false`).

### Definition of Done
- Greedy Best-First Search appears in the Pathfinding Arena selector.
- Visually demonstrates aggressive target-seeking movement that can get trapped by obstacles.
- Metadata indicates `optimal: false`.

### Skill Level
Good first issue — straightforward heuristic priority queue implementation."""
    )


# --- ISSUE 5 ------------------------------------------------------------------
def issue_5():
    create_issue(
        title="feat(searching): Add Ternary Search Algorithm",
        labels="enhancement",
        body="""### Overview
Implement Ternary Search in the searching engine. Ternary Search divides a sorted array into three equal segments using two midpoints (`mid1`, `mid2`), offering a visual contrast to Binary Search with `O(log3 N)` time complexity.

### Implementation Details & File Reference
- **Algorithm Model**: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/searching/TernarySearchModel.java` extending `SearchModel`.
  - Record frame states with left bound (`lo`), right bound (`hi`), `mid1`, and `mid2` highlights per iteration step.
- **Factory Registration**: Register `"Ternary Search"` in `SearchingAlgorithmFactory.java`.
- **Complexity Catalog**: Add entry (`O(log3 N)` time complexity) in `ComplexityCatalog.java`.
- **Frontend Metadata**: Add entry in `frontend/src/data/algorithmMetadata.ts`.

### Definition of Done
- Ternary Search appears in the Searching Arena dropdown.
- Visualizer highlights `mid1` and `mid2` bounds during search steps.
- Search metrics accurately record comparison counts.

### Skill Level
Medium — requires three-way boundary partitioning and frame state recording."""
    )


# --- ISSUE 6 ------------------------------------------------------------------
def issue_6():
    create_issue(
        title="feat(audio): Web Audio Synthesizer with Value-to-Pitch Frequency Mapping",
        labels="enhancement",
        body="""### Overview
Upgrade the audio system into a polyphonic Web Audio API sound synthesizer that maps array values to musical pitches (e.g. pentatonic scale 220Hz - 880Hz). When elements are compared or swapped, the visualizer generates real-time audio tones, creating classic algorithm soundscapes.

### Implementation Details & File Reference
- **Audio Engine**: Update `frontend/src/context/AudioContext.tsx` using native `AudioContext` and `OscillatorNode`.
  - Function `playToneForValue(value: number, minValue: number, maxValue: number, type: 'compare' | 'swap')`.
  - Map normalized value `(val - min) / (max - min)` to a pentatonic scale frequency range.
- **Playback Integration**: Wire sound calls inside playback step hooks in `frontend/src/hooks/usePlayback.ts`.
- **User Settings**: Add a volume control slider and pitch toggle in `frontend/src/pages/SettingsPage.tsx`.

### Definition of Done
- Toggling audio plays real-time harmonic tones during sorting and searching races.
- Swaps produce higher velocity tones than comparisons.
- Volume slider in Settings controls gain level smoothly without distortion.

### Skill Level
Hard — requires Web Audio API synthesis, oscillator management, and non-blocking playback integration."""
    )


# --- ISSUE 7 ------------------------------------------------------------------
def issue_7():
    create_issue(
        title="feat(customization): Interactive Custom Array & Grid Canvas Drawing Tool",
        labels="enhancement",
        body="""### Overview
Allow users to enter custom datasets. For Sorting and Searching, add a custom comma-separated number input box. For Pathfinding, implement an interactive grid canvas drawing tool allowing users to click/drag to draw custom walls, start/target nodes, and weighted terrain.

### Implementation Details & File Reference
- **Sorting/Searching Custom Input**: Add custom array text input in `frontend/src/pages/SortingPage.tsx` and `SearchingPage.tsx` using `parseCustomArrayInput`.
- **Pathfinding Canvas Editor**: Update `frontend/src/pages/PathfindingPage.tsx` to handle mouse drag events (`onMouseDown`, `onMouseEnter`) on grid cells to toggle walls or set start/target coordinates.
- **Backend DTO**: Pass custom grid matrix or array payload in `SortingSimulationRequest` and `PathfindingSimulationRequest`.

### Definition of Done
- Users can type custom array values (e.g. `42, 7, 19, 88`) and race algorithms on them.
- Users can draw maze walls or relocate start/end nodes directly on the grid before starting a race.
- Custom setups submit to backend successfully and render simulation frames accurately.

### Skill Level
Hard — requires mouse event state handling on canvas/grid and custom payload validation."""
    )


# --- ISSUE 8 ------------------------------------------------------------------
def issue_8():
    create_issue(
        title="feat(export): Benchmark Performance Telemetry & Race Data Exporter (CSV / JSON)",
        labels="enhancement",
        body="""### Overview
Add an export feature allowing users, researchers, and students to download benchmark race data (execution times, operation counts, winner metrics, array size, algorithm list) as CSV or JSON files for offline analysis and lab reports.

### Implementation Details & File Reference
- **Export Utility**: Create `frontend/src/utils/exportTelemetry.ts` with `exportRaceToCSV(raceData)` and `exportRaceToJSON(raceData)`.
  - Format data into clean tabular columns (Algorithm, Operations, Execution Time (ms), Swaps, Winner, Dataset Config).
  - Use `Blob` and `URL.createObjectURL` to trigger instant browser file downloads.
- **UI Action Buttons**: Add "Export CSV" and "Export JSON" buttons in the Performance Comparison panel (`frontend/src/components/AlgorithmComparisonCenter.tsx`).

### Definition of Done
- Clicking "Export CSV" downloads a structured `.csv` file containing complete race metrics.
- Clicking "Export JSON" downloads a formatted `.json` file containing raw telemetry.
- Supported across Sorting, Searching, and Pathfinding race results.

### Skill Level
Medium — data formatting, Blob creation, and browser download trigger implementation."""
    )


# --- ISSUE 9 ------------------------------------------------------------------
def issue_9():
    create_issue(
        title="feat(history): Persistent Race Session History & Performance Analytics Center",
        labels="enhancement",
        body="""### Overview
Persist complete race execution history across browser reloads using `localStorage` and build a historical performance analytics dashboard where users can filter past races, compare speed trends over time, and clear stored history.

### Implementation Details & File Reference
- **History Storage**: Create `frontend/src/utils/historyStorage.ts` to read/write `RaceHistoryEntry[]` in `localStorage`.
- **Event Hook**: Automatically record race completions in `SortingPage.tsx`, `SearchingPage.tsx`, and `PathfindingPage.tsx`.
- **History Page Update**: Refactor `frontend/src/pages/HistoryPage.tsx` to display real persistent history entries alongside theoretical complexity matrices.
- **Filtering & Clearing**: Add filter dropdown (by Arena Type / Winner) and a "Clear History" button wired to `localStorage.removeItem()`.

### Definition of Done
- Refreshing the application preserves past race history logs.
- History Page displays real race entries with dates, winner badges, and metric summaries.
- Clear History wipes stored data and updates UI immediately.

### Skill Level
Medium — localStorage state management, type definitions, and history page UI integration."""
    )


# --- ISSUE 10 -----------------------------------------------------------------
def issue_10():
    create_issue(
        title="feat(comparison): Head-to-Head 1-on-1 Battle Arena with Live Operation Delta Charts",
        labels="enhancement",
        body="""### Overview
Create a dedicated 1-on-1 Head-to-Head Battle Arena view that pairs any two selected algorithms in a direct showdown, featuring a real-time differential graph showing operation lead/lag deltas as the race progresses.

### Implementation Details & File Reference
- **Battle View Component**: Create `frontend/src/components/HeadToHeadBattle.tsx`.
  - Dual synchronized side-by-side visualizers.
  - Live difference graph rendering `Algorithm A Ops - Algorithm B Ops` per frame index.
- **Navigation Route**: Add route `/battle` in `frontend/src/App.tsx` and navbar button.
- **Victory Analytics**: Display detailed winner summary banner highlighting speed ratio (e.g. "Quick Sort was 4.2x faster than Bubble Sort").

### Definition of Done
- Head-to-Head Battle mode allows selecting two algorithms for 1-on-1 racing.
- Differential operation chart updates dynamically during playback.
- Winner victory breakdown displays accurate speed ratios.

### Skill Level
Hard — requires synchronized dual-lane rendering and live chart delta calculations."""
    )


# --- ISSUE 11 -----------------------------------------------------------------
def issue_11():
    create_issue(
        title="feat(backend): Server-Sent Events (SSE) Live Frame Streaming Engine",
        labels="enhancement",
        body="""### Overview
Implement Server-Sent Events (SSE) streaming for simulation endpoints. For large benchmarks ($N > 1000$ or complex $100 \\times 100$ grids), SSE streams simulation frames in real-time as they are computed, eliminating large memory payloads and enabling instant playback start.

### Implementation Details & File Reference
- **SSE Controller**: Create `backend/src/main/java/com/algorithmrace/visualizer/controller/StreamController.java`.
  - Endpoint `GET /api/simulations/stream/sorting` returning `SseEmitter`.
- **Streaming Service**: Update backend algorithm models to accept a frame consumer callback `Consumer<SimulationFrame>`, emitting frames directly to the emitter as the loop runs.
- **Frontend EventSource**: Create `frontend/src/services/sseClient.ts` to consume `EventSource` streams into the `usePlayback` frame buffer.

### Definition of Done
- SSE streaming endpoint streams simulation frames asynchronously.
- Frontend starts animating instantly without waiting for total simulation completion.
- Handles connection dropouts and emitter completion cleanly.

### Skill Level
Hard — Spring SseEmitter implementation, reactive frame streaming, and client EventSource handling."""
    )


# --- ISSUE 12 -----------------------------------------------------------------
def issue_12():
    create_issue(
        title="refactor(ui): Modern Design System & CSS Variable Theme Token Architecture",
        labels="enhancement",
        body="""### Overview
Systematically refactor `frontend/src/styles.css` to replace all scattered hardcoded hex color values with a unified CSS Custom Properties (design tokens) architecture in `:root`, supporting single-attribute `[data-theme='light']` theme swapping.

### Implementation Details & File Reference
- **Tokens Definition**: Define semantic CSS variables in `frontend/src/styles.css` (`--color-bg-primary`, `--color-bg-secondary`, `--color-surface`, `--color-border`, `--color-text-primary`, `--color-accent`, `--color-accent-glow`).
- **Light Theme Tokens**: Add `[data-theme='light']` override selector mapping tokens to high-contrast light theme values.
- **Refactor Raw Hexes**: Replace all hardcoded hex literals across `styles.css` with token variables.
- **Theme Toggle**: Update theme switcher in `frontend/src/App.tsx` to set `document.documentElement.setAttribute('data-theme', theme)`.

### Definition of Done
- Toggling dark/light mode switches all UI component colors seamlessly via a single `data-theme` attribute.
- Zero visual regressions in dark mode.
- All raw color literals in CSS are replaced by design token variables.

### Skill Level
Medium — comprehensive CSS search-and-replace and design token architecture refactoring."""
    )


# =============================================================================
# ARCHIVE RUNNER — ALL 12 ISSUES ARE SUCCESSFULLY CREATED ON GITHUB
# =============================================================================
if __name__ == "__main__":
    # All 12 issues have been created on GitHub.
    # To re-push any issue in the future, add its function name to the list below.
    selected = [
        # issue_1,   # feat(sorting): Add Tim Sort Hybrid Algorithm (Created: #92)
        # issue_2,   # feat(pathfinding): Add Jump Point Search (JPS) (Created: #93)
        # issue_3,   # feat(pathfinding): Add Bidirectional BFS (Created: #83)
        # issue_4,   # feat(pathfinding): Add Greedy Best-First Search (Created: #84)
        # issue_5,   # feat(searching): Add Ternary Search Algorithm (Created: #94)
        # issue_6,   # feat(audio): Web Audio Synthesizer (Value-to-Pitch) (Created: #85)
        # issue_7,   # feat(customization): Interactive Custom Map & Array Canvas (Created: #86)
        # issue_8,   # feat(export): Benchmark Performance Telemetry Exporter (Created: #87)
        # issue_9,   # feat(history): Persistent Race Session History (Created: #88)
        # issue_10,  # feat(comparison): Head-to-Head 1-on-1 Battle Arena (Created: #89)
        # issue_11,  # feat(backend): Server-Sent Events (SSE) Live Streaming (Created: #90)
        # issue_12,  # refactor(ui): Modern Design System & CSS Token Architecture (Created: #91)
    ]

    if not selected:
        print("All 12 issues are already published on GitHub! (File preserved for record)")
    else:
        print(f"Pushing {len(selected)} issue(s) to Sanan507/AlgorithmRaceVisualizer...\n")
        for idx, fn in enumerate(selected, 1):
            print(f"[{idx}/{len(selected)}]")
            fn()
            time.sleep(2)
            print()
        print("Done!")
