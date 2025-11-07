import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Shield, AlertTriangle } from 'lucide-react';
import { linkBrokerAccount } from '@/services/brokers/brokerAPI';

interface BrokerConnectModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function BrokerConnectModal({ onClose, onSuccess }: BrokerConnectModalProps) {
  const [broker, setBroker] = useState('BINANCE');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const brokerOptions = [
    { value: 'ZERODHA', label: 'Zerodha', flag: '🇮🇳', region: 'India' },
    { value: 'BINANCE', label: 'Binance', flag: '🌍', region: 'Global' },
    { value: 'ALPACA', label: 'Alpaca', flag: '🇺🇸', region: 'United States' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await linkBrokerAccount('user_123', broker, {
        apiKey,
        apiSecret,
        accessToken: token
      });
      
      console.log(`✅ Successfully linked ${broker} account`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ Failed to link broker account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Link Broker Account
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Broker</label>
              <Select value={broker} onValueChange={setBroker}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brokerOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.flag} {option.label} ({option.region})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <Input
                type="text"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">API Secret</label>
              <Input
                type="password"
                placeholder="Enter your API secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Access Token (Optional)</label>
              <Input
                type="text"
                placeholder="Enter access token if required"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <strong>Security Notice:</strong> Your credentials will be encrypted and stored securely. 
                  Only you can access your broker accounts.
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !apiKey || !apiSecret} className="flex-1">
                {loading ? 'Connecting...' : 'Connect Account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}