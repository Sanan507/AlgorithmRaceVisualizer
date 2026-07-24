### Title
`docs: Add and maintain CONTRIBUTING.md for open-source onboarding`

### Labels
`good first issue`, `documentation`

---

### Overview
Provide clear contributor documentation and local environment setup instructions to help new open-source developers get started smoothly.

### Implementation Details & File Reference
- **File Location**: `CONTRIBUTING.md` in repository root.
- **Content Requirements**:
  - **Prerequisites**: Java 21+, Node.js 18+, Maven, npm.
  - **Backend Setup**: Instructions for `cd backend && mvn spring-boot:run`.
  - **Frontend Setup**: Instructions for `cd frontend && npm install && npm run dev`.
  - **Architecture Overview**: Map of backend step models (`backend/src/main/java/com/algorithmrace/visualizer/algorithms/`) and frontend components (`frontend/src/components/`, `frontend/src/data/`).
  - **Good First Issue Guidelines**: Steps for picking up an issue, creating feature branches, and opening pull requests.

### Definition of Done
- `CONTRIBUTING.md` is complete, accurate, and linked in `README.md`.
- Instructions verified by successfully spinning up local development servers following the guide.

### Skill Level
Good for any beginner or first-time open-source contributor.

---

### Command to Create Issue via gh CLI:
```bash
gh issue create --repo Sanan507/AlgorithmRaceVisualizer --title "docs: Add and maintain CONTRIBUTING.md for open-source onboarding" --body-file .github/ISSUES/issue_4_contributing.md --label "good first issue,documentation"
```
