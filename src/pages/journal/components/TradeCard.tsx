import { Link } from 'react-router-dom'

interface TradeCardProps {
  trade: {
    id: string
    symbol: string
    side: string
    size: number
    price: number
    pnl: number
    entry_time: string
    tags: string[]
    notes?: string
  }
}

export function TradeCard({ trade }: TradeCardProps) {
  return (
    <div className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">{trade.symbol}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            trade.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {trade.side}
          </span>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${trade.pnl.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(trade.entry_time).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-muted-foreground">Size</p>
          <p className="font-medium">{trade.size}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="font-medium">${trade.price}</p>
        </div>
      </div>

      {trade.notes && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {trade.notes}
        </p>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {trade.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-muted rounded text-xs">
              {tag}
            </span>
          ))}
          {trade.tags?.length > 3 && (
            <span className="px-2 py-1 bg-muted rounded text-xs">
              +{trade.tags.length - 3}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/journal/${trade.id}`}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
          >
            View
          </Link>
          <button className="px-3 py-1 border rounded text-sm hover:bg-muted">
            Export
          </button>
        </div>
      </div>
    </div>
  )
}