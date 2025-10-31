import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { multiBrokerService, BrokerConfig, BrokerAccount } from '@/services/multiBrokerService';
import { useToast } from '@/components/ui/use-toast';
import { Link, Unlink, Globe, DollarSign } from 'lucide-react';

export const BrokerConnections = () => {
  const { toast } = useToast();
  const [brokers, setBrokers] = useState<BrokerConfig[]>([]);
  const [activeAccounts, setActiveAccounts] = useState<BrokerAccount[]>([]);
  const [selectedBroker, setSelectedBroker] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    loadBrokers();
    loadActiveAccounts();
  }, [selectedRegion]);

  const loadBrokers = () => {
    const region = selectedRegion === 'all' ? undefined : selectedRegion;
    const brokerList = multiBrokerService.getBrokers(region);
    setBrokers(brokerList);
  };

  const loadActiveAccounts = () => {
    const accounts = multiBrokerService.getActiveAccounts();
    setActiveAccounts(accounts);
  };

  const handleConnect = async () => {
    if (!selectedBroker) {
      toast({ title: "Error", description: "Please select a broker", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const success = await multiBrokerService.connectBroker(selectedBroker, credentials);
      
      if (success) {
        toast({ title: "Success", description: "Broker connected successfully" });
        loadActiveAccounts();
        setCredentials({});
        setSelectedBroker('');
      } else {
        toast({ title: "Error", description: "Failed to connect broker", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Connection failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = (brokerId: string) => {
    multiBrokerService.disconnectBroker(brokerId);
    loadActiveAccounts();
    toast({ title: "Success", description: "Broker disconnected" });
  };

  const getCredentialFields = (brokerId: string) => {
    const broker = brokers.find(b => b.id === brokerId);
    if (!broker) return [];

    switch (broker.authType) {
      case 'api_key':
        return ['apiKey', 'secretKey'];
      case 'oauth':
        return ['username', 'password'];
      case 'token':
        return ['accessToken'];
      default:
        return [];
    }
  };

  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'us', name: 'United States' },
    { id: 'eu', name: 'Europe' },
    { id: 'asia', name: 'Asia Pacific' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Broker Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeAccounts.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Connected Accounts</h4>
              <div className="grid gap-3">
                {activeAccounts.map((account) => (
                  <div key={account.brokerId} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="default">
                        <Link className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                      <div>
                        <p className="font-medium capitalize">{account.brokerId}</p>
                        <p className="text-sm text-muted-foreground">
                          Account: {account.accountId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: account.currency
                          }).format(account.balance)}
                        </p>
                        <p className="text-sm text-muted-foreground">{account.currency}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(account.brokerId)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connect New Broker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Broker</Label>
            <Select value={selectedBroker} onValueChange={setSelectedBroker}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a broker to connect" />
              </SelectTrigger>
              <SelectContent>
                {brokers
                  .filter(broker => !activeAccounts.some(acc => acc.brokerId === broker.id))
                  .map(broker => (
                    <SelectItem key={broker.id} value={broker.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{broker.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {broker.region}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBroker && (
            <div className="space-y-3">
              {getCredentialFields(selectedBroker).map(field => (
                <div key={field}>
                  <Label className="capitalize">
                    {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  <Input
                    type={field.includes('password') ? 'password' : 'text'}
                    value={credentials[field] || ''}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      [field]: e.target.value
                    }))}
                    placeholder={`Enter ${field}`}
                  />
                </div>
              ))}
              
              <Button 
                onClick={handleConnect} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connecting...' : 'Connect Broker'}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {brokers.map(broker => (
              <Card key={broker.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{broker.name}</h4>
                    <Badge variant="outline">{broker.region}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Markets:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {broker.supportedMarkets.map(market => (
                          <Badge key={market} variant="secondary" className="text-xs">
                            {market}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {broker.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};