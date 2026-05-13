# Data Dictionary — Diplomatic Scheduling Optimizer

All data is synthetic and generated deterministically from seed 42.

---

## Personnel

Represents a diplomatic or support staff member.

| Field | Type | Range | Description |
|---|---|---|---|
| `id` | integer | 0–149 | Zero-indexed unique identifier |
| `name` | string | — | Display name: "Personnel {id+1}" |
| `dept` | string | State, Consular, Admin, Security, Protocol | Department assignment; assigned round-robin so each department has exactly 30 members |
| `clearance` | integer | 1–5 | Security clearance level. 1 = Unclassified, 3 = Secret, 5 = Top Secret (synthetic scale) |

**Notes:** Clearance levels are uniformly distributed 1–5. In the real State Department system, most personnel operate at Unclassified or Secret levels; TS clearances are rare. The synthetic distribution is more uniform for algorithmic interest.

---

## Rooms

Represents a conference room available for scheduling.

| Field | Type | Range | Description |
|---|---|---|---|
| `id` | integer | 0–19 | Zero-indexed room index |
| `name` | string | — | Named after U.S. presidents (see ROOM_NAMES constant) |
| `capacity` | integer | 6–30 | Maximum number of occupants |
| `clearance` | integer | 1–5 | Maximum classification level permitted in this room |

**Notes:** Room clearance represents the physical security rating of the room. A room with clearance=1 can only host Unclassified meetings. A room with clearance=5 can host any meeting. Rooms are generated with uniform random capacities and clearances.

---

## Meeting Requests (Input)

Each meeting request describes a scheduling need that must be satisfied.

| Field | Type | Range | Description |
|---|---|---|---|
| `id` | integer | 0–179 | Zero-indexed request ID |
| `title` | string | — | "{MeetingType} {id+1}" e.g. "Briefing 12" |
| `dept` | string | State, Consular, Admin, Security, Protocol | Owning department; determines attendee pool |
| `priority` | integer | 1–5 | Scheduling priority. 5 = highest; sorted descending before assignment |
| `duration` | integer | 1–4 | Duration in 30-minute slots. Distribution: 1 slot most common, 4 slots rare. Weighted pick from [1,1,1,2,2,3,4] |
| `clearance` | integer | 1–3 | Required room clearance level. Meetings are capped at 3 (Secret) in this simulation |
| `attendees` | integer[] | — | Array of personnel IDs required to attend. Drawn from the meeting's department |
| `attendeeCount` | integer | 2–12 | Length of attendees array |
| `preferredStart` | integer | 0–16 | Preferred start slot index. The scheduler tries this first and scans forward |

**Meeting duration distribution** (slots → minutes):
- 1 slot = 30 min: ~43% of meetings
- 2 slots = 60 min: ~29% of meetings
- 3 slots = 90 min: ~14% of meetings
- 4 slots = 120 min: ~14% of meetings

---

## Scheduled Meetings (Output)

Returned by `runScheduler()`. Extends the meeting request with assignment results.

| Field | Type | Description |
|---|---|---|
| `roomId` | integer \| null | Assigned room index; null if unscheduled |
| `roomName` | string | Assigned room name; "—" if unscheduled |
| `startSlot` | integer \| null | Assigned start slot (0 = 8:00 AM, 19 = 5:30 PM); null if unscheduled |
| `startTime` | string | Human-readable start time e.g. "9:30"; "—" if unscheduled |
| `endTime` | string | Human-readable end time; "—" if unscheduled |
| `durationLabel` | string | e.g. "30 min" or "60 min" |
| `status` | string | "scheduled" or "queued" |

---

## Time Slots

The scheduling window covers 8:00 AM to 6:00 PM, divided into 30-minute slots.

| Slot index | Time |
|---|---|
| 0 | 8:00 |
| 1 | 8:30 |
| 2 | 9:00 |
| ... | ... |
| 18 | 5:00 |
| 19 | 5:30 |

A meeting starting at slot S with duration D occupies slots S, S+1, ..., S+D-1. A duration-4 meeting starting at slot 16 would end at slot 20 (6:00 PM), which is the boundary — hence `preferredStart` is capped at `TIME_SLOTS - 4 = 16`.

---

## Schedule Matrix

Internal structure used by the algorithm.

| Property | Description |
|---|---|
| Type | `number[][] | null[][]` |
| Dimensions | `[N_ROOMS][TIME_SLOTS]` = `[20][20]` |
| Value | Meeting ID (integer) if that room-slot is occupied; `null` if free |

---

## Utilization Array

Output computed after scheduling completes.

| Field | Type | Description |
|---|---|---|
| `name` | string | Room name |
| `pct` | integer | Percentage of the 20 time slots that are occupied (0–100) |
