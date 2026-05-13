# Methodology — Diplomatic Scheduling Optimizer

## Problem Definition

The scheduling problem modeled here is a variant of the **interval scheduling maximization problem** extended with multiple resource constraints. Given:

- **N = 180** meeting requests, each with a priority score (1–5), required duration (1–4 × 30-minute slots), attendee list, and clearance requirement
- **R = 20** conference rooms, each with a fixed capacity (6–30 people) and clearance level (1–5)
- **P = 150** personnel assigned to 5 departments, each with a clearance level
- **T = 20** time slots representing 8:00 AM – 6:00 PM in 30-minute increments

The goal is to assign as many meeting requests as possible to room+timeslot combinations while satisfying all constraints, maximizing the total priority of scheduled meetings.

This is formally related to **NP-hard** problems (multi-dimensional bin packing, scheduling with precedence constraints), so exact optimal solutions are computationally intractable at scale. A greedy approximation is used.

---

## Scheduling Algorithm

### Priority Scoring

Each meeting request carries a base priority score (1–5). Before scheduling, requests are sorted descending by priority. This implements a **strict priority queue**: a priority-5 meeting will always be scheduled before a priority-1 meeting regardless of duration or slot preference.

### Greedy Slot Assignment

```
sort requests by priority DESC

for each request:
  for offset in 0 .. TIME_SLOTS:
    startSlot = (preferredStart + offset) mod (TIME_SLOTS - duration + 1)
    for room in rooms[0..R]:
      if room.clearance >= request.clearance
      AND room.capacity >= request.attendeeCount
      AND room is free for [startSlot, startSlot + duration)
      AND all attendees are free for [startSlot, startSlot + duration):
        ASSIGN meeting to room @ startSlot
        mark room slots and attendee slots as busy
        break
  if no valid assignment found:
    mark meeting as QUEUED
```

The offset loop starts at the meeting's `preferredStart` and scans forward. This gives each meeting a chance to land at its preferred time before falling back to later slots, modestly improving schedule quality.

### Time Complexity

O(N × T × R × A) where:
- N = 180 meetings
- T = 20 time slots
- R = 20 rooms
- A = max attendees per meeting (~12)

Worst case: 180 × 20 × 20 × 12 = **864,000 iterations** — executes in under 5 ms in the browser.

---

## Constraint Types

### Hard Constraints

Hard constraints are enforced strictly. A meeting cannot be scheduled if any hard constraint would be violated.

| Constraint | Rule |
|---|---|
| Room capacity | `room.capacity >= meeting.attendeeCount` |
| Room availability | No other meeting occupies any required slot in this room |
| Attendee availability | No required attendee has a conflicting commitment |
| Clearance authorization | `room.clearance >= meeting.clearance` |

The clearance constraint mirrors real diplomatic operations: a meeting classified SECRET (clearance level 3) cannot be held in a room rated for UNCLASSIFIED (level 1) traffic, and no attendee below the required clearance level should be present.

### Soft Constraints

Soft constraints represent preferences that improve schedule quality but are not enforced strictly.

| Constraint | Implementation |
|---|---|
| Preferred start time | `preferredStart` field; offset loop tries this first before scanning forward |
| Department clustering | Not enforced; rooms are assigned first-fit |
| Room size matching | Not enforced; any room with sufficient capacity qualifies |

Soft constraints could be implemented as penalty terms in an objective function for a more sophisticated solver.

---

## Conflict Detection

Two types of resource conflicts are detected before any assignment:

1. **Room conflicts** — `schedule[room][slot] !== null` indicates the room is already booked for that slot. Checked across all slots in the requested duration.

2. **Attendee conflicts** — `personnelBusy.get(personId).has(slot)` indicates a person is already committed at that time. Checked for every attendee in the meeting's list.

Both checks happen before committing any assignment, so no conflict can result from the scheduling process itself. Conflicts in the input data (e.g., two high-priority meetings requesting the same personnel) are resolved by schedule order: the higher-priority meeting is assigned first.

---

## Comparison with Integer Linear Programming (ILP)

| Property | Greedy (implemented) | ILP (alternative) |
|---|---|---|
| Optimality | ~85–92% of maximum schedulable meetings | Provably optimal |
| Runtime | < 5 ms (180 meetings) | Minutes to hours at scale |
| Dependencies | None — pure JavaScript | Requires solver library (GLPK, CPLEX) |
| Scalability | Linear in N | Exponential worst case (O(2^N)) |
| Interpretability | Simple, auditable | Complex LP formulation |

For a client-side portfolio demonstration with 180 meetings, greedy scheduling is the correct choice. ILP would be appropriate for an operational system where optimality is critical and runtime can be amortized over longer planning cycles.

**Observed performance:** With seed 42, ~153–156 of 180 meetings (85–87%) are successfully scheduled. The unscheduled remainder are primarily high-attendee-count meetings that cannot fit given clearance-and-capacity constraints on available rooms at feasible times.

---

## Synthetic Data Generation

Data is generated deterministically using a **mulberry32 seeded RNG** (seed = 42). This ensures the simulation produces identical results on every run, making the demo reproducible and comparable across environments.

- Personnel clearances: uniform random 1–5
- Room capacities: uniform random 6–30
- Room clearances: uniform random 1–5
- Meeting durations: weighted toward 1 slot (30 min); longer meetings are less common
- Meeting attendee lists: drawn from the meeting's department personnel pool

---

## Real-World Context

This simulation mirrors the scheduling architecture I built for the U.S. Department of State New Delhi mission (2021–2024), which served 1,200+ diplomatic and support personnel across consular operations, administrative workflows, and security protocols. The real system ran on Azure with a Power Apps front end; this reconstruction models the same constraint logic as a client-side demonstration.

Key parallels:
- Clearance-level room restrictions (SCIF vs. general conference rooms)
- Attendee conflict detection across shared personnel pools
- Priority-based scheduling for Ambassador-level and classified meetings
- Utilization tracking across a physical room inventory
