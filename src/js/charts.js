/**
 * charts.js — Diplomatic Scheduling Optimizer
 *
 * Chart.js initialization for the room utilization bar chart.
 *
 * Depends on: Chart.js loaded via CDN (chart.umd.min.js)
 *
 * NOTE: This file is a reference extraction. index.html is self-contained.
 * See docs/architecture.md for the full visualization layer description.
 */

/**
 * initUtilizationChart(canvasId, utilization)
 *
 * Renders a bar chart showing the percentage of available time slots filled
 * per room. Bars are colored by utilization tier:
 *   - > 70%: amber accent (high utilization)
 *   - 40–70%: blue (moderate)
 *   - < 40%: dim white (low utilization)
 *
 * @param {string}   canvasId    - ID of the <canvas> element
 * @param {{ name: string, pct: number }[]} utilization - per-room utilization array
 * @returns {Chart} The Chart.js instance (call .destroy() before re-rendering)
 */
function initUtilizationChart(canvasId, utilization) {
  const ctx       = document.getElementById(canvasId).getContext('2d');
  const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
  const border    = getComputedStyle(document.documentElement).getPropertyValue('--grid-line').trim();

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: utilization.map(r =>
        r.name
          .replace(' Room', '')
          .replace(' Hall', '')
          .replace(' Suite', '')
          .replace(' Conf', '')
      ),
      datasets: [{
        data: utilization.map(r => r.pct),
        backgroundColor: utilization.map(r =>
          r.pct > 70  ? 'rgba(232,160,32,0.7)'  :
          r.pct > 40  ? 'rgba(96,165,250,0.6)'  :
                        'rgba(255,255,255,0.15)'
        ),
        borderRadius: 4,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.y}% utilized`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color:        textMuted,
            font:         { size: 9, family: 'monospace' },
            maxRotation:  30,
          },
          grid:   { display: false },
          border: { display: false },
        },
        y: {
          min:  0,
          max:  100,
          ticks: {
            color:    textMuted,
            font:     { size: 10, family: 'monospace' },
            callback: v => v + '%',
          },
          grid:   { color: border },
          border: { display: false },
        },
      },
    },
  });
}

/**
 * destroyAndReinit(chartRef, canvasId, utilization)
 *
 * Convenience wrapper: destroys an existing chart instance before creating a
 * new one. Required when the theme toggles (dark/light) or new data is loaded.
 *
 * @param {Chart|null} chartRef   - existing Chart.js instance or null
 * @param {string}     canvasId
 * @param {object[]}   utilization
 * @returns {Chart} New Chart.js instance
 */
function destroyAndReinit(chartRef, canvasId, utilization) {
  if (chartRef) {
    chartRef.destroy();
  }
  return initUtilizationChart(canvasId, utilization);
}

// CommonJS export for test harness
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initUtilizationChart, destroyAndReinit };
}
