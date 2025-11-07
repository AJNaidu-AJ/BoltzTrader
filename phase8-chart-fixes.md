# Phase 8 — Performance Chart Fixes (Cumulative Performance & Benchmark)

## Goal
Fix rendering problems in the "Cumulative Performance" chart:
- wrong scales / overlapping axis values
- inconsistent numeric ranges across timeframes (7/30/90d)
- dense markers causing visual clutter
- missing data / gaps producing flat lines or jumps
- add region-aware benchmark line (NIFTY/S&P/BTC)
- compute correct compounded cumulative returns

This doc gives everything the agent needs to implement, test and verify improvements.

---

## 1 — API: Reliable aggregated time-series (backend)

### New endpoint
`GET /api/performance/user/{userId}?range=90d&freq=daily&benchmark=true`

**Response schema**
```json
{
  "user_id": "uuid",
  "range": "90d",
  "freq": "daily",
  "series": [
    {"date":"2025-08-10","user_return":0.0023,"user_cum":1.0123,"benchmark_return":0.0017,"benchmark_cum":1.0091},
    ...
  ],
  "meta": {"start":"2025-08-10","end":"2025-11-07","points":90}
}
```

### Backend responsibilities

1. Aggregate raw trade events into *daily* returns (use trade PnL/portfolio value to compute daily % return).
2. **Fill missing days**: if a date has no trades, set `user_return = 0.0` and carry forward cumulative value.
3. Compute **compounded cumulative value** correctly:

   * `cum[i] = cum[i-1] * (1 + return[i])`
   * initialize `cum[0] = 1 + return[0]` (or 1.0 then multiply).
4. Fetch benchmark series (market index or BTC) for same date range and compute the same daily returns + compounded cumulative.
5. Return aligned arrays (same dates, same length).
6. Add `NaN` handling — ensure numbers are numeric and finite.

### SQL / pseudo:

* Use SQL window functions to compute daily PnL and normalize by start-of-day portfolio value.
* Left-join dates table to fill gaps.
* Export pre-aggregated rows to API for UI use.

---

## 2 — Data transformation rules (agent MUST implement)

On the backend or a transformation layer:

* Create a date-sequence for the requested range.
* Map raw event bucket into `daily_return = (end_value - start_value) / start_value`.
* If start_value is 0 or missing, mark return 0 and log anomaly.
* Compute compounded `cum` as above (use float64).
* Compute `alpha` = `user_cum - benchmark_cum` or relative difference: `(user_cum/benchmark_cum - 1) * 100` for percent alpha.

Downsample if `points > 500` (for extreme ranges) — use uniform sampling (or aggregation to weekly).

---

## 3 — Chart Component (frontend) — recommended: Recharts (or Chart.js)

**Why**: Recharts supports responsive containers, dual axes, area/line charts, custom formatters and is React-friendly.

### New component file

`src/components/performance/PerformanceChart.tsx`

**Full example (Recharts)**:

