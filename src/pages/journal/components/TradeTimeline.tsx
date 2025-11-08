interface TradeTimelineProps {
  entry: {
    entry_time: string
    exit_time?: string
    symbol: string
    side: string
    price: number
  }
}

export function TradeTimeline({ entry }: TradeTimelineProps) {
  const entryTime = new Date(entry.entry_time)
  const exitTime = entry.exit_time ? new Date(entry.exit_time) : null

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted"></div>
      
      <div className="space-y-6">
        {/* Entry Event */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            E
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">Trade Entry</h4>
                <p className="text-sm text-muted-foreground">
                  {entry.side} {entry.symbol} at ${entry.price}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {entryTime.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entryTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Event */}
        {exitTime && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              X
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Trade Exit</h4>
                  <p className="text-sm text-muted-foreground">
                    Position closed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {exitTime.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exitTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Open Position Indicator */}
        {!exitTime && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Position Open</h4>
              <p className="text-sm text-muted-foreground">
                Trade is currently active
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}