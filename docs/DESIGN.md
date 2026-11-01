# Visual Design System: AlgoRace

## 🎨 Theme & Atmosphere
- **Style**: Modern Dark & Light Technical Dashboard
- **Vibe**: Precision engineering, deep slate environment, refined indigo/emerald indicators, and subtle glassmorphic container cards.
- **Accessibility**: First-class support for **Deuteranopia** and **Protanopia** color-blind accessible palettes.

---

## 🟢 Color Tokens

```css
:root {
  /* Backgrounds */
  --bg-app: #090d16;
  --bg-card: rgba(15, 23, 42, 0.75);
  --bg-card-hover: rgba(30, 41, 59, 0.85);
  --bg-panel: rgba(11, 11, 30, 0.85);

  /* Accents */
  --color-primary: #6366f1;   /* Refined Indigo */
  --color-success: #10b981;   /* Emerald Green */
  --color-accent: #38bdf8;    /* Sky Blue */
  --color-warning: #f59e0b;   /* Amber */
  --color-danger: #ef4444;    /* Rose Red */
  --color-purple: #a855f7;    /* Royal Purple */

  /* Text & Borders */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-glow: rgba(99, 102, 241, 0.25);

  /* Effects */
  --radius-lg: 14px;
  --radius-md: 8px;
  --radius-sm: 6px;
  --shadow-panel: 0 4px 20px 0 rgba(0, 0, 0, 0.35);
}
```

---

## ✒️ Typography
- **Primary Interface**: Inter / Plus Jakarta Sans / Outfit (Clean, legible modern sans-serif).
- **Data & Telemetry**: JetBrains Mono / Space Grotesk (Tabular numerals for operations count, speed, and timing metrics).

---

## 🧩 Component Standards

### 1. Race Track & Lane Cards
- Glassmorphic container (`border-subtle`), rounded corners (`12px`), responsive elevation.
- **Algorithm State Indicators**:
  - **Unsorted / Default**: Slate (`#334155`)
  - **Active Comparison**: Sky Blue (`#38bdf8`)
  - **Swap / Memory Write**: Amber (`#f59e0b`)
  - **Pivot / Boundary**: Cyan (`#06b6d4`)
  - **Sorted / Completed**: Emerald (`#10b981`)

### 2. Dynamic Programming (DP) Matrix Design
- **Cell States**:
  - `Base Case (0)`: Slate border, muted gray text (`#64748b`).
  - `Active Subproblem Cell`: Amber highlight glow (`#f59e0b`) with formula indicator.
  - `Contributing Dependent Cells`: Cyan border (`#06b6d4`) with animated curved connection arrows.
  - `Backtrack Optimal Solution Path`: Emerald fill (`rgba(16, 185, 129, 0.25)`) with bright green boundary (`#10b981`).

### 3. Tree Data Structures Visual Design
- **Node Styling**:
  - Standard BST Node: Indigo outline with slate fill.
  - AVL Unbalanced Node: Crimson warning pulse (`#ef4444`) with balance factor tag (`BF: +2 / -2`).
  - Rotation Pivot: Bright Amber glow indicating rotation axis.
  - Red-Black Tree Nodes: High-contrast Scarlet (`#dc2626`) and Obsidian Slate (`#0f172a`).
  - Traversal Frontier: Animated glowing ping effect tracking current visit point.

### 4. Playback & Scrubber Dock
- Compact, harmonized 38px touch targets on mobile and desktop.
- Timeline scrubbing with instant seek responsiveness and audio chime feedback.
