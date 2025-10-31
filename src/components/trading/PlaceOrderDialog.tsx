import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { brokerService } from '@/services/brokerApi';
import { executionService } from '@/services/executionApi';
import { OrderStatusPanel } from './OrderStatusPanel';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, Loader2 } from 'lucide-react';

interface PlaceOrderDialogProps {
  signal: {
    id: string;
    symbol: string;
    company: string;
    price: number;
    confidence: number;
  };
}

export const PlaceOrderDialog = ({ signal }: PlaceOrderDialogProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  
  const [orderData, setOrderData] = useState({
    side: 'buy' as 'buy' | 'sell',
    quantity: 1,
    orderType: 'market' as 'market' | 'limit',
    price: signal.price,
    broker: 'paper' as 'zerodha' | 'alpaca' | 'paper',
    isPaperTrade: true
  });

  const handlePlaceOrder = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const request = {
        user_id: user.id,
        signal_id: signal.id,
        symbol: signal.symbol,
        side: orderData.side,
        quantity: orderData.quantity,
        order_type: orderData.orderType,
        price: orderData.orderType === 'limit' ? orderData.price : undefined,
        broker: orderData.broker,
        is_paper_trade: orderData.isPaperTrade
      };

      const response = await executionService.executeOrder(request);

      setOrderId(response.order_id);
      setSuccess(`Order queued successfully! Order ID: ${response.order_id.slice(-8)}`);
      setShowOrderStatus(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedValue = orderData.quantity * orderData.price;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <TrendingUp className="h-4 w-4 mr-2" />
          Place Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Order - {signal.symbol}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Signal Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{signal.symbol}</h4>
                <p className="text-sm text-muted-foreground">{signal.company}</p>
              </div>
              <div className="text-right">
                <div className="font-bold">${signal.price.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {(signal.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </div>
          </div>

          {/* Paper Trade Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Paper Trading</Label>
              <p className="text-sm text-muted-foreground">Simulate trades without real money</p>
            </div>
            <Switch
              checked={orderData.isPaperTrade}
              onCheckedChange={(checked) => 
                setOrderData(prev => ({ ...prev, isPaperTrade: checked }))
              }
            />
          </div>

          {/* Order Side */}
          <div className="space-y-2">
            <Label>Order Side</Label>
            <Select 
              value={orderData.side} 
              onValueChange={(value: 'buy' | 'sell') => 
                setOrderData(prev => ({ ...prev, side: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              value={orderData.quantity}
              onChange={(e) => 
                setOrderData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))
              }
            />
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label>Order Type</Label>
            <Select 
              value={orderData.orderType} 
              onValueChange={(value: 'market' | 'limit') => 
                setOrderData(prev => ({ ...prev, orderType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Limit Price */}
          {orderData.orderType === 'limit' && (
            <div className="space-y-2">
              <Label>Limit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={orderData.price}
                onChange={(e) => 
                  setOrderData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
          )}

          {/* Broker Selection */}
          {!orderData.isPaperTrade && (
            <div className="space-y-2">
              <Label>Broker</Label>
              <Select 
                value={orderData.broker} 
                onValueChange={(value: 'zerodha' | 'alpaca' | 'paper') => 
                  setOrderData(prev => ({ ...prev, broker: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zerodha">Zerodha</SelectItem>
                  <SelectItem value="alpaca">Alpaca</SelectItem>
                  <SelectItem value="paper">Paper Trade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Estimated Value */}
          <div className="p-3 border rounded-lg">
            <div className="flex justify-between">
              <span>Estimated Value:</span>
              <span className="font-bold">${estimatedValue.toFixed(2)}</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Order Status Panel */}
          {showOrderStatus && orderId && (
            <OrderStatusPanel 
              orderId={orderId} 
              onClose={() => setShowOrderStatus(false)}
            />
          )}

          {/* Place Order Button */}
          <Button 
            onClick={handlePlaceOrder} 
            disabled={isLoading || !orderData.quantity}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Placing Order...
              </>
            ) : (
              `${orderData.side.toUpperCase()} ${orderData.quantity} ${signal.symbol}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};