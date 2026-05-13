/**
 * algorithm.js — Diplomatic Scheduling Optimizer
 *
 * Greedy priority-based scheduling algorithm.
 *
 * Strategy:
 *   1. Generate synthetic personnel and rooms via seeded RNG (mulberry32, seed=42)
 *      so results are deterministic and reproducible across runs.
 *   2. Score all meeting requests by their priority field (1–5).
 *   3. Sort the request queue descending — highest priority scheduled first.
 *   4. For each request, scan time slots starting at the meeting's preferred
 *      start slot, wrapping forward. For each slot, scan all rooms:
 *        a. Skip rooms where room.clearance < meeting.clearance
 *        b. Skip rooms where room.capacity < attendeeCount
 *        c. Check the room is free for all required duration slots
 *        d. Check all attendees are free for the full duration
 *        e. First slot+room pair satisfying all constraints wins.
 *   5. Assigned meetings mark their room slots and attendee slots as busy.
 *   6. Unassignable meetings are marked status='queued' for the retry pass.
 *
 * Time complexity: O(N × T × R × A)
 *   N = meetings (180), T = time slots (20), R = rooms (20), A = attendees per meeting (2–12)
 *   Worst case ~180 × 20 × 20 × 12 = 864,000 iterations — runs in < 5 ms client-side.
 *
 * NOTE: This file is a reference extraction. index.html is self-contained.
 * See docs/methodology.md for full algorithm documentation.
 */

/* ── Seeded RNG (mulberry32) ─────────────────────────────────────────────── */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const _rng = mulberry32(42);
function randInt(min, max) { return Math.floor(_rng() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(_rng() * arr.length)]; }

/* ── Time slot helper ────────────────────────────────────────────────────── */
function slotToTime(slot) {
  const hour = 8 + Math.floor(slot / 2);
  const min  = (slot % 2) * 30;
  return `${hour}:${min === 0 ? '00' : '30'}`;
}

/* ── Data generation ─────────────────────────────────────────────────────── */
/**
 * generateData()
 * Creates synthetic personnel, rooms, and meeting requests using the seeded RNG.
 * Calling this with the same seed (42) always returns identical data.
 *
 * @param {object} config - SCHEDULER_CONFIG
 * @returns {{ personnel: object[], rooms: object[], meetings: object[] }}
 */
function generateData(config) {
  const { departments, roomNames, meetingTypes, timeSlots, nMeetings, nPersonnel } = config;

  const personnel = Array.from({ length: nPersonnel }, (_, i) => ({
    id:        i,
    name:      `Personnel ${i + 1}`,
    dept:      departments[i % departments.length],
    clearance: randInt(1, 5),
  }));

  const rooms = roomNames.map((name, i) => ({
    id:        i,
    name,
    capacity:  randInt(6, 30),
    clearance: randInt(1, 5),
  }));

  const meetings = Array.from({ length: nMeetings }, (_, i) => {
    const dept         = pick(departments);
    const deptPersonnel = personnel.filter(p => p.dept === dept);
    const attendeeCount = randInt(2, Math.min(12, deptPersonnel.length));
    const attendees     = [];
    const pool          = [...deptPersonnel];
    for (let j = 0; j < attendeeCount && pool.length > 0; j++) {
      const idx = Math.floor(_rng() * pool.length);
      attendees.push(pool[idx].id);
      pool.splice(idx, 1);
    }
    return {
      id:             i,
      title:          `${pick(meetingTypes)} ${i + 1}`,
      dept,
      priority:       randInt(1, 5),
      duration:       pick([1, 1, 1, 2, 2, 3, 4]), // in 30-min slots
      clearance:      randInt(1, 3),
      attendees,
      attendeeCount:  attendees.length,
      preferredStart: randInt(0, timeSlots - 4),
    };
  });

  return { personnel, rooms, meetings };
}

