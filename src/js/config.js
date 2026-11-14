/**
 * config.js — Diplomatic Scheduling Optimizer
 *
 * Base constants and configuration data shared between index.html and test harnesses.
 * Loaded as global variables and a SCHEDULER_CONFIG object so algorithm.js,
 * browser UI, and test suites reference the exact same data without duplication.
 */

/* ── Department definitions ──────────────────────────────────────────────── */
var DEPARTMENTS = ['State', 'Consular', 'Admin', 'Security', 'Protocol'];

var DEPT_CLASS = {
  State:    'dept-state',
  Consular: 'dept-consular',
  Admin:    'dept-admin',
  Security: 'dept-security',
  Protocol: 'dept-protocol',
};

/* ── Room names (20 diplomatically-themed conference rooms) ──────────────── */
var ROOM_NAMES = [
  'Roosevelt Room', 'Lincoln Room',   'Jefferson Hall',  'Hamilton Suite', 'Monroe Conf',
  'Adams Room',     'Madison Hall',   'Washington Conf', 'Jackson Suite',  'Tyler Room',
  'Polk Hall',      'Taylor Suite',   'Fillmore Conf',   'Pierce Room',    'Buchanan Hall',
  'Johnson Suite',  'Grant Room',     'Hayes Conf',      'Garfield Hall',  'Arthur Suite',
];

/* ── Meeting type labels ─────────────────────────────────────────────────── */
var MEETING_TYPES = [
  'Briefing', 'Review', 'Negotiation', 'Working Group', 'Consular Session',
  'Security Brief', 'Protocol Meeting', 'Press Conf', 'Training', 'Ops Meeting',
];

/* ── Simulation scale parameters ─────────────────────────────────────────── */
var TIME_SLOTS   = 20;   // 8:00 AM – 6:00 PM in 30-min increments
var N_MEETINGS   = 180;  // total meeting requests to schedule
var N_ROOMS      = 20;   // conference rooms
var N_PERSONNEL  = 150;  // diplomatic staff across all departments

/* ── Exported configuration object ──────────────────────────────────────── */
var SCHEDULER_CONFIG = {
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
