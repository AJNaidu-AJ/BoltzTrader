import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star, Search, Filter, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface StrategyListing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  tags: string[]
  avg_rating: number
  total_reviews: number
  total_sales: number
  creator_id: string
}

export default function Explore() {
  const [listings, setListings] = useState<StrategyListing[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListings()
  }, [searchQuery, selectedTags])

  const loadListings = async () => {
    try {
      let query = supabase
        .from('strategy_marketplace')
        .select('*')
        .eq('status', 'active')
        .eq('is_public', true)

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      const { data, error } = await query.order('total_sales', { ascending: false })

      if (error) throw error

      // Fallback data for demo
      setListings(data || [
        {
          id: '1',
          title: 'AI Momentum Strategy',
          description: 'Advanced momentum trading with GPT-4 analysis and real-time market sentiment',
          price: 99.99,
          currency: 'USD',
          tags: ['momentum', 'ai', 'trending'],
          avg_rating: 4.5,
          total_reviews: 12,
          total_sales: 45,
          creator_id: 'creator1'
        },
        {
          id: '2',
          title: 'Mean Reversion Pro',
          description: 'Statistical arbitrage using machine learning and quantitative analysis',
          price: 149.99,
          currency: 'USD',
          tags: ['mean-reversion', 'ml', 'arbitrage'],
          avg_rating: 4.8,
          total_reviews: 8,
          total_sales: 23,
          creator_id: 'creator2'
        },
        {
          id: '3',
          title: 'Crypto Scalper',
          description: 'High-frequency crypto trading bot with advanced risk management',
          price: 199.99,
          currency: 'USD',
          tags: ['crypto', 'scalping', 'hft'],
          avg_rating: 4.2,
          total_reviews: 15,
          total_sales: 67,
          creator_id: 'creator3'
        }
      ])
    } catch (error) {
      console.error('Failed to load listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const allTags = ['momentum', 'ai', 'trending', 'mean-reversion', 'ml', 'arbitrage', 'crypto', 'scalping', 'hft']

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
          <h1 className="text-3xl font-bold text-gray-900">Strategy Marketplace</h1>
          <p className="text-gray-600">Discover and purchase AI-powered trading strategies</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <TrendingUp className="w-4 h-4 mr-2" />
          Sell Strategy
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{listing.title}</CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${listing.price}
                  </div>
                  <div className="text-sm text-gray-500">{listing.currency}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm line-clamp-2">
                {listing.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {listing.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{listing.avg_rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({listing.total_reviews} reviews)
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {listing.total_sales} sales
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No strategies found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}