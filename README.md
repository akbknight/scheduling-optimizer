# Diplomatic Scheduling Optimizer

Priority-aware resource scheduling system for high-stakes operational environments. Assigns 180 meeting requests to 20 conference rooms and 150 personnel across 5 departments using a constrained greedy algorithm with conflict detection. Runs entirely in the browser — no backend required.

Live demo: [akbknight.github.io/scheduling-optimizer](https://akbknight.github.io/scheduling-optimizer/)

## What it solves

Resource scheduling under hard constraints is one of the hardest operational planning problems — especially in high-stakes environments where double-booking a room or scheduling conflicting personnel can have real consequences. This tool demonstrates:

- **Priority queuing:** High-priority meetings are scheduled first and get first pick of available rooms
- **Multi-constraint satisfaction:** Room capacity, security clearance levels, and attendee availability must all be satisfied simultaneously
- **Conflict detection:** Before any assignment, all three constraints are checked — room availability, personnel busy schedules, and clearance authorization
- **Utilization optimization:** After the initial pass, a sweep fills remaining gaps with lower-priority meetings

## Scenario

Synthetic data — no real personnel or operational data is used:
- 20 conference rooms (6–30 capacity, clearance levels 1–5)
- 150 personnel across 5 departments: State, Consular, Admin, Security, Protocol
- 180 meeting requests with priority scores (1–5), duration (30 min – 2 hrs), attendee lists, and clearance requirements
- Scheduling window: 8:00 AM – 6:00 PM (20 × 30-minute slots)

## Algorithm

```
1. Score all meetings by: priority × clearance_weight × urgency
2. Sort by score descending (highest priority scheduled first)
3. For each meeting:
   a. Find earliest available room satisfying capacity + clearance
   b. Check all required attendees are free for the full duration
   c. If valid: assign room + mark attendees busy
   d. If no valid slot found: mark as queued for rescheduling
4. Secondary sweep: fill room gaps with queued lower-priority meetings
```

**Typical result:** ~85% of meetings successfully scheduled, average room utilization ~65%, all conflicts resolved before assignment.

## Why it matters

This system mirrors the architecture of scheduling infrastructure I built for the U.S. Department of State in New Delhi — serving 1,200+ diplomatic and support personnel across consular operations, administrative workflows, and security protocols. The real system ran as an Azure-backed web application with Power Apps UI; this demo reconstructs the constraint logic as a client-side simulation.

## Tech stack

- Vanilla JavaScript (no framework, no build step)
- Chart.js 4 (utilization bar chart)
- Seeded RNG (mulberry32) — reproducible synthetic data
- Gantt visualization in pure CSS/DOM

## Skills demonstrated

- **Operations research:** Greedy constrained scheduling, priority queue
- **Algorithm design:** Multi-constraint satisfaction with conflict detection
- **Data visualization:** Gantt chart, utilization metrics, meeting table
- **Systems thinking:** Translating a real enterprise scheduling problem into a clean algorithmic model

## Author

**Akshay Kumar**  
[linkedin.com/in/akshaykumardl](https://www.linkedin.com/in/akshaykumardl/)
