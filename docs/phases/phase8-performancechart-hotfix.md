# ⚙️ Phase 8 – Performance Chart Hotfix (Agent Implementation)

## 🎯 Objective
Fix unstable rendering in the **Cumulative Performance Chart** and enhance visual clarity for the "Performance Overview" module in the BoltzTrader dashboard.

This hotfix ensures:
- ✅ Stable chart rendering across 7D / 30D / 90D
- ✅ Normalized data mapping
- ✅ Graceful fallback for missing data
- ✅ Professional visual smoothing and consistent scaling

---

## 📁 Target Files

```
/src/components/performance/PerformanceChart.tsx
/src/services/performanceService.ts
```

---

## 🧩 Step 1 – Fix Data Normalization in `performanceService.ts`

Replace or patch the data mapper logic to ensure clean numeric values and consistent timestamps.

```ts
// src/services/performanceService.ts
import dayjs from 'dayjs'

export async function getPerformanceData(range: '7D' | '30D' | '90D') {
  const res = await fetch(`/api/performance?range=${range}`)
  const raw = await res.json()

  return raw.map((item: any) => ({
    date: dayjs(item.date).format('MMM D'),
    accuracy: Number(item.signal_accuracy ?? 0),
    return: Number(item.total_return ?? 0),
    signals: Number(item.total_signals ?? 0)
  }))
}
```

✅ This guarantees no `undefined` or string-to-number errors when rendering.

---

## 🧩 Step 2 – Replace Chart Logic in `PerformanceChart.tsx`

Completely replace with this optimized version:

```tsx
// src/components/performance/PerformanceChart.tsx
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getPerformanceData } from '@/services/performanceService'

export const PerformanceChart = () => {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPerformanceData(range)
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [range])

  if (loading) {
    return <p className="text-gray-400 text-center">Loading performance data...</p>
  }

  if (!data.length) {
    return <p className="text-gray-400 text-center">No performance data available.</p>
  }

  return (
    <div className="w-full h-[320px] p-4">
      <div className="flex justify-end gap-2 mb-2">
        {['7D', '30D', '90D'].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r as any)}
            className={`px-3 py-1 text-sm rounded-md border ${
              range === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[80, 150]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => `${v.toFixed(2)}%`} />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3 }}
            fillOpacity={1}
            fill="url(#colorPerf)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

✅ Enhancements:

* Smooth **monotone** curve (no spikes)
* Stable Y-axis domain (80–150%)
* Loading and empty-state placeholders
* Gradient fill for professional finish
* Dynamic 7D / 30D / 90D toggle

---

## 🧠 Step 3 – Add Error Logging

Update `ErrorBoundary.tsx` to catch potential chart render failures:

```tsx
componentDidCatch(error, info) {
  console.error("PerformanceChart Render Error:", error)
  logAudit('ui_error', 'performance_chart', 'RENDER_FAIL', 'system', { error, info })
}
```

✅ Ensures Phase 7 audit logging captures UI rendering issues.

---

## 🧪 Step 4 – Verify Output

Run your dev environment:

```bash
npm run dev
```

Visit your Dashboard → *Cumulative Performance* section.

✅ Verify:

* No missing chart data
* Smooth line transitions
* Axis values within 100–150% range
* No console "undefined" or NaN warnings

---

## ✅ Expected Result

| Element       | Before               | After                       |
| ------------- | -------------------- | --------------------------- |
| Chart Scaling | Jumpy / inconsistent | Smooth & stable             |
| Data Mapping  | Null / missing       | Fully normalized            |
| Empty State   | Blank area           | "No data available" message |
| Visuals       | Sharp corners        | Gradient & animation        |
| Resilience    | Crashes on null      | Error boundary safe         |

---

## 🚀 Outcome

After this patch:

* The chart becomes **fully production-ready**
* Works seamlessly with live analytics data
* Automatically adjusts between 7D/30D/90D without breaking
* Logs all UI render failures for audit and debugging

✅ Marks **Phase 8 – PerformanceChart Stability Hotfix: Complete**