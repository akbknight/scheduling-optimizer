# Diplomatic Resource & Scheduling Optimizer

> [!IMPORTANT]
> **Enterprise Operations Research Engine · Part of the Akshay Kumar Technical Portfolio Ecosystem**  
> 🌐 **Executive Portfolio:** [https://akbknight.github.io/](https://akbknight.github.io/) · 💼 **LinkedIn:** [linkedin.com/in/akshaykumardl](https://www.linkedin.com/in/akshaykumardl/) · 📄 **Curriculum Vitae:** [Download PDF (369 KB)](https://akbknight.github.io/assets/Akshay_Resume.pdf)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0284c7?style=flat-square&logo=github)](https://akbknight.github.io/scheduling-optimizer/)
[![Algorithm](https://img.shields.io/badge/Algorithm-Constrained%20Greedy%20(NP--Hard)-10b981?style=flat-square)](https://akbknight.github.io/scheduling-optimizer/)
[![Execution Speed](https://img.shields.io/badge/Execution%20Latency-%3C5ms%20Client--Side-blue?style=flat-square)](https://akbknight.github.io/scheduling-optimizer/)
[![Enterprise Origin](https://img.shields.io/badge/Origin-U.S.%20Dept%20of%20State%20Architecture-8b5cf6?style=flat-square)](https://akbknight.github.io/scheduling-optimizer/)
[![Author](https://img.shields.io/badge/Author-Akshay%20Kumar-09090b?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/akshaykumardl/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

A priority-aware, multi-constraint resource scheduling engine for high-stakes operational environments. Resolves **180 concurrent meeting requests** across **20 secure conference facilities** and **150 cleared personnel** spanning 5 diplomatic departments using a greedy constraint-satisfaction heuristic with deterministic real-time conflict detection. Runs 100% client-side with zero latency.

👉 **Launch Live Demo:** **[https://akbknight.github.io/scheduling-optimizer/](https://akbknight.github.io/scheduling-optimizer/)**

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

## 👤 Author & Strategic Portfolio

**Akshay Kumar**  
STEM MBA Candidate · Business Analytics & AI · American University Kogod School of Business  
Former Computer Programmer · U.S. Department of State  
- **Executive Portfolio:** [https://akbknight.github.io/](https://akbknight.github.io/)  
- **LinkedIn Profile:** [linkedin.com/in/akshaykumardl](https://www.linkedin.com/in/akshaykumardl/)  
- **Direct Résumé:** [Download PDF (369 KB)](https://akbknight.github.io/assets/Akshay_Resume.pdf)  
- **Email:** [ak8335a@american.edu](mailto:ak8335a@american.edu)


---

## 🔬 Algorithmic Benchmark & Baseline Comparison (5-Element Case Study)

- **Question:** How does a priority-aware greedy constraint satisfaction heuristic compare to naive first-come, first-served (arrival-order) heuristic placement under shared space constraints?
- **Evidence:** Evaluated on a deterministic synthetic benchmark instance (seed 42, 180 meeting requests, 20 facility rooms, 150 personnel across a 40-hour work week). Compared Priority-Greedy against Arrival-Order Baseline (FCFS) and Shortest-Duration-First heuristics.
- **Result:** Priority-Greedy scheduled **107 of 180 meetings** (73 queued) versus **103 meetings** (77 queued) under arrival order (+3.9% meetings placed), serving **357 priority points versus 287** (+24.4% priority points served). Zero room-capacity, room-clearance, or double-booking schedule overlaps were detected. The heuristic executes in ~7–12 ms client-side.
- **Recommendation:** Deploy priority-aware constraint satisfaction heuristics when request volume exceeds facility capacity to prioritize mission-critical requests into constrained resources, rather than allocating on an unweighted first-come first-served basis.
- **Limitation:** The benchmark is explicitly a synthetic, single-instance simulation and does not establish measured real-world dollar savings, operational labor reduction, or enterprise user adoption. While facility room clearance constraints are strictly verified (0 room violations), attendee-level clearance checking remains an unresolved rule (61 of 107 scheduled meetings include an attendee below meeting clearance threshold).

| Scheduling Policy | Meetings Scheduled | Requests Queued | Fill Rate (%) | Priority Points Served | Relative Gain | Runtime |
|:---|---:|---:|---:|---:|---:|---:|
| **Priority Greedy (Heuristic)** | **107** | 73 | **59.4%** | **357** | **+24.4%** | **~7–12 ms** |
| **Shortest Duration First** | 107 | 73 | 59.4% | 295 | +2.8% | ~5–9 ms |
| **Arrival Order Baseline (FCFS)** | 103 | 77 | 57.2% | 287 | Baseline | ~7–12 ms |

### Key Findings & Constraint Boundary:
1. **Measurable Prioritization Value:** Priority-Greedy serves **24.4% more priority points** than FIFO arrival order by prioritizing high-stakes meetings into constrained premium spaces.
2. **Hard Constraints Enforced:** Zero room-capacity, room-clearance, or schedule overlap violations.
3. **Personnel Rule Boundary:** 61 scheduled meetings contained an attendee below meeting clearance, demonstrating that facility room clearance is enforced while attendee-level clearance rule enforcement remains a future constraint refinement.
4. **Reproducibility:** Run `node scripts/benchmark_scheduler.cjs` or review [`reports/benchmark_audit.md`](reports/benchmark_audit.md).
