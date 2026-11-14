/**
 * test_clearance_validation.cjs
 * Comprehensive edge-case test suite for strict attendee clearance validation.
 * Verifies rejection and quarantine of:
 *   1. Unknown attendee IDs (IDs absent from personnel directory)
 *   2. Missing clearance (null, undefined)
 *   3. Invalid clearance types (strings, booleans, objects)
 *   4. Non-finite clearance values (NaN, Infinity, -Infinity)
 *   5. Out-of-bounds / negative clearance values (< 1)
 *   6. Genuine clearance deficits (attendee clearance < meeting requirement)
 *   7. Valid clearances (attendee clearance >= meeting requirement)
 *   8. Auditor constraint verification across both strict and unconstrained modes
 *   9. Zero violations across multi-instance benchmark seeds
 */

const assert = require('node:assert');
const path = require('node:path');

const { runScheduler, validateAttendee, isValidClearance, generateData } = require('../src/js/algorithm.js');
const config = require('../src/js/config.js');

console.log('='.repeat(70));
console.log('Running Strict Attendee Clearance Edge-Case Verification Suite');
console.log('='.repeat(70));

let testsPassed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Helper function checks
test('isValidClearance: accepts finite numbers >= 1', () => {
  assert.strictEqual(isValidClearance(1), true);
  assert.strictEqual(isValidClearance(3), true);
  assert.strictEqual(isValidClearance(5), true);
});

test('isValidClearance: rejects non-numbers, non-finite, and < 1', () => {
  assert.strictEqual(isValidClearance(0), false);
  assert.strictEqual(isValidClearance(-1), false);
  assert.strictEqual(isValidClearance(NaN), false);
  assert.strictEqual(isValidClearance(Infinity), false);
  assert.strictEqual(isValidClearance(-Infinity), false);
  assert.strictEqual(isValidClearance(null), false);
  assert.strictEqual(isValidClearance(undefined), false);
  assert.strictEqual(isValidClearance('3'), false);
  assert.strictEqual(isValidClearance('SECRET'), false);
  assert.strictEqual(isValidClearance({}), false);
  assert.strictEqual(isValidClearance([]), false);
  assert.strictEqual(isValidClearance(true), false);
});

// Setup directory map for validation tests
const personnelMap = new Map([
  [1, { id: 1, name: 'Alice', dept: 'Political', clearance: 3 }],
  [2, { id: 2, name: 'Bob', dept: 'Consular', clearance: 1 }],
  [3, { id: 3, name: 'NullClearance', dept: 'Admin', clearance: null }],
  [4, { id: 4, name: 'UndefinedClearance', dept: 'Admin' }],
  [5, { id: 5, name: 'StringClearance', dept: 'Security', clearance: 'TOP_SECRET' }],
  [6, { id: 6, name: 'NaNClearance', dept: 'Political', clearance: NaN }],
  [7, { id: 7, name: 'InfinityClearance', dept: 'Political', clearance: Infinity }],
  [8, { id: 8, name: 'NegativeClearance', dept: 'Political', clearance: -2 }],
]);

test('validateAttendee: rejects unknown attendee ID', () => {
  const res = validateAttendee(999, 1, personnelMap);
  assert.strictEqual(res.valid, false);
  assert.match(res.reason, /Unknown attendee ID/);
});

test('validateAttendee: rejects null and undefined clearance values', () => {
  const resNull = validateAttendee(3, 1, personnelMap);
  assert.strictEqual(resNull.valid, false);
  assert.match(resNull.reason, /Missing, invalid, or non-finite clearance/);

  const resUndef = validateAttendee(4, 1, personnelMap);
  assert.strictEqual(resUndef.valid, false);
  assert.match(resUndef.reason, /Missing, invalid, or non-finite clearance/);
});

test('validateAttendee: rejects string clearance values', () => {
  const res = validateAttendee(5, 1, personnelMap);
  assert.strictEqual(res.valid, false);
  assert.match(res.reason, /Missing, invalid, or non-finite clearance/);
});

test('validateAttendee: rejects NaN and Infinity clearance values', () => {
  const resNaN = validateAttendee(6, 1, personnelMap);
  assert.strictEqual(resNaN.valid, false);
  assert.match(resNaN.reason, /Missing, invalid, or non-finite clearance/);

  const resInf = validateAttendee(7, 1, personnelMap);
  assert.strictEqual(resInf.valid, false);
  assert.match(resInf.reason, /Missing, invalid, or non-finite clearance/);
});

test('validateAttendee: rejects negative clearance values', () => {
  const res = validateAttendee(8, 1, personnelMap);
  assert.strictEqual(res.valid, false);
  assert.match(res.reason, /Missing, invalid, or non-finite clearance/);
});

test('validateAttendee: rejects clearance deficit', () => {
  const res = validateAttendee(2, 3, personnelMap); // Bob has clearance 1, meeting requires 3
  assert.strictEqual(res.valid, false);
  assert.match(res.reason, /Clearance deficit/);
});

test('validateAttendee: accepts sufficient clearance', () => {
  const resEqual = validateAttendee(1, 3, personnelMap); // Alice has clearance 3, meeting requires 3
  assert.strictEqual(resEqual.valid, true);

  const resGreater = validateAttendee(1, 2, personnelMap); // Alice has clearance 3, meeting requires 2
  assert.strictEqual(resGreater.valid, true);
});

