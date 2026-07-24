# Contributing to AlgoRace

Thank you for your interest in contributing to **AlgoRace**! We welcome contributions from developers of all skill levels. Whether you are fixing a bug, adding a new algorithm, improving performance, or enhancing the documentation, your help is appreciated.

---

## 🚀 Quick Start & Development Setup

### 1. Prerequisites
- **Java**: JDK 21 or later
- **Node.js**: v18+ and npm v9+
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

### 4. Run the Frontend (React 18 + TypeScript + Vite)
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The React dev server will start on `http://localhost:5173`.

---

## 📁 Repository Structure Overview

```text
AlgorithmRaceVisualizer/
│
├── backend/                              # Spring Boot REST Engine (Java 21)
│   └── src/main/java/com/algorithmrace/visualizer/
│       ├── algorithms/
│       │   ├── sorting/                  # Sorting step generators (e.g., BubbleSortModel.java)
│       │   ├── searching/                # Searching step generators (e.g., BinarySearchModel.java)
│       │   └── pathfinding/              # Graph pathfinding models (e.g., DijkstraModel.java)
│       ├── controller/                   # REST Controllers (/api/simulations/*, /api/catalog)
│       ├── dto/                          # Simulation request/response DTOs
│       ├── model/                        # Base AlgorithmModel & SearchModel classes
│       ├── service/                      # SimulationService engine
│       └── utils/                        # Array & Maze generators, ComplexityCatalog.java
│
├── frontend/                             # React 18 + TypeScript + Vite Client
│   └── src/
│       ├── components/                   # Canvas visualizers, Lane Cards, Controls
│       ├── data/                         # fallbackCatalog.ts & algorithmMetadata.ts
│       ├── hooks/                        # usePlayback.ts (animation ticker), useSound.ts
│       ├── models/                       # TypeScript interfaces & API types
│       ├── pages/                        # Sorting, Searching, Pathfinding, History, Settings
│       └── services/                     # HTTP API Client
│
└── CONTRIBUTING.md
```

---

## 🏷️ How to Pick Up a "Good First Issue"

1. **Browse Issues**: Look for issues labeled [`good first issue`](https://github.com/Sanan507/AlgorithmRaceVisualizer/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22). These are small, well-scoped tasks designed for new contributors.
2. **Assign Yourself / Comment**: Leave a comment on the issue stating that you would like to work on it so others know it is being addressed.
3. **Follow Implementation Patterns**:
   - For **new sorting/searching algorithms**: Check existing step models like `BubbleSortModel.java` or `BinarySearchModel.java` for the step-by-step frame recording pattern.
   - For **frontend UI features**: Check `fallbackCatalog.ts` and `algorithmMetadata.ts` to ensure metadata and theoretical complexities match.
4. **Test Your Changes**:
   - Backend tests: Run `mvn test` in the `backend/` directory.
   - Frontend verification: Ensure `npm run dev` builds cleanly without TypeScript or ESLint errors.

---

## 🔀 Submitting a Pull Request (PR)

1. Create a feature branch: `git checkout -b feature/my-new-algorithm`
2. Commit your changes with clear messages: `git commit -m "feat(sorting): add Cocktail Shaker Sort implementation"`
3. Push to your fork: `git push origin feature/my-new-algorithm`
4. Open a Pull Request on GitHub against the `main` branch with a summary of changes and testing steps.

Happy Coding! 🚀
