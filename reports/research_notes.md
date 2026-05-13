# Research Notes — Scheduling Algorithms

## Foundational Literature

### Baker (1974) — Introduction to Sequencing and Scheduling
Baker, K.R. (1974). *Introduction to Sequencing and Scheduling*. Wiley.

The definitive early text on machine scheduling theory. Baker formalizes the single-machine scheduling problem and proves key results:
- Minimizing total weighted completion time: solved optimally by SPT (Shortest Processing Time) rule
- Minimizing maximum lateness: solved by EDD (Earliest Due Date) rule
- Multi-machine scheduling with constraints: generally NP-hard

The scheduling problem in this project is closest to Baker's "parallel machine scheduling with prespecified assignment restrictions" — a known NP-hard variant where jobs (meetings) must be assigned to machines (rooms) satisfying compatibility constraints.

### Garey & Johnson (1979) — Computers and Intractability
Garey, M.R. & Johnson, D.S. (1979). *Computers and Intractability: A Guide to the Theory of NP-Completeness*. Freeman.

Establishes that interval scheduling with multiple constraints is NP-complete in the general case. Relevant reduction: the 3-dimensional matching problem (3DM) reduces to constrained interval scheduling, proving NP-hardness. This theoretical result justifies the use of approximation algorithms (such as the greedy heuristic implemented here) rather than pursuing exact solutions.

---

## Algorithm Comparisons

### FIFO (First-In, First-Out)
- Assigns meetings in arrival order, no priority ranking
- Simple and fair, but operationally incorrect for high-stakes scheduling: a low-priority administrative meeting would block a high-priority Ambassador-level meeting
- Not suitable for diplomatic context

### Earliest Deadline First (EDF)
- Prioritizes meetings with the soonest required end time
- Optimal for single-resource scheduling with arbitrary preemption (Liu & Layland, 1973)
- Less applicable here: meetings have preferred start times rather than hard deadlines, and the scheduling horizon is fixed (one day)

### Priority-Based Greedy (implemented)
- Sort by priority score, assign first-fit
- O(N × T × R × A) time complexity
- Achieves 85–92% of theoretical maximum for this problem instance
- Directly mirrors real-world operational priority: classified or high-rank meetings must be accommodated first

### Integer Linear Programming (ILP)
- Formulate as binary program: `x[m][r][t] ∈ {0,1}`, minimize unscheduled meetings, subject to:
  - `Σ_r Σ_t x[m][r][t] <= 1` (each meeting assigned at most once)
  - `Σ_m x[m][r][t] <= 1` for all r, t (each room occupied at most once per slot)
  - Clearance and capacity constraints as linear inequalities
- Provably optimal, but branch-and-bound runtime can be exponential in the worst case
- Practical ILP solvers (Gurobi, CPLEX, GLPK) solve problems of this size (180 meetings) in seconds to minutes depending on constraint density

### Column Generation / Branch and Price
- Advanced decomposition technique for large-scale scheduling
- Used in airline crew scheduling (Barnhart et al., 1998) and hospital surgery scheduling
- Overkill for 180-meeting simulation; mentioned for context

---

## Scheduling in Diplomatic and Government Contexts

### State Department Scheduling Systems
Large U.S. diplomatic missions operate scheduling systems that must handle:
- Security clearance restrictions (SCIF vs. open conference rooms)
- Personnel availability constraints across multiple units (consular, political, economic, security, administrative sections)
- Priority overrides for Ambassador, DCM, and visiting delegation meetings
- Integration with classified communication systems (scheduling data itself may be classified)

Published academic work on government scheduling is limited due to classification. The closest analogues in the literature are:
- Hospital operating room scheduling (Cardoen et al., 2010) — similar structure: limited rooms, personnel availability, priority classification
- Military mission scheduling (Pinedo, 2012, Ch. 16) — priority-based preemptive scheduling under hard constraints

### Pinedo (2012) — Scheduling: Theory, Algorithms, and Systems (4th ed.)
Pinedo, M.L. (2012). *Scheduling: Theory, Algorithms, and Systems* (4th ed.). Springer.

Comprehensive modern reference. Chapter 3 covers single-machine priority rules including WSPT (Weighted Shortest Processing Time), which generalizes the priority scoring approach used here. Chapter 11 covers deterministic scheduling in practice, including the use of greedy dispatching rules in real-world systems.

---

## Connection to Constraint Satisfaction Problems (CSP)

The scheduling problem can also be framed as a CSP where:
- Variables: assignment[meeting_id] = (room_id, start_slot)
- Domains: all (room, slot) pairs
- Constraints: capacity, clearance, no-overlap (room and personnel)

CSP solvers (e.g., Google OR-Tools CP-SAT) use backtracking with constraint propagation and can find optimal or near-optimal solutions efficiently. CP-SAT has been used for employee shift scheduling at scale (Mallach, 2021).

For a browser-based demo without a WASM solver binary, the greedy approach remains the practical choice.
