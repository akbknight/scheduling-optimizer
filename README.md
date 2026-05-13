# Diplomatic Scheduling Optimizer

Priority-aware resource scheduling system for high-stakes operational environments. Assigns **180 meeting requests** to **20 conference rooms** and **150 personnel** across 5 departments using a constrained greedy algorithm with real-time conflict detection. Runs entirely in the browser — no backend, no build step.

**Live demo:** [akbknight.github.io/scheduling-optimizer](https://akbknight.github.io/scheduling-optimizer/)

---

## What It Solves

Resource scheduling under hard constraints is one of the hardest operational planning problems — especially in high-stakes environments where double-booking a room or scheduling conflicting personnel can have real consequences. This tool demonstrates:

- **Priority queuing:** High-priority meetings are scheduled first and get first pick of available rooms and time slots
- **Multi-constraint satisfaction:** Room capacity, security clearance levels, and attendee availability must all be satisfied simultaneously
- **Conflict detection:** Before any assignment, three constraint checks run — room availability, personnel schedules, and clearance authorization
- **Utilization optimization:** The algorithm tries preferred start times first, then scans forward, maximizing slot coverage without violating constraints

---

## Algorithm

```
1. Score all meetings by priority (1–5)
2. Sort descending — highest priority scheduled first
3. For each meeting:
   a. Starting at preferredStart, scan forward through available slots
   b. For each slot, scan rooms in order:
      - Skip: room.clearance < meeting.clearance
      - Skip: room.capacity < meeting.attendeeCount
      - Skip: room is occupied for any required slot
      - Skip: any required attendee is busy for any required slot
      - First room passing all checks → assign
   c. Mark room slots and attendee slots as busy
   d. If no valid (room, slot) found → mark QUEUED
```

**Time complexity:** O(N × T × R × A)
where N = 180 meetings, T = 20 time slots, R = 20 rooms, A = max ~12 attendees.
Worst case ~864,000 iterations — executes in under 5 ms client-side.

**Typical result:** ~153–156 of 180 meetings (85–87%) successfully scheduled.

---

## Constraint Types

| Type | Constraints |
|---|---|
| **Hard (enforced strictly)** | Room capacity ≥ attendee count; room clearance ≥ required classification; no double-booked room slots; no double-booked attendee slots |
| **Soft (preference only)** | Preferred start time (tried first, scheduler scans forward if unavailable); department clustering (not enforced) |

---

## Scenario

All data is synthetic — generated deterministically via seeded RNG (mulberry32, seed=42):

- **20 conference rooms** named after U.S. presidents (capacity 6–30, clearance levels 1–5)
- **150 personnel** across 5 departments: State, Consular, Admin, Security, Protocol
- **180 meeting requests** with priority scores (1–5), duration (30 min–2 hrs), attendee lists, and clearance requirements
- **Scheduling window:** 8:00 AM – 6:00 PM (20 × 30-minute slots)

---

## Connection to Real-World Diplomatic Operations

This system mirrors the scheduling architecture I built for the U.S. Department of State New Delhi mission (2021–2024), serving 1,200+ diplomatic and support personnel across consular operations, administrative workflows, and security protocols. The real system ran on Azure with a Power Apps front end; this reconstruction models the same constraint logic as a client-side simulation.

Key parallels:
- SCIF-equivalent clearance restrictions on conference rooms
- Attendee conflict detection across shared personnel pools
- Priority-based scheduling for Ambassador-level and classified meetings
- Room utilization tracking across physical inventory

---

## Tech Stack

| Component | Technology |
|---|---|
| Language | Vanilla JavaScript (ES2020+, no framework) |
| Visualization | Chart.js 4.4 (utilization bar chart) |
| Gantt chart | Pure CSS/DOM (no canvas) |
| Data generation | mulberry32 seeded RNG (deterministic, reproducible) |
| Styling | CSS custom properties, dark/light themes |
| Deployment | GitHub Pages (static, single file) |

---

## Quick Start

No installation required.

```bash
git clone https://github.com/akbknight/scheduling-optimizer.git
cd scheduling-optimizer
open index.html   # macOS
# or double-click index.html on Windows
```

Or visit the live demo: [akbknight.github.io/scheduling-optimizer](https://akbknight.github.io/scheduling-optimizer/)

---

## Project Structure

```
scheduling-optimizer/
├── index.html              ← complete demo (self-contained)
├── src/
│   └── js/
│       ├── config.js       ← extracted constants and configuration
│       ├── algorithm.js    ← greedy scheduler (reference module)
│       └── charts.js       ← Chart.js initialization (reference module)
├── docs/
│   ├── methodology.md      ← algorithm documentation, complexity analysis
│   ├── architecture.md     ← system design, data model, rendering layer
│   ├── decision_log.md     ← key design decisions (greedy vs ILP, etc.)
│   └── data_dictionary.md  ← full schema for rooms, personnel, meetings
├── reports/
│   ├── research_notes.md   ← scheduling algorithm literature review
│   └── results.md          ← simulation results, conflict analysis
├── PROJECT_PLAN.md
├── FINAL_REVIEW.md
└── .gitignore
```

---

## Skills Demonstrated

- **Operations research:** Greedy constrained scheduling, priority queue, NP-hard problem approximation
- **Algorithm design:** Multi-constraint satisfaction with deterministic conflict detection
- **Data visualization:** Gantt chart (CSS/DOM), utilization metrics (Chart.js), summary tables
- **Systems thinking:** Translating a real enterprise scheduling problem into a clean algorithmic model

---

## Author

**Akshay Kumar**
[akbknight.github.io](https://akbknight.github.io) · [linkedin.com/in/akshaykumardl](https://www.linkedin.com/in/akshaykumardl/)
