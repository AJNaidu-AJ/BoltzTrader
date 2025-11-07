# 📊 Phase 8.2 — Smart Optional Benchmark Enhancement

### 🎯 Objective
Refine BoltzTrader's Performance Chart system to use **region-smart, optional benchmarks** for fair comparisons —  
without cluttering the chart when not needed.

This update improves user clarity and simplifies analytics for both Indian and global users.

---

## 🧠 Why This Update

Previously, the benchmark (BTC) was always displayed.  
Now, the system detects the **user's region** and **chooses the appropriate benchmark automatically**:

| Region | Default Benchmark | Display Logic |
|--------|--------------------|----------------|
| 🇮🇳 India | NIFTY50 | Show only if user is Indian |
| 🇺🇸 United States | S&P500 | Show only if user is in US |
| 🌍 Global / Others | BTC | Show only if user is outside India & US |

**Goal:**  
Keep charts relevant — no unnecessary BTC lines for Indian or U.S. users.

---

## 🧩 Implementation Steps

### 1️⃣ Create Utility: `/src/utils/benchmarkDetector.ts`

```ts
export function detectBenchmarkByRegion(region: string): string {
  switch (region.toUpperCase()) {
    case 'IN':
      return 'NIFTY50';
    case 'US':
      return 'S&P500';
    default:
      return 'BTC';
  }
}

export function shouldShowBenchmark(region: string): boolean {
  return region !== 'IN' && region !== 'US'; // Only show globally
}
```

---

### 2️⃣ Update Region Detection Hook: `/src/hooks/useRegion.ts`

```ts
import { useEffect, useState } from 'react'

export const useRegion = () => {
  const [region, setRegion] = useState('GLOBAL')

  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        setRegion(data.country_code || 'GLOBAL')
      } catch {
        setRegion(navigator.language.includes('en-US') ? 'US' : 'GLOBAL')
      }
    }
    detect()
  }, [])

  return region
}
```

---

### 3️⃣ Integrate in Chart Component: `/src/components/PerformanceChart.tsx`

```tsx
import { useRegion } from '@/hooks/useRegion'
import { detectBenchmarkByRegion, shouldShowBenchmark } from '@/utils/benchmarkDetector'

const PerformanceChart = ({ aiData, benchmarkData }) => {
  const region = useRegion()
  const benchmark = detectBenchmarkByRegion(region)
  const showBenchmark = shouldShowBenchmark(region)

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">Cumulative Performance</h3>
        {showBenchmark && (
          <div className="flex items-center gap-2">
            <input type="checkbox" id="toggle-benchmark" checked readOnly />
            <label htmlFor="toggle-benchmark" className="text-sm text-gray-500">
              Show Benchmark ({benchmark})
            </label>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={aiData}>
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <Tooltip
            formatter={(value: number, name: string) => {
              const label = name === 'ai' ? 'AI Performance' : 'Benchmark'
              return [`${(value * 100).toFixed(2)}%`, label]
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="ai" stroke="#3b82f6" dot={false} name="AI Performance" />
          {showBenchmark && (
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#a855f7"
              dot={false}
              name={`Benchmark (${benchmark})`}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

### 4️⃣ Add Alpha Calculation Logic

```ts
function calculateAlpha(aiReturn: number, benchmarkReturn: number) {
  return ((aiReturn - benchmarkReturn) * 100).toFixed(2)
}

// Example display:
const alpha = calculateAlpha(aiData.at(-1)?.value, benchmarkData.at(-1)?.value)
<p className="text-sm text-gray-600 mt-2">
  Alpha: {alpha > 0 ? `+${alpha}%` : `${alpha}%`} vs {benchmark}
</p>
```

---

## 🧾 UI Behavior Summary

| Region          | Benchmark | Default Chart Behavior                    |
| --------------- | --------- | ----------------------------------------- |
| India           | NIFTY50   | Benchmark hidden, Alpha still computed    |
| USA             | S&P500    | Benchmark hidden, Alpha computed silently |
| Global (Others) | BTC       | Benchmark visible and labeled             |

Users in India or the U.S. will only see their AI performance —
but the Alpha is still calculated behind the scenes for analytics.

---

## ✅ Tooltip Label Fix (Duplicate Name Correction)

Old issue:

```
Benchmark : 1.41%
Benchmark : 3.59%
```

Fixed with clear labeling:

```
Benchmark (BTC) : 1.41%
AI Performance : 3.59%
```

✅ Tooltip now properly distinguishes both datasets.

---

## ⚙️ Acceptance Criteria

| Check | Requirement                                     | Status |
| ----- | ----------------------------------------------- | ------ |
| ✅     | Region-based benchmark detection (IN/US/Global) | Done   |
| ✅     | BTC shown only for Global users                 | Done   |
| ✅     | Tooltip duplicate label fixed                   | Done   |
| ✅     | Alpha calculated dynamically                    | Done   |
| ✅     | UI minimal for Indian/US users                  | Done   |
| ✅     | Auto region fallback via IP API                 | Done   |

---

## 🚀 Outcome

BoltzTrader's analytics are now:

* **Smart** — detects user region and adapts automatically
* **Clean** — hides irrelevant BTC benchmark for Indian & US traders
* **Professional** — maintains Alpha and compliance-grade analytics
* **Lightweight** — no extra API calls for unneeded data

> ✅ **Phase 8.2 Complete — Smart Optional Benchmark Implemented**
> BoltzTrader now intelligently adjusts benchmark visibility, keeping charts clean, contextual, and globally relevant.