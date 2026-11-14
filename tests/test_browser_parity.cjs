/**
 * test_browser_parity.cjs
 * Comprehensive parity test suite verifying:
 * 1. index.html references the single shared implementation (src/js/config.js, src/js/algorithm.js)
 * 2. Identical edge-case fixtures run against algorithm.js and match browser expectations
 * 3. Strict rejection & quarantine of:
 *    - Unknown attendee IDs
 *    - Invalid clearance values (null, undefined, NaN, Infinity, -Infinity, strings, negatives)
 *    - Clearance deficits
 * 4. 100% deterministic output across multi-instance seeds (Seeds 42, 100, 2026, 31415, 88888)
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const config = require('../src/js/config.js');
const {
  generateData,
  runScheduler,
  slotToTime,
  mulberry32,
  validateAttendee,
  isValidClearance
} = require('../src/js/algorithm.js');

console.log('='.repeat(72));
console.log('Running Scheduler Shared Implementation & Browser Parity Test Suite');
console.log('='.repeat(72));

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// ── Check 1: Shared Implementation in index.html ─────────────────────────────
test('index.html loads shared config.js and algorithm.js without code duplication', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(
    htmlContent.includes('<script src="src/js/config.js"></script>'),
    'index.html must load src/js/config.js'
  );
  assert.ok(
    htmlContent.includes('<script src="src/js/algorithm.js"></script>'),
    'index.html must load src/js/algorithm.js'
  );

  // Verify that duplicate function definitions are NOT present inline
  assert.ok(
    !htmlContent.includes('function runScheduler(data) {'),
    'index.html should not have a duplicate runScheduler implementation'
  );
  assert.ok(
    !htmlContent.includes('function validateAttendee('),
    'index.html should not have a duplicate validateAttendee implementation'
  );
  assert.ok(
    !htmlContent.includes('function isValidClearance('),
    'index.html should not have a duplicate isValidClearance implementation'
  );
});

// ── Check 2: Edge-case Parity Fixtures (Unknown IDs & Invalid Clearances) ───────
test('Parity Fixture 1: Unknown attendee ID quarantine parity', () => {
  const testPersonnel = [
    { id: 10, name: 'Diplomat Alpha', dept: 'State', clearance: 4 },
  ];
  const pMap = new Map(testPersonnel.map(p => [p.id, p]));

  // Test standalone validator
  const valResult = validateAttendee(999, 3, pMap);
  assert.strictEqual(valResult.valid, false);
  assert.strictEqual(valResult.reason, 'Unknown attendee ID (999) not in personnel directory');

  // Test full scheduler execution with unknown attendee fixture
  const fixtureData = {
    personnel: testPersonnel,
    rooms: [{ id: 0, name: 'Roosevelt Room', capacity: 10, clearance: 5 }],
    meetings: [
      {
        id: 1,
        title: 'Bilateral Summit',
        dept: 'State',
        priority: 5,
        duration: 1,
        clearance: 3,
        attendees: [10, 999], // 999 is unknown!
        attendeeCount: 2,
        preferredStart: 0,
      }
    ]
  };

  const resStrict = runScheduler(fixtureData, { nRooms: 1, timeSlots: 20, enforceAttendeeClearance: true });
  assert.strictEqual(resStrict.scheduled, 0);
  assert.strictEqual(resStrict.unscheduled, 1);
  assert.strictEqual(resStrict.results[0].status, 'queued');
  assert.strictEqual(resStrict.results[0].rejectionReason, 'Unknown attendee ID (999) not in personnel directory');
});

test('Parity Fixture 2: Missing, null, undefined, and non-numeric clearance quarantine parity', () => {
  const testPersonnel = [
    { id: 1, name: 'Alice', clearance: null },
    { id: 2, name: 'Bob', clearance: undefined },
    { id: 3, name: 'Charlie', clearance: 'TOP_SECRET' },
    { id: 4, name: 'David', clearance: '4' },
    { id: 5, name: 'Eve', clearance: false },
  ];
  const pMap = new Map(testPersonnel.map(p => [p.id, p]));

  for (const person of testPersonnel) {
    const val = validateAttendee(person.id, 2, pMap);
    assert.strictEqual(val.valid, false);
    assert.ok(val.reason.includes('Missing, invalid, or non-finite clearance'));
  }
});

test('Parity Fixture 3: Non-finite (NaN, Infinity, -Infinity) and negative clearance parity', () => {
  const testPersonnel = [
    { id: 1, name: 'NaN Att', clearance: NaN },
    { id: 2, name: 'Inf Att', clearance: Infinity },
    { id: 3, name: '-Inf Att', clearance: -Infinity },
    { id: 4, name: 'Neg Att', clearance: -1 },
    { id: 5, name: 'Zero Att', clearance: 0 },
  ];
  const pMap = new Map(testPersonnel.map(p => [p.id, p]));

  for (const person of testPersonnel) {
    const val = validateAttendee(person.id, 2, pMap);
    assert.strictEqual(val.valid, false);
    assert.ok(val.reason.includes('Missing, invalid, or non-finite clearance'));
  }
});

test('Parity Fixture 4: Clearance deficit rejection parity', () => {
  const testPersonnel = [
    { id: 1, name: 'Low Clearance Att', clearance: 2 },
  ];
  const pMap = new Map(testPersonnel.map(p => [p.id, p]));

  const val = validateAttendee(1, 3, pMap);
  assert.strictEqual(val.valid, false);
  assert.strictEqual(val.reason, 'Clearance deficit: attendee 1 has clearance 2, requires 3');
});

test('Parity Fixture 5: Valid clearance acceptance parity', () => {
  const testPersonnel = [
    { id: 1, name: 'High Clearance Att', clearance: 4 },
  ];
  const pMap = new Map(testPersonnel.map(p => [p.id, p]));

  const val = validateAttendee(1, 3, pMap);
  assert.strictEqual(val.valid, true);
  assert.strictEqual(val.reason, undefined);
});

// ── Check 3: Multi-Instance Benchmark Seed Parity ─────────────────────────────
test('Multi-Instance Parity: Seed 42 baseline exactly matches benchmark values', () => {
  const seed42Data = generateData(config, 42);
  const strictRes = runScheduler(seed42Data, { ...config, enforceAttendeeClearance: true });
  const unconstrainedRes = runScheduler(seed42Data, { ...config, enforceAttendeeClearance: false });

  // Baseline Seed 42 reference numbers:
  // Unconstrained: 107 scheduled, 73 queued
  // Strict: 66 scheduled, 114 queued
  assert.strictEqual(unconstrainedRes.scheduled, 107, 'Unconstrained scheduled count on Seed 42 must be 107');
  assert.strictEqual(unconstrainedRes.unscheduled, 73, 'Unconstrained queued count on Seed 42 must be 73');

  assert.strictEqual(strictRes.scheduled, 66, 'Strict scheduled count on Seed 42 must be 66');
  assert.strictEqual(strictRes.unscheduled, 114, 'Strict queued count on Seed 42 must be 114');

  // Verify 0 clearance violations in strict result
  const pMap = new Map(seed42Data.personnel.map(p => [p.id, p]));
  let strictViolations = 0;
  for (const m of strictRes.results.filter(r => r.status === 'scheduled')) {
    if (m.attendees.some(id => !validateAttendee(id, m.clearance, pMap).valid)) {
      strictViolations++;
    }
  }
  assert.strictEqual(strictViolations, 0, 'Strict mode must have exactly 0 attendee clearance violations');
});

test('Multi-Instance Parity across all 5 benchmark seeds (42, 100, 2026, 31415, 88888)', () => {
  const seeds = [42, 100, 2026, 31415, 88888];
  let totalStrictSched = 0;
  let totalUnconstrainedSched = 0;

  for (const s of seeds) {
    const data = generateData(config, s);
    const strictRes = runScheduler(data, { ...config, enforceAttendeeClearance: true });
    const unconstrainedRes = runScheduler(data, { ...config, enforceAttendeeClearance: false });

    totalStrictSched += strictRes.scheduled;
    totalUnconstrainedSched += unconstrainedRes.scheduled;

    // Verify 0 violations on each instance
    const pMap = new Map(data.personnel.map(p => [p.id, p]));
    for (const m of strictRes.results.filter(r => r.status === 'scheduled')) {
      for (const attId of m.attendees) {
        assert.ok(
          validateAttendee(attId, m.clearance, pMap).valid,
          `Seed ${s}: scheduled meeting ${m.id} has invalid attendee ${attId}`
        );
      }
    }
  }

  // Exact averages from benchmark:
  // Unconstrained avg scheduled: 112.8 (total 564)
  // Strict avg scheduled: 70.2 (total 351)
  assert.strictEqual(totalUnconstrainedSched, 564, '5-seed unconstrained total scheduled must be 564');
  assert.strictEqual(totalStrictSched, 351, '5-seed strict total scheduled must be 351');
  assert.strictEqual(totalStrictSched / seeds.length, 70.2, '5-seed strict avg scheduled must be 70.2');
});

console.log('='.repeat(72));
console.log(`ALL ${passed} PARITY & SHARED IMPLEMENTATION CHECKS PASSED (100% PASS)`);
console.log('='.repeat(72));
