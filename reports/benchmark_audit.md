# Facility & Resource Scheduling Algorithmic Benchmark

**Prepared:** October 2026  
**Author:** Akshay Kumar  
**Target Codebase:** `scheduling-optimizer`  
**Evaluation Script:** `scripts/benchmark_scheduler.cjs`  
**Benchmark Instance:** Synthetic benchmark seed 42 (180 meeting requests, 20 facility rooms, 150 personnel)  
**Structured Output:** `reports/benchmark_results.json`

---

## 1. Executive Summary & Structured Case Study

### Core Analytical Case Study (Question → Evidence → Result → Recommendation → Limitation)

- **Question:** How does a priority-aware greedy constraint satisfaction heuristic compare to naive first-come, first-served (arrival-order) heuristic placement under shared space constraints?
- **Evidence:** Evaluated on a deterministic synthetic benchmark instance (seed 42, 180 meeting requests, 20 facility rooms, 150 personnel across a 40-hour work week). Compared Priority-Greedy against Arrival-Order Baseline (FCFS) and Shortest-Duration-First heuristics.
- **Result:** Priority-Greedy scheduled **107 of 180 meetings** (73 queued) versus **103 meetings** (77 queued) under arrival order (+3.9% meetings placed), serving **357 priority points versus 287** (+24.4% priority points served). Zero room-capacity, room-clearance, or double-booking schedule overlaps were detected. The heuristic executes in ~7–12 ms client-side.
- **Recommendation:** Deploy priority-aware constraint satisfaction heuristics when request volume exceeds facility capacity to prioritize mission-critical requests into constrained resources, rather than allocating on an unweighted first-come first-served basis.
- **Limitation:** The benchmark is explicitly a synthetic, single-instance simulation and does not establish measured real-world dollar savings, operational labor reduction, or enterprise user adoption. While facility room clearance constraints are strictly verified (0 room violations), attendee-level clearance checking remains an unresolved rule (61 of 107 scheduled meetings include an attendee below meeting clearance threshold).

---

## 2. Policy Comparative Benchmark Table

| Scheduling Policy | Meetings Scheduled | Requests Queued | Fill Rate (%) | Priority Points Served | Relative Point Gain | Runtime (ms) |
|:---|---:|---:|---:|---:|---:|---:|
| **Priority greedy** | **107** | 73 | **59.4%** | **357** | **+24.4%** | ~7.41 ms |
| Arrival order baseline | 103 | 77 | 57.2% | 287 | Baseline | ~2.28 ms |
| Shortest duration first | 107 | 73 | 59.4% | 295 | +2.8% | ~2.96 ms |

---

## 3. Constraint Verification & Security Boundary

1. **Room Capacity:** Enforced. Zero instances of room capacity < attendee count.
2. **Room Clearance:** Enforced. Zero instances of room classification < meeting classification requirement (0 violations).
3. **Double-Booking:** Enforced. Zero overlapping meetings in the same room or for the same attendee (0 violations).
4. **Attendee Clearance (Unresolved Boundary):** In the reference implementation, 61 of 107 scheduled meetings include at least one attendee whose personal clearance level is below the meeting classification requirement. The scheduler verifies facility room clearance, but requires a separate attendee-clearance rule prior to compliance certification.

---

## 4. Operational & Reproducibility Guide

To reproduce this benchmark directly:
```bash
node scripts/benchmark_scheduler.cjs
```
All tables and takeaway figures in this report are synchronized directly from `reports/benchmark_results.json`.
