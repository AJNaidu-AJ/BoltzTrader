import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Smartphone, Shield, Star } from 'lucide-react'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  listing: {
    id: string
    title: string
    price: number
    currency: string
    avg_rating: number
    total_reviews: number
    creator_id: string
  }
}

export default function PurchaseModal({ isOpen, onClose, listing }: PurchaseModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card')
  const [processing, setProcessing] = useState(false)

  const handlePurchase = async () => {
    setProcessing(true)
    try {
      // Call marketplace API
      const response = await fetch(`/api/marketplace/purchases/${listing.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          payment_method: paymentMethod
        })
      })

      const data = await response.json()

      if (data.payment_url) {
        // Redirect to payment provider
        window.location.href = data.payment_url
      } else if (data.client_secret) {
        // Handle Stripe Elements integration
        console.log('Stripe client secret:', data.client_secret)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Strategy</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Strategy Info */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">{listing.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm">{listing.avg_rating}</span>
              </div>
              <span className="text-sm text-gray-500">
                ({listing.total_reviews} reviews)
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              ${listing.price} {listing.currency}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-medium">Payment Method</h4>
            
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-3 border rounded-lg flex items-center gap-3 transition-colors ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, Amex</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('upi')}
                className={`w-full p-3 border rounded-lg flex items-center gap-3 transition-colors ${
                  paymentMethod === 'upi' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">UPI</div>
                  <div className="text-sm text-gray-500">PhonePe, GPay, Paytm</div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium">Secure Payment</div>
              <div className="text-gray-600">
                Your payment is protected by industry-standard encryption
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Processing...' : `Pay $${listing.price}`}
            </Button>
          </div>

          {/* Terms */}
          <div className="text-xs text-gray-500 text-center">
            By purchasing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}