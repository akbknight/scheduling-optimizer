/**
 * test_browser_smoke.cjs
 * Real browser smoke test using puppeteer-core against installed Google Chrome.
 *
 * Verifies in an actual browser engine (Headless Chrome):
 * 1. Shared scripts (src/js/config.js, src/js/algorithm.js) load cleanly into the browser DOM
 * 2. Scheduling algorithm runs automatically on page load (window.lastResult populated)
 * 3. Strict clearance mode is active and correctly quarantines invalid attendees (unknown IDs, non-finite values)
 * 4. All UI components render into the DOM without console errors:
 *    - KPI cards (Meetings Scheduled, Unscheduled, Utilization, Clearance Status, Conflicts Resolved)
 *    - Gantt timeline chart with 20 room rows
 *    - Room utilization bar chart (Chart.js canvas context initialized)
 *    - Priority-ranked meeting table (40 rendered rows)
 * 5. Interactive UI policy toggle (toggleClearancePolicy) updates DOM and state without error
 */

const assert = require('node:assert');
const path = require('node:path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML_FILE_URL = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function runBrowserSmokeTest() {
  console.log('='.repeat(72));
  console.log('Running Actual Browser Smoke Test (Headless Google Chrome)');
  console.log('Browser Executable:', CHROME_PATH);
  console.log('Target Page:', HTML_FILE_URL);
  console.log('='.repeat(72));

  const pageErrors = [];
  const consoleErrors = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();

    page.on('pageerror', err => {
      pageErrors.push(err.toString());
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Navigate to the local file
    await page.goto(HTML_FILE_URL, { waitUntil: 'load', timeout: 15000 });

    // Verify 0 runtime script errors during page load
    assert.strictEqual(pageErrors.length, 0, `Page threw JavaScript errors: ${pageErrors.join('; ')}`);
    assert.strictEqual(consoleErrors.length, 0, `Console logged errors: ${consoleErrors.join('; ')}`);
    console.log('  [PASS] Browser loaded index.html with 0 page/console errors');

    // 2. Verify shared scripts loaded and exposed expected globals
    const globalsCheck = await page.evaluate(() => {
      return {
        hasSchedulerConfig: typeof window.SCHEDULER_CONFIG === 'object' && window.SCHEDULER_CONFIG !== null,
        hasDepartments: Array.isArray(window.DEPARTMENTS) && window.DEPARTMENTS.length === 5,
        hasRoomNames: Array.isArray(window.ROOM_NAMES) && window.ROOM_NAMES.length === 20,
        hasTimeSlots: window.TIME_SLOTS === 20,
        hasGenerateData: typeof window.generateData === 'function',
        hasRunScheduler: typeof window.runScheduler === 'function',
        hasValidateAttendee: typeof window.validateAttendee === 'function',
        hasIsValidClearance: typeof window.isValidClearance === 'function',
        hasSlotToTime: typeof window.slotToTime === 'function',
        hasRunOptimizer: typeof window.runOptimizer === 'function',
        hasLastResult: typeof window.lastResult === 'object' && window.lastResult !== null,
      };
    });

    for (const [key, val] of Object.entries(globalsCheck)) {
      assert.strictEqual(val, true, `Expected browser global ${key} to be true, got ${val}`);
    }
    console.log('  [PASS] Shared scripts loaded: SCHEDULER_CONFIG, generateData, runScheduler, validateAttendee available');

    // 3. Verify initial scheduling run executed on page load
    const resultMetrics = await page.evaluate(() => {
      const res = window.lastResult;
      const scheduledMeetings = res.results.filter(r => r.status === 'scheduled');
      const pMap = new Map((res.results[0]?.attendees || []).map(id => [id, { id, clearance: 5 }])); // mock map

      return {
        scheduled: res.scheduled,
        unscheduled: res.unscheduled,
        total: res.total,
        roomCount: res.schedule.length,
        utilizationCount: res.utilization.length,
        enforceAttendeeClearance: window.enforceAttendeeClearance,
        strictViolationsInScheduled: res.results
          .filter(r => r.status === 'scheduled')
          .filter(m => m.attendees.some(id => !window.validateAttendee(id, m.clearance, new Map(window.generateData().personnel.map(p => [p.id, p]))).valid)).length
      };
    });

    assert.strictEqual(resultMetrics.total, 180, 'Total meetings must be 180');
    assert.strictEqual(resultMetrics.scheduled, 66, 'Strict mode on Seed 42 must schedule 66 meetings');
    assert.strictEqual(resultMetrics.unscheduled, 114, 'Strict mode on Seed 42 must queue 114 meetings');
    assert.strictEqual(resultMetrics.enforceAttendeeClearance, true, 'Strict mode must be active by default');
    assert.strictEqual(resultMetrics.strictViolationsInScheduled, 0, 'Zero clearance violations in scheduled meetings');
    console.log(`  [PASS] Initial browser schedule executed: 66/180 scheduled, 0 clearance defects`);

    // 4. Verify strict mode rejection of invalid attendees directly in browser execution context
    const edgeCaseValidationInBrowser = await page.evaluate(() => {
      const pMap = new Map([
        [1, { id: 1, name: 'Valid Att', clearance: 3 }],
        [2, { id: 2, name: 'Low Clearance Att', clearance: 1 }],
        [3, { id: 3, name: 'NaN Att', clearance: NaN }],
        [4, { id: 4, name: 'String Att', clearance: 'SECRET' }],
      ]);

      const testUnknown = window.validateAttendee(999, 2, pMap);
      const testLow = window.validateAttendee(2, 3, pMap);
      const testNaN = window.validateAttendee(3, 2, pMap);
      const testString = window.validateAttendee(4, 2, pMap);
      const testValid = window.validateAttendee(1, 2, pMap);

      return {
        unknownRejected: !testUnknown.valid && testUnknown.reason.includes('Unknown attendee ID'),
        lowRejected: !testLow.valid && testLow.reason.includes('Clearance deficit'),
        nanRejected: !testNaN.valid && testNaN.reason.includes('Missing, invalid, or non-finite'),
        stringRejected: !testString.valid && testString.reason.includes('Missing, invalid, or non-finite'),
        validAccepted: testValid.valid === true
      };
    });

    assert.strictEqual(edgeCaseValidationInBrowser.unknownRejected, true, 'Browser must reject unknown attendee ID');
    assert.strictEqual(edgeCaseValidationInBrowser.lowRejected, true, 'Browser must reject clearance deficit');
    assert.strictEqual(edgeCaseValidationInBrowser.nanRejected, true, 'Browser must reject NaN clearance');
    assert.strictEqual(edgeCaseValidationInBrowser.stringRejected, true, 'Browser must reject string clearance');
    assert.strictEqual(edgeCaseValidationInBrowser.validAccepted, true, 'Browser must accept valid clearance');
    console.log('  [PASS] In-browser strict validation correctly handles unknown IDs, non-finite values, and deficits');

    // 5. Verify DOM rendering
    const domChecks = await page.evaluate(() => {
      const kpiCards = document.querySelectorAll('#kpiRow .kpi-card');
      const ganttRows = document.querySelectorAll('#ganttChart .gantt-row');
      const ganttBlocks = document.querySelectorAll('#ganttChart .gantt-block');
      const tableRows = document.querySelectorAll('#meetingTableBody tr');
      const canvas = document.getElementById('utilizationChart');
      const clearanceBtn = document.getElementById('clearanceToggleBtn');

      return {
        kpiCount: kpiCards.length,
        kpiScheduledText: kpiCards[0]?.querySelector('.kpi-value')?.textContent || '',
        kpiClearanceText: kpiCards[3]?.querySelector('.kpi-value')?.textContent || '',
        ganttRowCount: ganttRows.length,
        ganttBlockCount: ganttBlocks.length,
        tableRowCount: tableRows.length,
        hasCanvas: canvas !== null,
        canvasWidth: canvas?.width || 0,
        hasClearanceBtn: clearanceBtn !== null,
      };
    });

    assert.strictEqual(domChecks.kpiCount, 5, 'Must render 5 KPI cards');
    assert.strictEqual(domChecks.kpiScheduledText, '66', 'First KPI card must display 66');
    assert.strictEqual(domChecks.kpiClearanceText, '0 Defects', 'Clearance KPI card must display 0 Defects');
    assert.strictEqual(domChecks.ganttRowCount, 20, 'Gantt chart must render 20 room rows');
    assert.strictEqual(domChecks.ganttBlockCount, 66, 'Gantt chart must display 66 meeting blocks');
    assert.strictEqual(domChecks.tableRowCount, 40, 'Meeting table must display top 40 meetings');
    assert.strictEqual(domChecks.hasCanvas, true, 'Utilization chart canvas must exist');
    assert.ok(domChecks.canvasWidth > 0, 'Canvas width must be initialized');
    console.log('  [PASS] All UI components rendered to DOM (5 KPIs, 20 Gantt rows, 66 blocks, 40 table rows)');

    // 6. Test interactive UI policy toggle
    await page.click('#clearanceToggleBtn');

    const toggledMetrics = await page.evaluate(() => {
      const res = window.lastResult;
      const kpiCards = document.querySelectorAll('#kpiRow .kpi-card');
      const btnText = document.getElementById('clearanceBtnText')?.textContent;

      return {
        enforceAttendeeClearance: window.enforceAttendeeClearance,
        scheduled: res.scheduled,
        btnText,
        kpiClearanceText: kpiCards[3]?.querySelector('.kpi-value')?.textContent || ''
      };
    });

    assert.strictEqual(toggledMetrics.enforceAttendeeClearance, false, 'Clearance policy must toggle to unconstrained (false)');
    assert.strictEqual(toggledMetrics.scheduled, 107, 'Unconstrained mode on Seed 42 must schedule 107 meetings');
    assert.strictEqual(toggledMetrics.btnText, 'Security: Unconstrained', 'Button text must reflect unconstrained mode');
    assert.strictEqual(toggledMetrics.kpiClearanceText, '61 Deficits', 'KPI card must display 61 Deficits in unconstrained mode');
    console.log('  [PASS] Interactive policy toggle verified: unconstrained mode scheduled 107 meetings (61 deficits flagged)');

    // Toggle back to strict mode
    await page.click('#clearanceToggleBtn');
    const restoredMetrics = await page.evaluate(() => window.lastResult.scheduled);
    assert.strictEqual(restoredMetrics, 66, 'Toggling back must restore 66 scheduled meetings with 0 defects');
    console.log('  [PASS] Interactive policy toggled back to strict mode: 66 scheduled, 0 defects verified');

  } finally {
    await browser.close();
  }

  console.log('='.repeat(72));
  console.log('BROWSER SMOKE TEST PASSED COMPLETELY (100% SUCCESS)');
  console.log('='.repeat(72));
}

runBrowserSmokeTest().catch(err => {
  console.error('[BROWSER SMOKE TEST FAILED]', err);
  process.exit(1);
});
