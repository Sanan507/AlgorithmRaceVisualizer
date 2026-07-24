### Title
`feat(sorting): Add Cocktail Shaker Sort (Bidirectional Bubble Sort)`

### Labels
`good first issue`, `enhancement`

---

### Overview
Add **Cocktail Shaker Sort** (also known as bidirectional Bubble Sort) as a new selectable sorting algorithm in the Sorting Arena.

### Implementation Details & File Reference
- **Backend Model**: Create `CocktailSortModel.java` in `backend/src/main/java/com/algorithmrace/visualizer/algorithms/sorting/`. Follow the step-recording pattern in `BubbleSortModel.java`, but alternate passes: scan left-to-right pushing the largest value to the end, then right-to-left pushing the smallest value to the beginning.
- **Factory Registration**: Register `"Cocktail Sort"` in `SortingAlgorithmFactory.java` (`create()` switch case and `allNames()` list).
- **Complexity Metadata**: Add `"Cocktail Sort"` complexity metadata ($O(n)$ best, $O(n^2)$ average/worst, $O(1)$ space, theory explanation, and pseudocode) to `ComplexityCatalog.java`.
- **Frontend Catalog**: Register `"Cocktail Sort"` in `frontend/src/data/fallbackCatalog.ts` and `frontend/src/data/algorithmMetadata.ts`.

### Definition of Done
- `Cocktail Sort` appears in the Sorting Arena algorithm selector dropdown.
- Selecting and running `Cocktail Sort` side-by-side with Bubble Sort produces step-by-step frame array visualizations and accurate comparison/swap telemetry counters.
- `mvn test` in `backend/` passes.

### Skill Level
Good if comfortable with basic Java and array manipulation.

---

### Command to Create Issue via gh CLI:
```bash
gh issue create --repo Sanan507/AlgorithmRaceVisualizer --title "feat(sorting): Add Cocktail Shaker Sort (Bidirectional Bubble Sort)" --body-file .github/ISSUES/issue_1_cocktail_sort.md --label "good first issue,enhancement"
```
