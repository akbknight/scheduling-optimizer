# Facility & Resource Scheduling Algorithmic Benchmark & Multi-Instance Audit

**Prepared:** October 2026 (Updated with Strict Constraint Enforcement & Multi-Instance Verification)  
**Author:** Akshay Kumar  
**Target Codebase:** `scheduling-optimizer`  
**Evaluation Script:** `scripts/benchmark_scheduler.cjs`  
**Benchmark Scope:** Seed 42 Reference Instance & 5-Instance Suite (Seeds: 42, 100, 2026, 31415, 88888)  
**Structured Output:** `reports/benchmark_results.json`

---

## 1. Executive Summary & Structured Case Study

### Core Analytical Case Study (Question → Evidence → Result → Recommendation → Limitation)

- **Question:** How does a priority-aware greedy constraint satisfaction heuristic perform when attendee-level security clearance constraints are strictly enforced, and does its priority advantage hold across multi-instance evaluations?
- **Evidence:** Evaluated deterministic synthetic consular facility instances (180 meeting requests, 20 facility rooms, 150 personnel across a 40-hour work week) on both the reference Seed 42 instance and a 5-instance benchmark suite (Seeds: 42, 100, 2026, 31415, 88888). Tested standard unconstrained placement against strict attendee clearance enforcement, Arrival-Order Baseline (FCFS), and Shortest-Duration-First heuristics.
- **Result:**
  1. **Constraint Enforcement:** Under unconstrained scheduling, the algorithm placed 107 meetings on Seed 42 but generated **61 attendee clearance violations** (an unmodeled boundary in prior iterations). When strict attendee clearance enforcement is enabled, attendee violations drop to **EXACTLY 0** (0 on Seed 42, and an average of **0 across all 5 benchmark seeds**). Zero room-capacity, room-clearance, or schedule-overlap violations occurred across all tests.
  2. **Multi-Instance Performance:** Across the 5 benchmark seeds under strict constraint enforcement:
     - **Priority-Greedy (Strict):** Placed an average of **70.2 meetings** (39% fill rate) and served **220.4 priority points**.
     - **Arrival-Order Baseline (Strict):** Placed an average of **70 meetings** and served **208.4 priority points**.
     - Priority-Greedy achieved a **+5.8% average priority point advantage** over arrival order under strict security constraints.
  3. **Capacity Trade-off vs. Placement Delta:** In unconstrained mode, an average of **59.6 meeting requests per instance** (and 61 on Seed 42) directly contained attendees with clearance deficits. Enforcing strict attendee clearance reduced average scheduled placements from 112.8 to 70.2 (a net delta of **42.6 scheduled placements**, and 41 on Seed 42). This 42.6 placement difference is caused by downstream cascading heuristic room and timeslot contention dynamics (as queued requests shift slot competition for remaining meetings), and is distinct from the measured count of 59.6 clearance deficits.
- **Recommendation:** Deploy strict attendee clearance checks at intake. Prioritize meeting requests via weighted priority scoring to maximize high-classification diplomatic outcomes under facility and security constraints.
- **Limitation:** The benchmark is evaluated on synthetic consular scheduling distributions and does not reflect real-time last-minute cancellation volatility, variable attendee travel times, or ad-hoc VIP room overrides.

---

## 2. Reference Instance Benchmark Table (Seed 42)

Evaluated on Seed 42 (180 meeting requests, 20 rooms, 150 personnel):

| Scheduling Policy | Meetings Scheduled | Requests Queued | Fill Rate (%) | Priority Points | Attendee Violations | Room Violations | Overlap Violations | Runtime |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|
| Priority greedy (Unconstrained) | 107 | 73 | 59.4% | 357 | 61 | 0 | 0 | ~6.79 ms |
| **Priority greedy (Strict clearance)** | **66** | 114 | 36.7% | **201** | 0 | 0 | 0 | ~4.5 ms |
| Arrival order baseline (Strict) | 67 | 113 | 37.2% | 190 | 0 | 0 | 0 | ~4.21 ms |
| Shortest duration first (Strict) | 62 | 118 | 34.4% | 167 | 0 | 0 | 0 | ~2.43 ms |

---

## 3. Multi-Instance Benchmark Suite (5 Deterministic Seeds)

Evaluated across 5 deterministic pseudo-random seeds (42, 100, 2026, 31415, 88888):

| Scheduling Policy | Avg Scheduled | Avg Queued | Avg Fill Rate | Avg Priority Points | Avg Attendee Violations | Avg Room Violations | Avg Overlap Violations | Avg Runtime |
|:---|---:|---:|---:|---:|---:|---:|---:|---:|
| Priority greedy (Unconstrained) | 112.8 | 67.2 | 62.7% | 394 | 59.6 | 0 | 0 | ~4.26 ms |
| **Priority greedy (Strict clearance)** | **70.2** | 109.8 | 39% | **220.4** | 0 | 0 | 0 | ~1.72 ms |
| Arrival order baseline (Strict) | 70 | 110 | 38.9% | 208.4 | 0 | 0 | 0 | ~1.62 ms |
| Shortest duration first (Strict) | 68.6 | 111.4 | 38.1% | 199.8 | 0 | 0 | 0 | ~1.2 ms |

---

## 4. Constraint Audit & Security Verification

1. **Room Capacity:** Enforced. Exactly 0 room capacity violations across all seeds and policies.
2. **Room Clearance:** Enforced. Exactly 0 room clearance classification violations across all seeds and policies.
3. **Double-Booking:** Enforced. Exactly 0 overlapping room reservations or attendee double-bookings across all seeds and policies.
4. **Attendee Clearance (Resolved Intervention):**
   - **Unconstrained Baseline:** 61 violations (Seed 42), averaging 59.6 violations per instance.
   - **Strict Enforcement Mode:** **0 violations** (Seed 42), averaging **0.0 violations** across all 5 benchmark seeds.

---

## 5. Operational & Reproducibility Guide

To reproduce this benchmark directly:
```bash
node scripts/benchmark_scheduler.cjs
```
All tables and takeaway figures in this report are synchronized directly from `reports/benchmark_results.json`.