```tsx
// PerformanceChart.tsx
import React, { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';

type Point = {
  date: string;
  user_cum: number;         // cumulative multiplier (1.1234 -> 12.34% total)
  benchmark_cum?: number;
};

export function PerformanceChart({ data }: { data: Point[] }) {
  // compute domain with padding
  const { yMin, yMax } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    data.forEach(d => {
      if (isFinite(d.user_cum)) { min = Math.min(min, d.user_cum); max = Math.max(max, d.user_cum); }
      if (isFinite(d.benchmark_cum)) { min = Math.min(min, d.benchmark_cum); max = Math.max(max, d.benchmark_cum); }
    });
    // If values ~1.0 (multipliers) make small padding
    if (!isFinite(min) || !isFinite(max)) { min = 0.9; max = 1.1; }
    const padding = (max - min) * 0.08 || 0.05;
    return { yMin: min - padding, yMax: max + padding };
  }, [data]);

  const tooltipFormatter = (value: any, name: string) => {
    // convert multiplier to % return (multiplier -1)*100
    const percent = (Number(value) - 1) * 100;
    return `${percent.toFixed(2)}%`;
  };

  const xTickFormatter = (tick: string) => {
    try { return format(parseISO(tick), 'MMM d'); } catch { return tick; }
  };

  return (
    <ResponsiveContainer width="100%" height={360}>
      <AreaChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 10 }}>
        <defs>
          <linearGradient id="userGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#2b8cff" stopOpacity={0.35}/>
            <stop offset="95%" stopColor="#2b8cff" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="benchGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.18}/>
            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={xTickFormatter} minTickGap={20} />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={(v) => `${((v as number) - 1) * 100 | 0}%`}
          width={85}
        />
        <Tooltip formatter={tooltipFormatter} labelFormatter={(l) => format(parseISO(String(l)), 'PPP')} />
        <Legend />
        {/* Benchmark: secondary area */}
        <Area
          type="monotone"
          dataKey="benchmark_cum"
          name="Benchmark"
          stroke="#a78bfa"
          fill="url(#benchGrad)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
          isAnimationActive={true}
        />
        {/* User: main area */}
        <Area
          type="monotone"
          dataKey="user_cum"
          name="AI Performance"
          stroke="#2b8cff"
          fill="url(#userGrad)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### Important UI config choices (implement these)

* `dot={false}` — remove point markers for dense datasets; keep `activeDot` for hover.
* Use `type="monotone"` to smooth line without distorting values.
* Y-axis uses cumulative **multiplier** domain with padding; tick formatter shows **%**.
* Force both series to use same y-axis (multipliers) to avoid misalignment.
* Provide a toggle to switch between `cumulative` and `daily returns` views (separate chart).
* For 7-day view, show markers and small domain; for 90-day use `dot={false}`.

---

## 4 — Region-aware benchmark selection (frontend helper)

Utility: `src/utils/benchmark.ts`

* If `user.region === 'IN'` pick `NIFTY50`
* `US` → `S&P500`
* else → `BTC`
  Agent must:
* Query backend endpoint `GET /api/market/benchmark?symbol=nifty50&range=90d` OR use 3rd-party market data with caching.

---

## 5 — Styling & responsive fixes

* Chart container must have fixed min-height (e.g., `min-height: 320px`) and responsive width.
* Add CSS to limit overflow and avoid overlapping X-axis ticks:

  ```css
  .performance-chart .recharts-wrapper { overflow: visible; }
  .performance-chart .recharts-xAxis text { font-size: 12px; }
  ```
* For narrow widths, reduce tick count using `minTickGap` or `tickCount`.

---

## 6 — Backend benchmark & compounding code examples (pseudo - Node/TS)

```ts
// compute cumulative from daily returns
function computeCum(dailyReturns: number[]) {
  const cum: number[] = [];
  let running = 1.0;
  for (const r of dailyReturns) {
    if (!isFinite(r)) { r = 0; }
    running = running * (1 + r);
    cum.push(running);
  }
  return cum;
}
```

Make sure to return `user_cum` and `benchmark_cum` as **multipliers** (1.0 = no change; 1.23 ~ +23%).

---

## 7 — Handling edge cases & quality

* If `start_of_range` has portfolio=0, use earliest non-zero portfolio as baseline.
* If dataset contains extreme outliers (abs(return) > 200%), mark for manual review and clip visual display to avoid scale explosion. Log anomaly.
* Always use `float64` (double) for cumulative math.
* Add caching for benchmark time-series to avoid rate limits.

---

## 8 — Tests & verification (What agent must run)

1. **Unit tests**

   * `computeCum([0.01, 0.02, -0.01])` => verify precise multipliers
   * missing dates filled

2. **Integration test**

   * `GET /api/performance/user/{userId}?range=90d` returns `points==90` and no `null` values.

3. **UI checks**

   * 7d view: markers visible, no overlap
   * 30d: smooth curve, ticks readable
   * 90d: no point markers, chart not squashed vertically, axis labels show percent values
   * Benchmark line visible and legend correct
   * Alpha value computed and displayed: `(user_cum / benchmark_cum - 1) * 100`

4. **Manual QA**

   * Compare backend cumulative numbers to a spreadsheet calculation for a sample user (spot-check 10 rows).

---

## 9 — Acceptance criteria (Agent must mark done)

* [ ] API returns aligned `date` arrays for user & benchmark (no missing entries).
* [ ] Cumulative calculation uses compounding and matches tests.
* [ ] UI uses shared Y axis with padding and displays % ticks.
* [ ] Dense markers removed for > 60 points; hover activeDot still shows value.
* [ ] No overlapping ticks or clipped labels at common screen widths.
* [ ] Region-aware benchmark auto-select active and visible.
* [ ] All tests pass and PR created + deploy pipeline run.

---

## 10 — Commit / PR message guidelines

```
fix(chart): performance chart — aligned time-series, compounding returns, region-aware benchmark, responsive rendering, remove dense markers
- add API /api/performance/user/{id}
- compute compounded cumulative values on backend
- add PerformanceChart component (Recharts)
- fill missing dates & downsample large series
- add tests and QA checklist
```

---

## 11 — Run commands for agent

```bash
# backend: run tests
cd services/performance
pytest

# frontend: start dev
cd frontend
npm install
npm run dev

# open UI and test:
http://localhost:8083/dashboard (or appropriate route)
```

---

## Notes & Recommendations

* Use consistent units: cumulative **multiplier** (1.0 base). Convert to percent only for axis/tips.
* If you prefer Chart.js, same principles apply: use dual axes only if benchmark uses different units (prefer same unit).
* Keep `dot=false` for > 60 data points to eliminate visual clutter.
* Prefer server-side aggregation for large ranges rather than sending raw trades to client.

---

End of `phase8-chart-fixes.md`.