// Integration tests with runScheduler
test('runScheduler: strict mode quarantines meeting with unknown attendee ID', () => {
  const mockData = {
    personnel: [{ id: 1, name: 'Alice', dept: 'Political', clearance: 3 }],
    rooms: [{ id: 0, name: 'Room 1', capacity: 10, clearance: 3 }],
    meetings: [
      {
        id: 101,
        title: 'Unknown Agent Briefing',
        dept: 'Political',
        priority: 5,
        duration: 1,
        clearance: 2,
        attendees: [1, 999], // 999 does not exist
        attendeeCount: 2,
        preferredStart: 0
      }
    ]
  };

  const out = runScheduler(mockData, { nRooms: 1, timeSlots: 20, enforceAttendeeClearance: true });
  assert.strictEqual(out.scheduled, 0);
  assert.strictEqual(out.unscheduled, 1);
  const queued = out.results[0];
  assert.strictEqual(queued.status, 'queued');
  assert.match(queued.rejectionReason, /Unknown attendee ID \(999\)/);
});

test('runScheduler: strict mode quarantines meeting with NaN clearance attendee', () => {
  const mockData = {
    personnel: [
      { id: 1, name: 'Alice', dept: 'Political', clearance: 3 },
      { id: 2, name: 'BadRecord', dept: 'Political', clearance: NaN }
    ],
    rooms: [{ id: 0, name: 'Room 1', capacity: 10, clearance: 3 }],
    meetings: [
      {
        id: 102,
        title: 'Corrupted Dossier Meeting',
        dept: 'Political',
        priority: 5,
        duration: 1,
        clearance: 2,
        attendees: [1, 2],
        attendeeCount: 2,
        preferredStart: 0
      }
    ]
  };

  const out = runScheduler(mockData, { nRooms: 1, timeSlots: 20, enforceAttendeeClearance: true });
  assert.strictEqual(out.scheduled, 0);
  assert.strictEqual(out.unscheduled, 1);
  const queued = out.results[0];
  assert.strictEqual(queued.status, 'queued');
  assert.match(queued.rejectionReason, /Missing, invalid, or non-finite clearance/);
});

test('runScheduler: strict mode schedules meeting when all attendees meet clearance', () => {
  const mockData = {
    personnel: [
      { id: 1, name: 'Alice', dept: 'Political', clearance: 3 },
      { id: 2, name: 'Bob', dept: 'Political', clearance: 2 }
    ],
    rooms: [{ id: 0, name: 'Room 1', capacity: 10, clearance: 3 }],
    meetings: [
      {
        id: 103,
        title: 'Cleared Delegation Sync',
        dept: 'Political',
        priority: 5,
        duration: 1,
        clearance: 2,
        attendees: [1, 2],
        attendeeCount: 2,
        preferredStart: 0
      }
    ]
  };

  const out = runScheduler(mockData, { nRooms: 1, timeSlots: 20, enforceAttendeeClearance: true });
  assert.strictEqual(out.scheduled, 1);
  assert.strictEqual(out.unscheduled, 0);
  assert.strictEqual(out.results[0].status, 'scheduled');
});

test('runScheduler: unconstrained mode places meeting but strict audit catches violations', () => {
  const mockData = {
    personnel: [
      { id: 1, name: 'Alice', dept: 'Political', clearance: 1 } // Deficit for clearance 2
    ],
    rooms: [{ id: 0, name: 'Room 1', capacity: 10, clearance: 3 }],
    meetings: [
      {
        id: 104,
        title: 'Unchecked Intake Sync',
        dept: 'Political',
        priority: 5,
        duration: 1,
        clearance: 2,
        attendees: [1],
        attendeeCount: 1,
        preferredStart: 0
      }
    ]
  };

  // Run unconstrained
  const outUnc = runScheduler(mockData, { nRooms: 1, timeSlots: 20, enforceAttendeeClearance: false });
  assert.strictEqual(outUnc.scheduled, 1);

  // Audited validation must flag this violation
  const pMap = new Map(mockData.personnel.map(p => [p.id, p]));
  const hasViolation = outUnc.results[0].attendees.some(id => !validateAttendee(id, outUnc.results[0].clearance, pMap).valid);
  assert.strictEqual(hasViolation, true);
});

test('Multi-Instance Verification: 0 violations across 5 deterministic seeds', () => {
  const seeds = [42, 100, 2026, 31415, 88888];
  for (const s of seeds) {
    const data = generateData(config, s);
    const out = runScheduler(data, { ...config, enforceAttendeeClearance: true });
    const pMap = new Map(data.personnel.map(p => [p.id, p]));
    for (const m of out.results.filter(r => r.status === 'scheduled')) {
      for (const attId of m.attendees) {
        const check = validateAttendee(attId, m.clearance, pMap);
        assert.strictEqual(check.valid, true, `Seed ${s} had clearance violation on meeting ${m.id}`);
      }
    }
  }
});

console.log('='.repeat(70));
console.log(`ALL ${testsPassed} EDGE-CASE TESTS PASSED PERFECTLY (100% PASS)`);
console.log('='.repeat(70));
