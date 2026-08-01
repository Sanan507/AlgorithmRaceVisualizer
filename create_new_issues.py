import subprocess

def create_issue(title, labels, body):
    cmd = [
        "gh", "issue", "create",
        "--repo", "Sanan507/AlgorithmRaceVisualizer",
        "--title", title,
        "--label", labels,
        "--body", body
    ]
    print(f"  Creating: {title}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"  Success : {result.stdout.strip()}")
    else:
        print(f"  Error   : {result.stderr.strip()}")


# =============================================================================
# DELETE OR COMMENT OUT any issues below that you do NOT want to push.
# Then run:  python create_new_issues.py
# =============================================================================


# --- ISSUE 1 ------------------------------------------------------------------
def issue_1():
    create_issue(
        title="feat(sorting): Add Tim Sort Algorithm",
        labels="enhancement,good first issue,jule",
        body="""### Overview
Implement Tim Sort in the backend sorting engine. Tim Sort is Python's and Java's default sort — a hybrid of Merge Sort and Insertion Sort — and its inclusion gives learners insight into real-world production sorting.

### Implementation Details & File Reference
- Algorithm Model: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/sorting/TimSortModel.java` implementing `AlgorithmModel`.
  - Split array into chunks (~32 elements), Insertion Sort each chunk, then Merge chunks together recording every swap/comparison as a `SimulationFrame`.
- Factory Registration: Add `"Tim Sort"` → `TimSortModel` in `SortingAlgorithmFactory.java`.
- Complexity Catalog: Add entry to `ComplexityCatalog.java` (`O(N log N)` average/worst, `O(N)` best-case).
- Frontend Metadata: Add entry to `frontend/src/data/algorithmMetadata.ts` (stable: true, inPlace: false).

### Definition of Done
- Tim Sort appears in the Sorting Arena algorithm selector dropdown.
- Race runs correctly end-to-end with accurate frame-by-frame step recording.
- Complexity info appears correctly in the Performance Comparison panel.

### Skill Level
Medium — requires understanding of hybrid sorting internals and frame-step recording pattern."""
    )


# --- ISSUE 2 ------------------------------------------------------------------
def issue_2():
    create_issue(
        title="feat(sorting): Add Counting Sort Algorithm",
        labels="enhancement,good first issue,jule",
        body="""### Overview
Add Counting Sort (non-comparison integer sort) to the sorting arena. This gives users a concrete example of a linear-time O(N+K) sort and illustrates the trade-off between time and space complexity.

### Implementation Details & File Reference
- Algorithm Model: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/sorting/CountingSortModel.java` implementing `AlgorithmModel`.
  - Record a `SimulationFrame` for each count-bucket increment and each element placement into the output array.
- Factory Registration: Register `"Counting Sort"` in `SortingAlgorithmFactory.java`.
- Complexity Catalog: Add entry (`O(N+K)` time, `O(K)` space) in `ComplexityCatalog.java`.
- Frontend Metadata: Add entry to `frontend/src/data/algorithmMetadata.ts` (stable: true, inPlace: false).

### Definition of Done
- Counting Sort appears in the Sorting Arena and runs correctly for datasets with non-negative integer values.
- Frames accurately capture the count-then-place phase transitions.
- Complexity panel reflects O(N+K) correctly.

### Skill Level
Good first issue — straightforward algorithm; frame-recording pattern can be copied from existing models."""
    )


# --- ISSUE 3 ------------------------------------------------------------------
def issue_3():
    create_issue(
        title="feat(pathfinding): Add Greedy Best-First Search Algorithm",
        labels="enhancement,good first issue,jule",
        body="""### Overview
Add Greedy Best-First Search to the Pathfinding Arena. Unlike A* which balances cost + heuristic, Greedy BFS uses only the heuristic (Manhattan distance), making it faster but non-optimal — a great educational contrast for learners.

### Implementation Details & File Reference
- Algorithm Model: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/pathfinding/GreedyBFSModel.java` implementing `PathfindingModel`.
  - Priority queue ordered by Manhattan distance heuristic `h(n)` to target node only (no g-cost).
  - Record each visited cell as a `SimulationFrame` with `CellState`.
- Factory Registration: Add `"Greedy Best-First"` in `PathfindingFactory.java`.
- Complexity Catalog: Entry with `O(b^m)` worst-case note in `ComplexityCatalog.java`.
- Frontend Metadata: Entry in `frontend/src/data/algorithmMetadata.ts` (complete: false, optimal: false, weighted: false).

### Definition of Done
- Greedy Best-First Search appears in the Pathfinding Arena selector.
- Runs end-to-end; visually shows faster but potentially non-optimal path versus A*.
- Algorithm metadata and complexity are correct.

### Skill Level
Good first issue — can directly copy AStarModel.java and remove the g-cost portion."""
    )


# --- ISSUE 4 ------------------------------------------------------------------
def issue_4():
    create_issue(
        title="feat(searching): Add Ternary Search Algorithm",
        labels="enhancement,good first issue,jule",
        body="""### Overview
Add Ternary Search to the Searching Arena. It divides the search space into three parts (vs Binary Search's two), making it a useful visual contrast to Binary Search with O(log3 N) complexity.

### Implementation Details & File Reference
- Algorithm Model: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/searching/TernarySearchModel.java` implementing `SearchModel`.
  - Record each comparison frame with left boundary (`lo`), right boundary (`hi`), and two midpoints (`mid1`, `mid2`).
- Factory Registration: Add `"Ternary Search"` in `SearchingAlgorithmFactory.java`.
- Complexity Catalog: Add entry (`O(log3 N)` time, sorted-array requirement) in `ComplexityCatalog.java`.
- Frontend Metadata: Add entry in `frontend/src/data/algorithmMetadata.ts`.

### Definition of Done
- Ternary Search appears in the Searching Arena selector alongside Binary/Linear/Jump/Exponential.
- Frames correctly show three-zone narrowing per step.
- Metadata and complexity info display correctly.

### Skill Level
Good first issue — can directly reference BinarySearchModel.java as a template."""
    )


# --- ISSUE 5 ------------------------------------------------------------------
def issue_5():
    create_issue(
        title="feat(ux): Playback Timeline Scrubber / Frame Seek Bar",
        labels="enhancement,jule",
        body="""### Overview
Add a horizontal timeline scrubber below the playback controls that lets users drag to any frame index in the race — similar to a video progress bar. Currently the only way to reach a specific step is by clicking Step Forward repeatedly.

### Implementation Details & File Reference
- Controls Component: Update `frontend/src/components/Controls.tsx` to render an `<input type="range">` scrubber.
  - `min=0`, `max=maxFrames - 1`, `value=frameIndex`, `onChange` calls `seek(index)` from `usePlayback`.
- Playback Hook: The `seek(index)` function already exists in `frontend/src/hooks/usePlayback.ts` — wire it up.
- Styling: Style the range slider using existing CSS variables in `frontend/src/styles.css` to match the cyber dashboard aesthetic. Add a step counter label (`Frame X / N`).

### Definition of Done
- Dragging the scrubber thumb updates the visualizer canvas in real time to the selected frame.
- Step counter label updates correctly on scrub.
- Scrubbing pauses playback automatically (matches existing `seek` behavior in usePlayback.ts).

### Skill Level
Medium — wiring existing hook to new UI element; CSS custom range-input styling."""
    )


# --- ISSUE 6 ------------------------------------------------------------------
def issue_6():
    create_issue(
        title="feat(ux): Race Replay Button Without Re-Fetching",
        labels="enhancement,good first issue,jule",
        body="""### Overview
After a race finishes, add a "Replay ↺" button that instantly restarts the animation from frame 0 without making a new API call to the backend. Currently the user must click "Start Race" again which triggers a full re-fetch.

### Implementation Details & File Reference
- Controls Component: Update `frontend/src/components/Controls.tsx` to show a "Replay ↺" button when `isCompleted === true` and `response !== null`.
- Playback Hook: Call `reset()` from `frontend/src/hooks/usePlayback.ts` (already implemented), then immediately set `playing = true` via `setPlaying(true)`.
- Page Wiring: In `frontend/src/pages/SortingPage.tsx`, `SearchingPage.tsx`, and `PathfindingPage.tsx`, pass down an `onReplay` callback prop that invokes `reset()` then `setPlaying(true)`.

### Definition of Done
- A "Replay ↺" button appears once a race completes.
- Clicking it restarts the animation from frame 0 without any new API request.
- Replay works correctly across Sorting, Searching, and Pathfinding arenas.

### Skill Level
Good first issue — wiring existing `reset()` to a new button; no backend changes needed."""
    )


# --- ISSUE 7 ------------------------------------------------------------------
def issue_7():
    create_issue(
        title="feat(ux): Algorithm Info Tooltip on Hover in Selector Dropdown",
        labels="enhancement,good first issue,jule",
        body="""### Overview
When a user hovers over an algorithm name inside the SelectField dropdown, show a compact tooltip card with its time complexity (best/average/worst) and a one-line description. This turns the selector into an educational on-ramp.

### Implementation Details & File Reference
- SelectField Component: Update `frontend/src/components/SelectField.tsx` to accept an optional `metadata` prop map and render a floating tooltip panel on `onMouseEnter` of each option wrapper.
- Data Source: Read complexity strings from `frontend/src/data/fallbackCatalog.ts` (already has `complexities`) and `useCase` / `advantage` from `frontend/src/data/algorithmMetadata.ts`.
- Styling: Style as a floating `<div>` anchored near the hovered row using `position: absolute` and CSS variables from `frontend/src/styles.css`.

### Definition of Done
- Hovering any algorithm name in any arena's selector shows a tooltip with best/average/worst time, space complexity, and a one-line use-case description.
- Tooltip disappears when the cursor leaves the option.

### Skill Level
Good first issue — data already exists in the codebase; primarily UI composition."""
    )


# --- ISSUE 8 ------------------------------------------------------------------
def issue_8():
    create_issue(
        title="feat(history): Persist Race History to localStorage with Session Restore",
        labels="enhancement,jule",
        body="""### Overview
Race history (metrics, winner, dataset config) should persist across browser refreshes using `localStorage`, and be restored automatically when the app reloads. Currently all history is lost on page refresh.

### Implementation Details & File Reference
- History Storage Utility: Create `frontend/src/utils/historyStorage.ts` with `saveRaceResult(entry)`, `loadRaceHistory(): RaceHistoryEntry[]`, and `clearHistory()` using `localStorage`.
- Race History Entry Type: Define `RaceHistoryEntry` interface in `frontend/src/models/types.ts` with fields: `id`, `timestamp`, `arenaType`, `algorithms`, `winner`, `datasetSize`, `datasetType`, `metrics`.
- Page Wiring: After a race completes in `SortingPage.tsx`, `SearchingPage.tsx`, and `PathfindingPage.tsx`, call `saveRaceResult(entry)`.
- History Page: Update `frontend/src/pages/HistoryPage.tsx` to load from `loadRaceHistory()` on mount and display actual past results.
- Settings Page: Wire "Clear History" in `frontend/src/pages/SettingsPage.tsx` to call `clearHistory()` and reset local state.

### Definition of Done
- After running any race, refreshing the page still shows the result in the History page.
- History persists across all arena types (Sorting, Searching, Pathfinding).
- Settings → Clear History wipes localStorage and the History page becomes empty.

### Skill Level
Medium — localStorage wiring across multiple pages; type definition needed."""
    )


# --- ISSUE 9 ------------------------------------------------------------------
def issue_9():
    create_issue(
        title="feat(backend): Add Bidirectional BFS Pathfinding Algorithm",
        labels="enhancement,jule",
        body="""### Overview
Implement Bidirectional BFS in the pathfinding engine. It simultaneously explores from the source and target, meeting in the middle, typically halving the number of cells visited vs standard BFS — a compelling visual learner moment.

### Implementation Details & File Reference
- Algorithm Model: Create `backend/src/main/java/com/algorithmrace/visualizer/algorithms/pathfinding/BidirectionalBFSModel.java` implementing `PathfindingModel`.
  - Maintain two BFS frontiers: forward from `start`, backward from `end`.
  - Alternate one BFS expansion per step; record each visited cell as a `SimulationFrame` with a distinct `CellState` to visually differentiate the two frontiers.
  - When frontiers intersect, reconstruct the full path and emit final frames.
- Factory Registration: Add `"Bidirectional BFS"` in `PathfindingFactory.java`.
- Complexity Catalog: Entry with `O(b^(d/2))` time note in `ComplexityCatalog.java`.
- Frontend Metadata: Entry in `frontend/src/data/algorithmMetadata.ts` (complete: true, optimal: true, weighted: false).

### Definition of Done
- Bidirectional BFS runs in Pathfinding Arena and visually shows two expanding frontiers converging.
- Path reconstruction after the meeting point is correct and matches standard BFS path length.
- Metrics (cells visited, path length) and completion state are accurate.

### Skill Level
Medium — non-trivial path reconstruction at meeting point; requires careful frame ordering."""
    )


# --- ISSUE 10 -----------------------------------------------------------------
def issue_10():
    create_issue(
        title="test(frontend): Unit Test Suite for usePlayback Hook",
        labels="enhancement,good first issue,jule",
        body="""### Overview
Write a Vitest unit test suite for the `usePlayback` custom React hook. Currently the frontend has no tests for hook logic. This builds on the arrayParser.ts test suite and extends frontend coverage.

### Implementation Details & File Reference
- Test File: Create `frontend/src/hooks/usePlayback.test.ts`.
- Test Framework: Use `vitest` and `@testing-library/react` (`renderHook`) — both available through the existing Vite/Vitest setup.
- Test Cases:
  - Initial state: `playing = false`, `frameIndex = 0`.
  - `stepForward()` increments `frameIndex` by 1 and clamps at `maxFrames - 1`.
  - `stepBackward()` decrements `frameIndex` and clamps at `0`.
  - `seek(n)` jumps `frameIndex` to `n` correctly (clamped within `[0, maxFrames-1]`).
  - `reset()` sets `frameIndex = 0` and `playing = false`.
  - `setPlaying(true)` with `maxFrames <= 1` does not trigger the interval.

### Definition of Done
- All test cases pass with `npx vitest run`.
- No changes to production source code in `usePlayback.ts`.

### Skill Level
Good first issue — hook is self-contained and already exports all tested functions."""
    )


# --- ISSUE 11 -----------------------------------------------------------------
def issue_11():
    create_issue(
        title="fix(ux): Normalize Per-Lane Progress Bar to Show 100% When Lane Finishes",
        labels="bug,good first issue,jule",
        body="""### Overview
When algorithms finish at different frame counts (e.g., Quick Sort finishes at frame 40 but Bubble Sort at frame 120), the per-lane progress indicator always shows a unified `frameIndex / maxFrames`. This is misleading — a finished lane shows as 33% done rather than 100%.

### Implementation Details & File Reference
- LaneCard Component: Update `frontend/src/components/LaneCard.tsx` to compute per-lane completion ratio as:
  `Math.min(frameIndex, lane.frames.length - 1) / (lane.frames.length - 1)`
  instead of `frameIndex / maxFrames`.
- Controls Component: Keep the global progress bar in `frontend/src/components/Controls.tsx` referencing `maxFrames` for overall timeline position; only individual lane cards use their own total.

### Definition of Done
- A lane that has finished all its frames shows 100% on its individual progress bar regardless of whether other lanes are still running.
- Global frame counter still shows the unified `frameIndex / maxFrames` for overall playback position.

### Skill Level
Good first issue — small arithmetic fix; no backend changes needed."""
    )


# --- ISSUE 12 -----------------------------------------------------------------
def issue_12():
    create_issue(
        title="refactor(ui): Dark/Light Theme Token Refactor — CSS Custom Properties",
        labels="enhancement,jule",
        body="""### Overview
The current `styles.css` is 146 KB and contains a large number of hardcoded colour values scattered throughout. Refactor all colour references to use a consistent set of CSS custom properties (design tokens) defined in a single `:root` block, with a `[data-theme='light']` override block, so dark/light mode is a single attribute toggle.

### Implementation Details & File Reference
- Tokens: Define `--color-bg-primary`, `--color-bg-secondary`, `--color-surface`, `--color-border`, `--color-text-primary`, `--color-text-muted`, `--color-accent`, `--color-accent-dim` in `:root` inside `frontend/src/styles.css`.
- Light Theme Override: Add a `[data-theme='light']` block redefining those same tokens with light-mode values.
- Replace Hardcodes: Systematically replace all raw hex/rgb colour literals in `styles.css` with the token variable (e.g., `background: var(--color-bg-primary)`).
- App.tsx Toggle: Ensure the dark mode toggle in `frontend/src/App.tsx` applies `document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')` rather than toggling a class.

### Definition of Done
- Dark to Light toggle changes all themed colours via a single `data-theme` attribute swap with no visual regression in dark mode.
- All raw hex colour values for themed colours are replaced by CSS custom property references.
- Light mode renders correctly with the override token block.

### Skill Level
Medium — large CSS file; requires careful search-and-replace plus visual QA pass."""
    )


# =============================================================================
# RUNNER — list only the issues you want to push below
# =============================================================================
if __name__ == "__main__":
    selected = [
        issue_1,   # feat(sorting): Tim Sort
        issue_2,   # feat(sorting): Counting Sort
        issue_3,   # feat(pathfinding): Greedy Best-First Search
        issue_4,   # feat(searching): Ternary Search
        issue_5,   # feat(ux): Playback Timeline Scrubber
        issue_6,   # feat(ux): Race Replay Button
        issue_7,   # feat(ux): Algorithm Info Tooltip
        issue_8,   # feat(history): Persist Race History to localStorage
        issue_9,   # feat(backend): Bidirectional BFS
        issue_10,  # test(frontend): usePlayback Hook Tests
        issue_11,  # fix(ux): Per-Lane Progress Bar
        issue_12,  # refactor(ui): CSS Custom Properties
    ]

    print(f"Pushing {len(selected)} issue(s) to Sanan507/AlgorithmRaceVisualizer...\n")
    for idx, fn in enumerate(selected, 1):
        print(f"[{idx}/{len(selected)}]")
        fn()
        print()
    print("Done!")
