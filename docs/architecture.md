# Architecture — Diplomatic Scheduling Optimizer

## Overview

The application is a single-file browser dashboard (`index.html`) with no build step, no server dependency, and no external state. All logic runs client-side. The architecture has four logical layers:

```
┌─────────────────────────────────────┐
│           Data Layer                │
│  generateData() → rooms, personnel, │
│  meetings (seeded RNG, seed=42)     │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│         Algorithm Layer             │
│  runScheduler(data) → results,      │
│  schedule matrix, utilization       │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│         Rendering Layer             │
│  renderKPIs(), renderGantt(),       │
│  renderUtilizationChart(),          │
│  renderTable()                      │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│           UI / DOM Layer            │
│  Buttons, theme toggle, canvas,     │
│  localStorage (theme persistence)  │
└─────────────────────────────────────┘
```

---

## Data Model

### Personnel Object

```js
{
  id:        number,   // 0-indexed, 0–149
  name:      string,   // "Personnel N"
  dept:      string,   // one of DEPARTMENTS
  clearance: number,   // 1–5 (5 = highest)
}
```

### Room Object

```js
{
  id:        number,   // 0-indexed, 0–19
  name:      string,   // from ROOM_NAMES array
  capacity:  number,   // 6–30 people
  clearance: number,   // 1–5
}
```

### Meeting Request Object (input)

```js
{
  id:             number,   // 0-indexed, 0–179
  title:          string,   // e.g. "Briefing 12"
  dept:           string,   // one of DEPARTMENTS
  priority:       number,   // 1–5
  duration:       number,   // slots (1=30min, 2=60min, 3=90min, 4=120min)
  clearance:      number,   // 1–3
  attendees:      number[], // array of personnel IDs
  attendeeCount:  number,
  preferredStart: number,   // slot index (0–16)
}
```

### Scheduled Meeting Object (output)

Extends the Meeting Request with assignment data:

```js
{
  ...meetingRequest,
  roomId:        number | null,  // null if unscheduled
  roomName:      string,
  startSlot:     number | null,
  startTime:     string,  // e.g. "9:30"
  endTime:       string,  // e.g. "10:00"
  durationLabel: string,  // e.g. "30 min"
  status:        'scheduled' | 'queued',
}
```

### Schedule Matrix

A 2D array `schedule[R][T]` where each cell holds a meeting ID or `null`. Dimensions: 20 rooms × 20 time slots.

### Utilization Array

```js
[{ name: string, pct: number }]  // pct = usedSlots / TIME_SLOTS * 100
```

---

## Algorithm Flow

```
runOptimizer()
  └─ generateData()
       └─ mulberry32(42) → seeded RNG
       └─ generates: personnel[], rooms[], meetings[]
  └─ runScheduler(data)
       └─ init: schedule[20][20] = null, personnelBusy Map
       └─ sort meetings by priority DESC
       └─ for each meeting:
            └─ scan offset 0..19
            └─   scan room 0..19
            └─     check clearance, capacity, room slots, attendee slots
            └─     first match → assign → break
            └─   no match → status='queued'
       └─ compute utilization[]
       └─ return { results, schedule, utilization, scheduled, unscheduled, total }
  └─ renderKPIs(result, data)
  └─ renderGantt(result, data)
  └─ renderUtilizationChart(result)
  └─ renderTable(result)
```

---

## Visualization Layer

### KPI Cards

Five metric cards rendered dynamically into `#kpiRow`:
- Meetings Scheduled (count + percentage)
- Unscheduled / Queued (count)
- Average Room Utilization (%)
- Personnel Count
- Conflicts Resolved (= scheduled count, since each scheduled meeting resolved a constraint conflict)

### Gantt Chart

A CSS grid-based timeline rendered into `#ganttChart`. Each row is one room; each block is one scheduled meeting positioned with `left` and `width` as percentages of the total time span. Blocks are color-coded by department. No canvas or SVG — pure DOM.

### Utilization Bar Chart (Chart.js)

A Chart.js v4 horizontal bar chart rendered on `#utilizationChart`. Destroyed and recreated on each `runOptimizer()` call and on theme toggle (theme change alters CSS custom property values that Chart.js reads for axis tick colors).

### Meeting Table

A standard HTML `<table>` rendered into `#meetingTableBody`. Displays the top 40 meetings sorted by status (scheduled first) then priority. Uses CSS class-based coloring for priority and status cells.

---

## Theme System

Two CSS themes defined on `:root[data-theme]`: `dark` (default) and `light`. Toggle stored in `localStorage` under key `theme`. On theme change, the utilization chart is re-rendered to pick up updated CSS custom property values.

---

## File Structure (Reference Extraction)

```
scheduling-optimizer/
├── index.html              ← live demo (self-contained, do not modify)
├── src/
│   └── js/
│       ├── config.js       ← constants and configuration object
│       ├── algorithm.js    ← data generation + greedy scheduler
│       └── charts.js       ← Chart.js initialization
├── docs/
│   ├── methodology.md      ← algorithm documentation
│   ├── architecture.md     ← this file
│   ├── decision_log.md     ← design decisions
│   └── data_dictionary.md  ← data schema reference
├── reports/
│   ├── research_notes.md   ← scheduling algorithm literature
│   └── results.md          ← simulation results analysis
├── PROJECT_PLAN.md
├── FINAL_REVIEW.md
└── README.md
```
