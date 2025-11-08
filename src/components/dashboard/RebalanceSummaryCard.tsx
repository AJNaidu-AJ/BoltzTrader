export const RebalanceSummaryCard = ({ rebalanceData }) => {
  return (
    <div className="rounded-xl border p-4 bg-card shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Auto-Rebalancing</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Last Rebalance:</span>
          <span className="text-sm font-medium">{rebalanceData?.lastRebalance || 'None'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Actions Today:</span>
          <span className="text-sm font-medium">{rebalanceData?.actionsToday || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span className="text-sm font-medium text-green-600">Active</span>
        </div>
      </div>
    </div>
  )
}