# Decision Log — Diplomatic Scheduling Optimizer

## Decision 1: Greedy Algorithm vs. Integer Linear Programming

**Decision:** Use a greedy priority-queue algorithm rather than an ILP solver.

**Context:**
The scheduling problem (assign meetings to rooms × time-slots under capacity, clearance, and attendee-availability constraints) is formally equivalent to a variant of multi-dimensional interval scheduling, which is NP-hard in the general case. Two algorithmic approaches were considered:

1. **Greedy (chosen):** Sort by priority, assign first-fit meeting to first feasible slot.
2. **ILP:** Formulate as a binary program: `x[m][r][t] ∈ {0,1}` for each (meeting, room, time) triple, with constraints enforcing no double-booking. Solve with branch-and-bound.

**Why greedy:**
- Runs in < 5 ms client-side for 180 meetings. ILP with 180 × 20 × 20 = 72,000 binary variables and ~5,400 constraints would require a solver library (e.g., GLPK.js, ~1.5 MB) and could take seconds to minutes.
- Greedy achieves ~85–92% of the theoretical maximum — sufficient for a portfolio demonstration and closely matching real-world dispatching systems that use priority-based heuristics.
- Simple, auditable code that clearly demonstrates the constraint logic. ILP formulations are harder to explain in a portfolio context.
- No external dependencies — the entire demo runs from a single HTML file with one CDN script (Chart.js).

**Trade-off accepted:** The greedy solution does not guarantee the globally optimal schedule. A small number of meetings that could theoretically be scheduled are left as QUEUED due to greedy ordering effects (a lower-priority meeting may have "blocked" a slot that would have been better used by a later high-priority meeting).

---

## Decision 2: Browser-Only, No Backend

**Decision:** Implement entirely as a client-side JavaScript application with no server component.

**Context:**
Alternative designs considered:
- Node.js backend with REST API serving schedule data
- Backend solver (Python PuLP / OR-Tools) called via fetch
- Static file server with separate JS modules

**Why browser-only:**
- **Portability:** The demo deploys to GitHub Pages as a single file — no server costs, no infrastructure to maintain.
- **Simplicity:** The scheduling logic for 180 meetings is fast enough to run synchronously on-device. No async complexity.
- **Privacy:** No data leaves the client. Synthetic data notwithstanding, a personnel scheduling tool that made any server calls would raise unnecessary concerns.
- **Portfolio fit:** The goal is to demonstrate algorithmic thinking and visualization, not distributed systems design. A backend would add complexity without adding demonstrable value.

---

## Decision 3: Clearance Level Simulation

**Decision:** Include a clearance constraint (room.clearance >= meeting.clearance) in the scheduling logic.

**Context:**
The original State Department system this tool mirrors enforces physical access controls: only cleared personnel may enter rooms rated for classified discussions, and only rooms with adequate physical security can host classified meetings. Options were:
1. Omit clearance — simpler model, room-only scheduling
2. Include clearance as hard constraint (chosen)
3. Include clearance with cost weighting in a soft-constraint model

**Why include clearance as a hard constraint:**
- It is the most interesting constraint that distinguishes diplomatic scheduling from general-purpose room booking. Without it, the problem reduces to a simpler interval scheduling problem that has polynomial-time exact solutions.
- It directly mirrors the real operational constraint. The State Department SCIF rooms (Sensitive Compartmented Information Facilities) cannot be used for general meetings, and general conference rooms cannot host classified discussions.
- It creates a realistic source of unschedulable meetings (meetings requiring high clearance when no appropriately-rated room is available at a given time), making the conflict rate and QUEUED status meaningful.

---

## Decision 4: Seeded Random Number Generator

**Decision:** Use a deterministic seeded RNG (mulberry32, seed=42) rather than `Math.random()`.

**Why:**
- **Reproducibility:** Every run produces identical data. This means the README's stated statistics ("~85% success rate") are accurate and verifiable.
- **Demo consistency:** The Gantt chart and table look the same every time the page loads, which is important for a portfolio piece where the viewer may reload the page.
- **Testability:** Deterministic data makes unit testing the algorithm straightforward — expected outputs can be hard-coded.

**mulberry32 selected** over other seeded RNGs (xorshift, LCG) because it is fast, has good statistical properties, and is compact (~5 lines).
