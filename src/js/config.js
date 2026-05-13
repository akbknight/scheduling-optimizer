/**
 * config.js — Diplomatic Scheduling Optimizer
 *
 * Base constants and configuration data extracted from the inline script.
 * Loaded as a global SCHEDULER_CONFIG object so algorithm.js and charts.js
 * can reference the same data without duplication.
 *
 * NOTE: This file is a reference extraction. index.html remains self-contained
 * (all logic is inline) to preserve the live GitHub Pages demo without risk of
 * breaking it. These files document what each logical block does and can be
 * used as the basis for a future modular build (Vite, Rollup, etc.).
 */

/* ── Department definitions ──────────────────────────────────────────────── */
const DEPARTMENTS = ['State', 'Consular', 'Admin', 'Security', 'Protocol'];

const DEPT_CLASS = {
  State:    'dept-state',
  Consular: 'dept-consular',
  Admin:    'dept-admin',
  Security: 'dept-security',
  Protocol: 'dept-protocol',
};

/* ── Room names (20 diplomatically-themed conference rooms) ──────────────── */
const ROOM_NAMES = [
  'Roosevelt Room', 'Lincoln Room',   'Jefferson Hall',  'Hamilton Suite', 'Monroe Conf',
  'Adams Room',     'Madison Hall',   'Washington Conf', 'Jackson Suite',  'Tyler Room',
  'Polk Hall',      'Taylor Suite',   'Fillmore Conf',   'Pierce Room',    'Buchanan Hall',
  'Johnson Suite',  'Grant Room',     'Hayes Conf',      'Garfield Hall',  'Arthur Suite',
];

/* ── Meeting type labels ─────────────────────────────────────────────────── */
const MEETING_TYPES = [
  'Briefing', 'Review', 'Negotiation', 'Working Group', 'Consular Session',
  'Security Brief', 'Protocol Meeting', 'Press Conf', 'Training', 'Ops Meeting',
];

/* ── Simulation scale parameters ─────────────────────────────────────────── */
const TIME_SLOTS   = 20;   // 8:00 AM – 6:00 PM in 30-min increments
const N_MEETINGS   = 180;  // total meeting requests to schedule
const N_ROOMS      = 20;   // conference rooms
const N_PERSONNEL  = 150;  // diplomatic staff across all departments

/* ── Exported configuration object ──────────────────────────────────────── */
const SCHEDULER_CONFIG = {
  departments: DEPARTMENTS,
  deptClass:   DEPT_CLASS,
  roomNames:   ROOM_NAMES,
  meetingTypes: MEETING_TYPES,
  timeSlots:   TIME_SLOTS,
  nMeetings:   N_MEETINGS,
  nRooms:      N_ROOMS,
  nPersonnel:  N_PERSONNEL,
};

// Support both CommonJS (Node/test harness) and browser global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SCHEDULER_CONFIG;
}
