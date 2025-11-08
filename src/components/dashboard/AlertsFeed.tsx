export const AlertsFeed = ({ alerts }) => {
  return (
    <div className="rounded-xl border p-4 bg-card shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Recent Alerts</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {alerts?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent alerts</p>
        ) : (
          alerts?.map((alert, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <div className={`w-2 h-2 rounded-full ${alert.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}