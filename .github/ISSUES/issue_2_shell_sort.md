### Title
`feat(sorting): Add Shell Sort algorithm`

### Labels
`good first issue`, `enhancement`

---

### Overview
Add **Shell Sort** as a new selectable sorting algorithm in the Sorting Arena.

### Implementation Details & File Reference
- **Backend Model**: Create `ShellSortModel.java` in `backend/src/main/java/com/algorithmrace/visualizer/algorithms/sorting/`. Follow the pattern in `InsertionSortModel.java` or `CombSortModel.java`, starting with gap = $n/2$ and reducing the gap by half each iteration while performing insertion comparisons.
- **Factory Registration**: Register `"Shell Sort"` in `SortingAlgorithmFactory.java` (`create()` switch case and `allNames()` list).
- **Complexity Metadata**: Add `"Shell Sort"` complexity metadata ($O(n \log n)$ best, $O(n^{1.3})$ average, $O(n^2)$ worst, $O(1)$ space, theory explanation, and pseudocode) to `ComplexityCatalog.java`.
- **Frontend Catalog**: Add `"Shell Sort"` to `frontend/src/data/fallbackCatalog.ts` and `frontend/src/data/algorithmMetadata.ts`.

### Definition of Done
- `Shell Sort` is selectable in the Sorting Arena algorithm selector.
- Running `Shell Sort` visualizes gap insertion steps with proper comparison highlighting and accurate operation metrics.
- Backend unit tests pass cleanly.

### Skill Level
Good if comfortable with basic Java algorithms and loop structures.

---

### Command to Create Issue via gh CLI:
```bash
gh issue create --repo Sanan507/AlgorithmRaceVisualizer --title "feat(sorting): Add Shell Sort algorithm" --body-file .github/ISSUES/issue_2_shell_sort.md --label "good first issue,enhancement"
```