/* ── Core scheduler ──────────────────────────────────────────────────────── */
/**
 * runScheduler(data, config)
 *
 * Greedy priority-based scheduler. Mutates no external state.
 *
 * @param {{ personnel: object[], rooms: object[], meetings: object[] }} data
 * @param {object} config - SCHEDULER_CONFIG
 * @returns {{
 *   results:      object[],   // all meeting objects annotated with assignment info
 *   schedule:     (number|null)[][],  // [room][slot] = meetingId or null
 *   utilization:  { name: string, pct: number }[],
 *   scheduled:    number,
 *   unscheduled:  number,
 *   total:        number,
 * }}
 */
function runScheduler(data, config) {
  const { meetings, rooms } = data;
  const { nRooms, timeSlots: TIME_SLOTS } = config;

  // Room schedule matrix: [roomIndex][slotIndex] = meetingId or null
  const schedule = Array.from({ length: nRooms }, () => new Array(TIME_SLOTS).fill(null));

  // Personnel busy map: personId -> Set<slotIndex>
  const personnelBusy = new Map();

  // Sort by priority descending
  const sorted = [...meetings].sort((a, b) => b.priority - a.priority);

  const results    = [];
  let   scheduled  = 0;
  let   unscheduled = 0;

  for (const mtg of sorted) {
    let found = false;

    for (let offset = 0; offset < TIME_SLOTS && !found; offset++) {
      const startSlot = (mtg.preferredStart + offset) % (TIME_SLOTS - mtg.duration + 1);
      if (startSlot + mtg.duration > TIME_SLOTS) continue;

      for (let r = 0; r < nRooms && !found; r++) {
        const room = rooms[r];

        // Hard constraint: clearance
        if (room.clearance < mtg.clearance) continue;

        // Hard constraint: capacity
        if (room.capacity < mtg.attendeeCount) continue;

        // Hard constraint: room availability
        let roomFree = true;
        for (let s = startSlot; s < startSlot + mtg.duration; s++) {
          if (schedule[r][s] !== null) { roomFree = false; break; }
        }
        if (!roomFree) continue;

        // Hard constraint: attendee availability
        let attendeesFree = true;
        for (const pid of mtg.attendees) {
          const busy = personnelBusy.get(pid) || new Set();
          for (let s = startSlot; s < startSlot + mtg.duration; s++) {
            if (busy.has(s)) { attendeesFree = false; break; }
          }
          if (!attendeesFree) break;
        }
        if (!attendeesFree) continue;

        // Assign room slots
        for (let s = startSlot; s < startSlot + mtg.duration; s++) {
          schedule[r][s] = mtg.id;
        }

        // Mark attendees busy
        for (const pid of mtg.attendees) {
          if (!personnelBusy.has(pid)) personnelBusy.set(pid, new Set());
          for (let s = startSlot; s < startSlot + mtg.duration; s++) {
            personnelBusy.get(pid).add(s);
          }
        }

        results.push({
          ...mtg,
          roomId:        r,
          roomName:      rooms[r].name,
          startSlot,
          startTime:     slotToTime(startSlot),
          endTime:       slotToTime(startSlot + mtg.duration),
          durationLabel: mtg.duration === 1 ? '30 min' : `${mtg.duration * 30} min`,
          status:        'scheduled',
        });
        scheduled++;
        found = true;
      }
    }

    if (!found) {
      results.push({
        ...mtg,
        roomId:        null,
        roomName:      '—',
        startSlot:     null,
        startTime:     '—',
        endTime:       '—',
        durationLabel: mtg.duration === 1 ? '30 min' : `${mtg.duration * 30} min`,
        status:        'queued',
      });
      unscheduled++;
    }
  }

  // Per-room utilization percentage
  const utilization = rooms.map((room, r) => {
    const usedSlots = schedule[r].filter(v => v !== null).length;
    return { name: room.name, pct: Math.round((usedSlots / TIME_SLOTS) * 100) };
  });

  return { results, schedule, utilization, scheduled, unscheduled, total: meetings.length };
}

// CommonJS export for test harness
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateData, runScheduler, slotToTime, mulberry32 };
}
