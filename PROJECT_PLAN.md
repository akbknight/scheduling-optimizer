# Project Plan — Diplomatic Scheduling Optimizer

## Objective

Build a browser-based interactive dashboard demonstrating a priority-aware greedy scheduling algorithm applied to a realistic diplomatic operations scenario: assigning 180 meeting requests to 20 conference rooms and 150 personnel under hard constraints (capacity, clearance, attendee availability).

## Phases

### Phase 1: Core Algorithm (Complete)
- [x] Seeded RNG for reproducible synthetic data generation
- [x] Personnel, room, and meeting data model
- [x] Greedy priority scheduler with conflict detection
- [x] Room utilization calculation

### Phase 2: Visualization (Complete)
- [x] Gantt chart (CSS/DOM, no canvas dependency)
- [x] Room utilization bar chart (Chart.js v4)
- [x] KPI summary cards
- [x] Meeting table (top 40, sortable by status + priority)

### Phase 3: UI Polish (Complete)
- [x] Dark/light theme toggle with localStorage persistence
- [x] Responsive layout (mobile-friendly)
- [x] Department color coding
- [x] Hover tooltips on Gantt blocks

### Phase 4: Documentation (Complete)
- [x] README.md — overview, algorithm, tech stack
- [x] docs/methodology.md — algorithm documentation
- [x] docs/architecture.md — system design
- [x] docs/decision_log.md — key design decisions
- [x] docs/data_dictionary.md — data schema reference
- [x] reports/research_notes.md — scheduling literature review
- [x] reports/results.md — simulation results analysis
- [x] src/js/ — reference implementations of modular components

### Phase 5: Deployment (Complete)
- [x] GitHub Pages deployment (index.html at repo root)
- [x] Live demo: https://akbknight.github.io/scheduling-optimizer/

## Out of Scope

- Backend / server-side scheduling
- Real personnel or room data
- ILP optimal solver
- Multi-day scheduling windows
- Calendar integration
