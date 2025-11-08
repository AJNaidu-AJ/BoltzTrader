import { useEffect, useState } from 'react'
import { monitorPortfolio } from '@/services/tradeMonitor/monitorService'

export const useTradeMonitor = (userId: string, portfolio: any) => {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const interval = setInterval(async () => {
      await monitorPortfolio(userId, portfolio)
      const res = await fetch(`/api/trade-monitor/events?user=${userId}`)
      const data = await res.json()
      setEvents(data)
    }, 30000)
    return () => clearInterval(interval)
  }, [userId, portfolio])

  return events
}