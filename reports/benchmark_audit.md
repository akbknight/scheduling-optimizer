# Facility & Resource Scheduling Algorithmic Benchmark

**Prepared:** October 2026  
**Author:** Akshay Kumar  
**Target Codebase:** `scheduling-optimizer`  
**Evaluation Script:** `scripts/benchmark_scheduler.cjs`  
**Benchmark Instance:** Synthetic benchmark seed 42 (180 meeting requests, 20 facility rooms, 150 personnel)

---

## 1. Executive Summary & Evaluation Context

Does a priority-weighted greedy constraint satisfaction heuristic deliver measurable operational improvement over naive first-come, first-served (arrival-order) room scheduling?

To evaluate this, we benchmarked the scheduler on a standard 180-meeting workload against arrival-order and shortest-duration-first heuristics.

### Key Benchmark Findings
1. **Priority Points Maximized:** The **Priority-Greedy heuristic** served **357 priority points**, outperforming the Arrival-Order baseline (**287 priority points**) by **+24.4%**.
2. **Capacity Placement:** Priority-Greedy scheduled **107 meetings** (73 queued), compared to **103 meetings** (77 queued) under arrival order.
3. **Execution Efficiency:** The heuristic resolves all 180 constraint sets in **~7.3 ms** in JavaScript, well within sub-second interactive simulation thresholds.
4. **Hard Constraint Audit:** Zero room-capacity violations, zero room-clearance violations, and zero room/attendee schedule overlaps were detected across all 107 scheduled meetings.
5. **Constraint Boundary Identified:** In the current reference implementation, 61 of the 107 scheduled meetings included at least one attendee whose personal security clearance was below the meeting threshold. The scheduler enforces facility room clearance, but requires an additional attendee-level clearance rule before making blanket compliance claims.

---

## 2. Policy Comparative Benchmark Table

| Scheduling Policy | Meetings Scheduled | Requests Queued | Fill Rate (%) | Priority Points Served | Relative Point Gain | Runtime (ms) |
|:---|---:|---:|---:|---:|---:|---:|
| **Priority Greedy (Heuristic)** | **107** | 73 | **59.4%** | **357** | **+24.4%** | **7.33 ms** |
| **Shortest Duration First** | 107 | 73 | 59.4% | 295 | +2.8% | 4.84 ms |
| **Arrival Order Baseline (FCFS)**| 103 | 77 | 57.2% | 287 | Baseline | 6.92 ms |

---

## 3. Operational & Reproducibility Guide

To reproduce this benchmark directly:
```bash
node scripts/benchmark_scheduler.cjs
```
