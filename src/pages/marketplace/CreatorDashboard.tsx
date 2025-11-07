import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Users, Download, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface CreatorStats {
  totalEarnings: number
  totalSales: number
  activeListings: number
  pendingPayout: number
}

interface Listing {
  id: string
  title: string
  price: number
  total_sales: number
  avg_rating: number
  status: string
}

export default function CreatorDashboard() {
  const [stats, setStats] = useState<CreatorStats>({
    totalEarnings: 0,
    totalSales: 0,
    activeListings: 0,
    pendingPayout: 0
  })
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCreatorData()
  }, [])

  const loadCreatorData = async () => {
    try {
      // Load creator listings
      const { data: listingsData } = await supabase
        .from('strategy_marketplace')
        .select('*')
        .eq('creator_id', 'current_user_id') // Replace with actual user ID

      // Load payout data
      const { data: payoutData } = await supabase
        .from('creator_payouts')
        .select('*')
        .eq('creator_id', 'current_user_id')
        .eq('status', 'queued')

      // Fallback demo data
      setStats({
        totalEarnings: 2847.50,
        totalSales: 135,
        activeListings: 3,
        pendingPayout: 425.75
      })

      setListings([
        {
          id: '1',
          title: 'AI Momentum Strategy',
          price: 99.99,
          total_sales: 45,
          avg_rating: 4.5,
          status: 'active'
        },
        {
          id: '2',
          title: 'Mean Reversion Pro',
          price: 149.99,
          total_sales: 23,
          avg_rating: 4.8,
          status: 'active'
        },
        {
          id: '3',
          title: 'Crypto Scalper',
          price: 199.99,
          total_sales: 67,
          avg_rating: 4.2,
          status: 'pending'
        }
      ])
    } catch (error) {
      console.error('Failed to load creator data:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestPayout = async () => {
    try {
      const response = await fetch('/api/marketplace/creators/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        alert('Payout requested successfully!')
        loadCreatorData()
      }
    } catch (error) {
      console.error('Payout request failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-600">Manage your strategy listings and earnings</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Create New Strategy
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.pendingPayout}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={requestPayout}
                disabled={stats.pendingPayout === 0}
              >
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Strategy Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Strategy</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Sales</th>
                  <th className="text-left p-2">Rating</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b">
                    <td className="p-2 font-medium">{listing.title}</td>
                    <td className="p-2">${listing.price}</td>
                    <td className="p-2">{listing.total_sales}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <span>{listing.avg_rating}</span>
                        <span className="text-yellow-400 ml-1">★</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge 
                        variant={listing.status === 'active' ? 'default' : 'secondary'}
                        className={listing.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {listing.status}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}