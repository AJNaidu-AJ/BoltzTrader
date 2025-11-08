import { useState, useEffect } from 'react'
import { TradeCard } from './components/TradeCard'

export default function JournalList() {
  const [entries, setEntries] = useState([])
  const [filters, setFilters] = useState({
    symbol: '',
    strategy: '',
    tags: '',
    dateRange: ''
  })

  useEffect(() => {
    // TODO: Fetch journal entries from API
    fetchEntries()
  }, [filters])

  const fetchEntries = async () => {
    // TODO: Implement API call
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Trade Journal</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm text-muted-foreground">Total Trades</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm text-muted-foreground">Win Rate (30d)</h3>
            <p className="text-2xl font-bold text-green-600">0%</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm text-muted-foreground">Total P&L</h3>
            <p className="text-2xl font-bold">$0</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm text-muted-foreground">Avg Return</h3>
            <p className="text-2xl font-bold">0%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Symbol"
            className="px-3 py-2 border rounded-md"
            value={filters.symbol}
            onChange={(e) => setFilters({...filters, symbol: e.target.value})}
          />
          <input
            type="text"
            placeholder="Strategy"
            className="px-3 py-2 border rounded-md"
            value={filters.strategy}
            onChange={(e) => setFilters({...filters, strategy: e.target.value})}
          />
          <input
            type="text"
            placeholder="Tags"
            className="px-3 py-2 border rounded-md"
            value={filters.tags}
            onChange={(e) => setFilters({...filters, tags: e.target.value})}
          />
          <input
            type="date"
            className="px-3 py-2 border rounded-md"
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
          />
        </div>
      </div>

      {/* Trade Cards */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No journal entries found</p>
        ) : (
          entries.map((entry) => (
            <TradeCard key={entry.id} trade={entry} />
          ))
        )}
      </div>
    </div>
  )
}