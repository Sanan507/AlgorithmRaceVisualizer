### Title
`feat(frontend): Add 'Share This Run' URL parameter state encoding`

### Labels
`good first issue`, `enhancement`

---

### Overview
Allow users to share a specific race setup (arena type, selected algorithms, dataset size, dataset mode) via URL query parameters so a run configuration can be opened via direct link.

### Implementation Details & File Reference
- **URL Parameter Spec**:
  - `?page=sorting&algos=Quick%20Sort,Merge%20Sort&size=30&mode=Random`
  - `?page=pathfinding&algos=A*%20Search,Dijkstra&maze=Recursive%20Division`
- **Frontend State Sync**:
  - In `frontend/src/App.tsx` or arena pages (`SortingPage.tsx`, `SearchingPage.tsx`, `PathfindingPage.tsx`), read `window.location.search` on initial load using `URLSearchParams`.
  - When controls change or when user clicks a new "Share Run" button, update URL query parameters using `window.history.replaceState`.
- **Share UI**: Add a compact "Share Run" button next to arena controls that copies the formatted URL to the clipboard with a toast notification.

### Definition of Done
- Opening a shared URL (`?page=sorting&algos=Bubble%20Sort,Quick%20Sort&size=40`) loads the specified algorithms and dataset parameters automatically.
- Clicking "Share Run" copies the direct link to the clipboard.

### Skill Level
Good if comfortable with React 18, TypeScript, and standard Browser Web APIs (`URLSearchParams`, `navigator.clipboard`).

---

### Command to Create Issue via gh CLI:
```bash
gh issue create --repo Sanan507/AlgorithmRaceVisualizer --title "feat(frontend): Add 'Share This Run' URL parameter state encoding" --body-file .github/ISSUES/issue_3_share_run.md --label "good first issue,enhancement"
```
